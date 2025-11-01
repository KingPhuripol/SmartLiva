from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import io
import os
from pathlib import Path

# Optional .env loading (python-dotenv)
try:
    from dotenv import load_dotenv  # type: ignore
    _dotenv_loaded = load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / '.env')
except Exception:
    _dotenv_loaded = False
from PIL import Image
import numpy as np
import torch
import albumentations as A
import albumentations.pytorch as AP
import open_clip
from sklearn.preprocessing import StandardScaler
from transformers import AutoModelForImageClassification, AutoImageProcessor, AutoModelForCausalLM, AutoTokenizer

try:
    # Optional dependency: OpenAI
    from openai import OpenAI  # type: ignore
    _openai_available = True
except Exception:
    _openai_available = False

# Import translation routes
try:
    from .translation_routes import router as translation_router
    _translation_available = True
except Exception:
    _translation_available = False

app = FastAPI(title="SmartLiva API", version="0.1.0")

# CORS Configuration for Vercel + Local Dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://*.vercel.app",           # All Vercel deployments
        "https://smartliva.vercel.app",   # Production
        "http://localhost:3000",          # Local dev
        "http://localhost:8000",          # Backend local
        "*"                               # Allow all (can restrict later)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------- Models (Lazy Load) ---------
class ModelBundle:
    clip_model = None
    classification_model = None
    classification_processor = None
    scaler = None
    chat_model = None
    chat_tokenizer = None

BUNDLE = ModelBundle()

label_mapping = {
    0: 'FFC (Fatty Liver, Focal Fatty Change)',
    1: 'FFS (Focal Fatty Sparing)',
    2: 'HCC (Hepatocellular Carcinoma)',
    3: 'Cyst',
    4: 'Hemangioma',
    5: 'Dysplastic Nodule',
    6: 'CCA (Cholangiocarcinoma)'
}


def load_fibrosis_model():
    if BUNDLE.clip_model is None:
        clip_model, _, _ = open_clip.create_model_and_transforms("ViT-B-32", pretrained="openai")
        BUNDLE.clip_model = clip_model
    return BUNDLE.clip_model


def load_classification_model():
    if BUNDLE.classification_model is None:
        processor = AutoImageProcessor.from_pretrained("timm/maxvit_large_tf_224.in1k")
        model = AutoModelForImageClassification.from_pretrained(
            "timm/maxvit_large_tf_224.in1k",
            num_labels=len(label_mapping),
            ignore_mismatched_sizes=True
        )
        model.eval()
        BUNDLE.classification_model = model
        BUNDLE.classification_processor = processor
    return BUNDLE.classification_model, BUNDLE.classification_processor


def load_chat_model():
    if BUNDLE.chat_model is None or BUNDLE.chat_tokenizer is None:
        try:
            tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
            model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
        except Exception:
            tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-small")
            model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-small")
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        model.eval()
        BUNDLE.chat_model = model
        BUNDLE.chat_tokenizer = tokenizer
    return BUNDLE.chat_model, BUNDLE.chat_tokenizer


class CLIPRegressor(torch.nn.Module):
    def __init__(self, clip_model, meta_dim=3, hidden_dim=512):
        super().__init__()
        self.clip_model = clip_model
        self.meta_mlp = torch.nn.Sequential(
            torch.nn.Linear(meta_dim, 64),
            torch.nn.ReLU(inplace=True),
            torch.nn.Linear(64, 64),
            torch.nn.ReLU(inplace=True),
        )
        self.fc_combined = torch.nn.Sequential(
            torch.nn.Linear(512 + 64, hidden_dim),
            torch.nn.ReLU(inplace=True),
            torch.nn.Dropout(p=0.2),
            torch.nn.Linear(hidden_dim, 1)
        )

    def forward(self, images, meta_vec):
        image_features = self.clip_model.visual(images)
        meta_feat = self.meta_mlp(meta_vec)
        combined = torch.cat([image_features, meta_feat], dim=1)
        out = self.fc_combined(combined).squeeze(1)
        return out


def get_scaler():
    if BUNDLE.scaler is None:
        scaler = StandardScaler()
        scaler.mean_ = np.array([5.7033])
        scaler.scale_ = np.array([3.3336])
        BUNDLE.scaler = scaler
    return BUNDLE.scaler


def preprocess_fibrosis_image(image: Image.Image, view_type: str):
    img = np.array(image.convert("L"))
    img = np.stack([img, img, img], axis=-1)
    transform = A.Compose([
        A.GaussianBlur(blur_limit=(3, 7), p=1.0),
        A.Resize(224, 224),
        A.Normalize(
            mean=(0.48145466, 0.4578275, 0.40821073),
            std=(0.26862954, 0.26130258, 0.27577711)
        ),
        AP.ToTensorV2(),
    ])
    transformed = transform(image=img)
    image_tensor = transformed["image"]
    view_mapping = {
        "Intercostal": [1, 0, 0],
        "Subcostal_hepatic_vein": [0, 1, 0],
        "Liver/RK": [0, 0, 1]
    }
    view_vec = torch.tensor(view_mapping[view_type], dtype=torch.float32)
    return image_tensor.unsqueeze(0), view_vec.unsqueeze(0)


def te_to_stage(te_val: float) -> str:
    if 2.4 <= te_val <= 5.9:
        return "F0"
    elif 6.0 <= te_val <= 7.0:
        return "F1"
    elif 7.1 <= te_val <= 8.6:
        return "F2"
    elif 8.7 <= te_val <= 10.2:
        return "F3"
    elif te_val >= 10.3:
        return "F4"
    return "Unknown"


def clamp_te_by_stage(pred_te: float, stage_str: str) -> float:
    if stage_str == "F0-1":
        return float(np.clip(pred_te, 2.4, 7.0))
    if stage_str == "F2":
        return float(np.clip(pred_te, 7.1, 8.6))
    if stage_str == "F3":
        return float(np.clip(pred_te, 8.7, 10.2))
    if stage_str == "F4":
        return float(np.clip(pred_te, 10.3, 46.0))
    return float(pred_te)


class PredictionResponse(BaseModel):
    te_kpa: float
    fibrosis_stage: str
    classification_label: str
    classification_confidence: float


class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    history: list[ChatMessage]
    max_new_tokens: int | None = 200
    temperature: float | None = 0.8


class ChatResponse(BaseModel):
    reply: str
    usage_tokens: int | None = None


def build_openai_messages(history: list[ChatMessage]) -> list[dict]:
    """Convert history to OpenAI chat messages with specialized liver system prompt."""
    system_prompt = (
        "You are Dr. HepaSage, a world-renowned hepatologist providing evidence-based, educational information about liver health. "
        "Focus ONLY on hepatology (hepatitis, fibrosis staging F0-F4, fatty liver, cirrhosis complications, HCC screening, portal hypertension, transplantation, autoimmune/drug-induced liver disease, lifestyle factors). "
        "If user asks something non-liver-related, politely redirect to liver topics. "
        "IMPORTANT: Always respond in the SAME LANGUAGE that the user uses (Thai, German, English, or any other language). "
        "Explain terms clearly, structure answers with short paragraphs or bullet points where helpful, and ALWAYS end with this disclaimer in the user's language: *Medical Disclaimer: This information is for educational purposes only and should not replace professional medical advice. Please consult a qualified healthcare provider.*"
    )
    messages: list[dict] = [{"role": "system", "content": system_prompt}]
    for msg in history:
        role = "user" if msg.role == "user" else "assistant"
        messages.append({"role": role, "content": msg.content})
    return messages


def try_openai_chat(history: list[ChatMessage], max_new_tokens: int, temperature: float) -> tuple[str, int] | None:
    """Attempt to get a reply from OpenAI GPT-4o. Returns (reply, usage_tokens) or None on failure/unavailability."""
    api_key = os.getenv("OPENAI_API_KEY")
    # Use GPT-4o as primary model (more capable than gpt-4o-mini)
    model_name = os.getenv("OPENAI_MODEL", "gpt-4o")
    if not api_key or not _openai_available:
        return None
    try:
        client = OpenAI(api_key=api_key)
        messages = build_openai_messages(history)
        completion = client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=temperature,
            max_tokens=max_new_tokens,
        )
        reply = completion.choices[0].message.content.strip()
        # Ensure disclaimer present
        if "Medical Disclaimer" not in reply:
            reply += "\n\n*Medical Disclaimer: This information is for educational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment.*"
        usage_tokens = (completion.usage.total_tokens  # type: ignore[attr-defined]
                        if hasattr(completion, "usage") and completion.usage and hasattr(completion.usage, "total_tokens") else None)
        return reply, usage_tokens or None
    except Exception as e:
        print(f"OpenAI API error: {str(e)}")
        return None


@app.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    view_type: str = Form("Intercostal"),
    swe_stage: str = Form("Unknown")
):
    # Load image
    content = await file.read()
    image = Image.open(io.BytesIO(content))

    # Fibrosis prediction
    clip_model = load_fibrosis_model()
    regressor = CLIPRegressor(clip_model)
    image_tensor, view_vec = preprocess_fibrosis_image(image, view_type)
    with torch.no_grad():
        pred_scaled = regressor(image_tensor, view_vec).cpu().numpy()
        scaler = get_scaler()
        pred_te = scaler.inverse_transform(pred_scaled.reshape(-1, 1)).item()
    if swe_stage != "Unknown":
        pred_te = clamp_te_by_stage(pred_te, swe_stage)
    fibrosis_stage = te_to_stage(pred_te)

    # Classification
    if image.mode != 'RGB':
        image = image.convert('RGB')
    image_np = np.array(image)
    classification_model, processor = load_classification_model()
    inputs = processor(images=image_np, return_tensors="pt")
    with torch.no_grad():
        outputs = classification_model(**inputs)
        predicted_class = torch.argmax(outputs.logits, dim=1).item()
        confidence = torch.softmax(outputs.logits, dim=1)[0, predicted_class].item()
    predicted_label = label_mapping[predicted_class]

    return PredictionResponse(
        te_kpa=pred_te,
        fibrosis_stage=fibrosis_stage,
        classification_label=predicted_label,
        classification_confidence=confidence,
    )


@app.get("/health")
async def health():
    return {"status": "ok"}


def is_liver_related(text: str) -> bool:
    """Check if the question is liver-related"""
    liver_keywords = [
        "liver", "hepatic", "hepatitis", "cirrhosis", "fatty liver", "fibrosis",
        "liver cancer", "hepatoma", "liver failure", "jaundice", "bile", "biliary",
        "liver disease", "liver function", "liver transplant", "liver biopsy",
        "gallbladder", "liver enzymes", "ALT", "AST", "HCC", "portal hypertension"
    ]
    return any(keyword.lower() in text.lower() for keyword in liver_keywords)


def build_liver_context_prompt(history: list, user_message: str) -> str:
    """Build a specialized liver medical consultation prompt"""
    system_prompt = """You are Dr. HepaSage, a world-renowned hepatologist and liver specialist with over 20 years of clinical experience. You provide comprehensive, evidence-based medical information about liver health.

Your expertise includes:
- Hepatitis (A, B, C, D, E) diagnosis and treatment
- Liver fibrosis staging (F0-F4) and non-invasive assessment
- Fatty liver disease (NAFLD/NASH) management
- Liver cirrhosis complications and care
- Hepatocellular carcinoma (HCC) screening and treatment
- Liver transplantation evaluation
- Drug-induced liver injury
- Autoimmune liver diseases
- Portal hypertension management

Guidelines for responses:
1. Provide detailed, medical-grade information
2. Explain medical terms clearly
3. Include symptoms, causes, diagnosis, and treatment options
4. Mention when to seek immediate medical care
5. Always end with a medical disclaimer
6. If not liver-related, politely redirect to liver topics

Remember: You provide educational information only, not personal medical advice."""

    # Format conversation history
    conversation = []
    for msg in history[-6:]:  # Keep last 6 exchanges
        role = "Patient" if msg.role == "user" else "Dr. HepaSage"
        conversation.append(f"{role}: {msg.content}")
    
    conversation.append(f"Patient: {user_message}")
    conversation.append("Dr. HepaSage:")
    
    return f"{system_prompt}\n\nConsultation:\n" + "\n".join(conversation)


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    if not req.history or req.history[-1].role != "user":
        raise HTTPException(status_code=400, detail="Last message must be from user")
    
    user_message = req.history[-1].content

    # If OpenAI key present, attempt OpenAI first (provides better medical grounding)
    openai_attempt = try_openai_chat(req.history, req.max_new_tokens or 300, req.temperature or 0.7)
    if openai_attempt is not None:
        reply, usage = openai_attempt
        return ChatResponse(reply=reply, usage_tokens=usage)
    
    # Check if liver-related
    if not is_liver_related(user_message):
        return ChatResponse(
            reply="As Dr. HepaSage, I specialize in liver health and hepatology. I can provide detailed information about hepatitis, cirrhosis, fatty liver disease, liver cancer, liver function tests, and liver health maintenance. Could you please ask me something related to liver health instead?",
            usage_tokens=50
        )
    
    model, tokenizer = load_chat_model()
    
    # Build specialized prompt
    prompt = build_liver_context_prompt(req.history[:-1], user_message)
    
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=800)
    with torch.no_grad():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=req.max_new_tokens or 300,
            temperature=req.temperature or 0.7,
            do_sample=True,
            top_p=0.9,
            repetition_penalty=1.1,
            pad_token_id=tokenizer.pad_token_id,
            eos_token_id=tokenizer.eos_token_id,
            no_repeat_ngram_size=2,
        )
    
    text = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    reply = text.split("Dr. HepaSage:")[-1].strip()
    
    if not reply or len(reply) < 20:
        reply = "As your liver specialist, I'd be happy to provide detailed information about your liver health concern. Could you please provide more specific details about the liver condition or symptoms you're interested in learning about?"
    
    # Add medical disclaimer
    reply += "\n\n*Medical Disclaimer: This information is for educational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment.*"
    
    return ChatResponse(reply=reply, usage_tokens=len(output_ids[0]))

# Include translation routes
if _translation_available:
    app.include_router(translation_router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
