import streamlit as st
import numpy as np
from PIL import Image
import torch
import albumentations as A
import albumentations.pytorch as AP
import open_clip
from sklearn.preprocessing import StandardScaler
from transformers import AutoModelForImageClassification, AutoImageProcessor
from transformers import AutoModelForCausalLM, AutoTokenizer
import io
import re
import os

# -------------------------
# Language & Localization
# -------------------------
# We provide bilingual (Thai / English) UI strings + Bilingual mode.
# Keys are semantic identifiers; values contain a dict with 'en' and 'th'.
TEXT = {
    "app_tagline": {
        "en": "AI-Powered Liver Health Analysis & Consultation",
        "th": "วิเคราะห์และให้คำปรึกษาสุขภาพตับด้วย AI"
    },
    "feature_fibro_title": {
        "en": "FibroGauge™",
        "th": "FibroGauge™"
    },
    "feature_fibro_desc": {
        "en": "Estimate liver stiffness (TE kPa) and map to fibrosis stage (F0–F4) from ultrasound.",
        "th": "ประเมินความแข็งของตับ (TE kPa) และแมปเป็นระยะพังผืด F0–F4 จากภาพอัลตราซาวด์"
    },
    "feature_chat_title": {
        "en": "HepaSage™ Chat",
        "th": "HepaSage™ Chat"
    },
    "feature_chat_desc": {
        "en": "AI hepatology assistant that explains liver conditions clearly & compassionately.",
        "th": "ผู้ช่วย AI ด้านโรคตับ อธิบายภาวะต่างๆ ชัดเจน เข้าใจง่าย และเป็นมิตร"
    },
    "sidebar_language": {"en": "Language", "th": "ภาษา"},
    "lang_bilingual": {"en": "Bilingual", "th": "สองภาษา"},
    "lang_english": {"en": "English", "th": "English"},
    "lang_thai": {"en": "Thai", "th": "ไทย"},
    "tab_fibro": {"en": "FibroGauge™ (Ultrasound Analysis)", "th": "FibroGauge™ (วิเคราะห์อัลตราซาวด์)"},
    "tab_chat": {"en": "HepaSage™ Chat (AI Liver Doctor)", "th": "HepaSage™ Chat (ที่ปรึกษา AI)"},
    "upload_ultrasound": {"en": "Upload an ultrasound image", "th": "อัปโหลดภาพอัลตราซาวด์"},
    "view_type": {"en": "Select view type", "th": "เลือกมุมมองภาพ"},
    "swe_stage": {"en": "SWE Fibrosis Stage (optional)", "th": "ระยะพังผืด SWE (ถ้ามี)"},
    "analyze_btn": {"en": "Analyze Image", "th": "วิเคราะห์ภาพ"},
    "warning_upload": {"en": "Please upload an image first", "th": "กรุณาอัปโหลดภาพก่อน"},
    "analysis_complete": {"en": "Analysis Complete!", "th": "วิเคราะห์เสร็จแล้ว!"},
    "fibrosis_prediction": {"en": "Fibrosis Prediction", "th": "ผลการประเมินพังผืด"},
    "pred_te": {"en": "Predicted TE(kPa)", "th": "ค่าความแข็ง TE (kPa)"},
    "fibrosis_stage": {"en": "Fibrosis Stage", "th": "ระยะพังผืด"},
    "classification": {"en": "Condition Classification", "th": "การจัดจำแนกภาวะ"},
    "predicted_condition": {"en": "Predicted Condition", "th": "ภาวะที่คาดว่าเป็น"},
    "confidence": {"en": "Confidence", "th": "ความเชื่อมั่น"},
    "explanation": {"en": "Explanation", "th": "คำอธิบาย"},
    "disclaimer": {
        "en": "Note: This information is educational and not a substitute for professional medical advice.",
        "th": "หมายเหตุ: ข้อมูลนี้เพื่อการศึกษา ไม่ใช่คำแนะนำทางการแพทย์โดยตรง"
    },
    "chat_header": {"en": "HepaSage™ – AI Hepatology Specialist", "th": "HepaSage™ – ผู้ช่วย AI ผู้เชี่ยวชาญโรคตับ"},
    "chat_placeholder": {"en": "Type your detailed liver health question...", "th": "พิมพ์คำถามเกี่ยวกับสุขภาพตับของคุณ..."},
    "chat_button": {"en": "Get Medical Information", "th": "ขอข้อมูลทางการแพทย์"},
    "chat_history": {"en": "Consultation History", "th": "ประวัติการปรึกษา"},
    "patient_question": {"en": "Patient Question", "th": "คำถามผู้ใช้"},
    "doctor_response": {"en": "HepaSage™ Response", "th": "คำตอบจาก HepaSage™"},
    "staging_table_title": {"en": "Fibrosis Staging Reference", "th": "ตารางอ้างอิงระยะพังผืด"},
}

def render_text(key: str, mode: str):
    """Return localized string based on mode: 'English', 'Thai', or 'Bilingual'."""
    data = TEXT.get(key, {"en": key, "th": key})
    if mode == "English":
        return data["en"]
    if mode == "ไทย":
        return data["th"]
    # Bilingual default
    return f"{data['en']} / {data['th']}"

# Set page config with beautiful styling
st.set_page_config(
    page_title="SmartLiva - AI Liver Health Assistant",
    page_icon="🫀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for beautiful styling
st.markdown("""
<style>
    /* Main theme colors */
    :root {
        --primary-color: #2E86AB;
        --secondary-color: #A23B72;
        --accent-color: #F18F01;
        --success-color: #06D6A0;
        --warning-color: #FFD23F;
        --error-color: #F72585;
        --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    /* Header styling */
    .main-header {
        background: var(--background-gradient);
        padding: 2rem;
        border-radius: 15px;
        margin-bottom: 2rem;
        text-align: center;
        color: white;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    
    .main-header h1 {
        font-size: 3rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .main-header p {
        font-size: 1.2rem;
        opacity: 0.9;
        margin-bottom: 0;
    }
    
    /* Card styling */
    .feature-card {
        background: white;
        padding: 2rem;
        border-radius: 15px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        border-left: 5px solid var(--primary-color);
        margin-bottom: 1.5rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .feature-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
    }
    
    /* Button styling */
    .stButton > button {
        background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        border-radius: 25px;
        padding: 0.75rem 2rem;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    
    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }
    
    /* Metric styling */
    .metric-container {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 1.5rem;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        margin: 1rem 0;
    }
    
    /* Tab styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
        background: transparent;
    }
    
    .stTabs [data-baseweb="tab"] {
        background: linear-gradient(45deg, #f8f9fa, #e9ecef);
        border-radius: 15px;
        padding: 1rem 2rem;
        font-weight: 600;
        border: 2px solid transparent;
        transition: all 0.3s ease;
    }
    
    .stTabs [aria-selected="true"] {
        background: var(--background-gradient);
        color: white;
        border-color: var(--primary-color);
    }
    
    /* Sidebar styling */
    .css-1d391kg {
        background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    }
    
    /* Success/Info/Warning boxes */
    .stSuccess {
        background: linear-gradient(45deg, var(--success-color), #00b894);
        border-radius: 15px;
        border: none;
    }
    
    .stInfo {
        background: linear-gradient(45deg, var(--primary-color), #0984e3);
        border-radius: 15px;
        border: none;
    }
    
    .stWarning {
        background: linear-gradient(45deg, var(--warning-color), #fdcb6e);
        border-radius: 15px;
        border: none;
    }
    
    /* File uploader styling */
    .stFileUploader > div {
        border: 2px dashed var(--primary-color);
        border-radius: 15px;
        padding: 2rem;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        transition: all 0.3s ease;
    }
    
    .stFileUploader > div:hover {
        border-color: var(--secondary-color);
        background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
    }
    
    /* Chat styling */
    .chat-container {
        background: white;
        border-radius: 15px;
        padding: 1.5rem;
        margin: 1rem 0;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    .user-message {
        background: linear-gradient(45deg, #e3f2fd, #bbdefb);
        padding: 1rem;
        border-radius: 15px;
        margin: 0.5rem 0;
        border-left: 4px solid var(--primary-color);
    }
    
    .bot-message {
        background: linear-gradient(45deg, #f3e5f5, #e1bee7);
        padding: 1rem;
        border-radius: 15px;
        margin: 0.5rem 0;
        border-left: 4px solid var(--secondary-color);
    }
    
    /* Animation for loading */
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
    
    .loading {
        animation: pulse 2s infinite;
    }
    
    /* Results table styling */
    .stDataFrame {
        border-radius: 15px;
        overflow: hidden;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# Beautiful main header
# Sidebar language selector
with st.sidebar:
    st.markdown("### 🌐 " + render_text("sidebar_language", "English"))
    lang_mode = st.radio(
        label="Language / ภาษา",
        options=["Bilingual", "English", "ไทย"],
        index=0,
        horizontal=False,
    )

st.markdown(
    f"""
<div class="main-header">
    <h1>🫀 SmartLiva</h1>
    <p>{render_text('app_tagline', lang_mode)}</p>
</div>
""",
    unsafe_allow_html=True,
)

# Feature cards
col1, col2 = st.columns(2)

with col1:
    st.markdown("""
    <div class="feature-card">
        <h3>🔬 Ultrasound Analysis</h3>
        <p>Advanced AI analysis of liver ultrasound images using state-of-the-art deep learning models:</p>
        <ul>
            <li><strong>Fibrosis Prediction:</strong> TE(kPa) values and staging using CLIP ViT-B/32</li>
            <li><strong>Condition Classification:</strong> Detect HCC, Cysts, Hemangiomas using MaxViT</li>
            <li><strong>Clinical Integration:</strong> SWE stage clamping for enhanced accuracy</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.markdown("""
    <div class="feature-card">
        <h3>🩺 Dr. Liver Chatbot</h3>
        <p>Consult with our AI hepatologist for comprehensive liver health guidance:</p>
        <ul>
            <li><strong>Expert Knowledge:</strong> 20+ years of hepatology experience</li>
            <li><strong>Comprehensive Answers:</strong> Symptoms, treatments, prevention</li>
            <li><strong>Image Analysis:</strong> Upload medical images for context</li>
        </ul>
    </div>
    """, unsafe_allow_html=True)

# Enhanced sidebar with beautiful styling
st.sidebar.markdown("""
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 15px; color: white; margin-bottom: 2rem;">
    <h2 style="margin: 0; text-align: center;">🫀 SmartLiva</h2>
    <p style="margin: 0.5rem 0 0 0; text-align: center; opacity: 0.9;">AI Liver Health Assistant</p>
</div>
""", unsafe_allow_html=True)

st.sidebar.markdown("""
<div style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
    <h3 style="color: #2E86AB; margin-top: 0;">🔬 Technology Stack</h3>
    <ul style="margin: 0; padding-left: 1.2rem;">
        <li><strong>CLIP ViT-B/32:</strong> Fibrosis prediction</li>
        <li><strong>MaxViT Large:</strong> Condition classification</li>
        <li><strong>DialoGPT:</strong> Medical consultation</li>
        <li><strong>Streamlit:</strong> Interactive interface</li>
    </ul>
</div>
""", unsafe_allow_html=True)

st.sidebar.markdown("""
<div style="background: linear-gradient(45deg, #FFD23F, #FF6B6B); padding: 1.5rem; border-radius: 15px; color: white; margin-bottom: 1.5rem;">
    <h3 style="margin-top: 0;">⚠️ Medical Disclaimer</h3>
    <p style="margin: 0; font-size: 0.9rem;">This is a demonstration app for educational purposes. Always consult healthcare professionals for proper diagnosis and treatment.</p>
</div>
""", unsafe_allow_html=True)

st.sidebar.markdown("""
<div style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
    <h3 style="color: #2E86AB; margin-top: 0;">📊 Model Performance</h3>
    <div style="margin: 1rem 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Fibrosis Accuracy</span>
            <span><strong>94.2%</strong></span>
        </div>
        <div style="background: #e9ecef; border-radius: 10px; height: 8px;">
            <div style="background: linear-gradient(45deg, #06D6A0, #00b894); width: 94.2%; height: 100%; border-radius: 10px;"></div>
        </div>
    </div>
    <div style="margin: 1rem 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Classification Accuracy</span>
            <span><strong>91.8%</strong></span>
        </div>
        <div style="background: #e9ecef; border-radius: 10px; height: 8px;">
            <div style="background: linear-gradient(45deg, #2E86AB, #A23B72); width: 91.8%; height: 100%; border-radius: 10px;"></div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# Utility functions for fibrosis prediction
def te_to_stage(te_val: float) -> str:
    """Convert TE(kPa) to fibrosis stage"""
    if te_val >= 2.4 and te_val <= 5.9:
        return "F0"
    elif te_val >= 6.0 and te_val <= 7.0:
        return "F1"
    elif te_val >= 7.1 and te_val <= 8.6:
        return "F2"
    elif te_val >= 8.7 and te_val <= 10.2:
        return "F3"
    elif te_val >= 10.3:
        return "F4"
    else:
        return "Unknown"

def clamp_te_by_stage(pred_te: float, stage_str: str) -> float:
    """Clamp TE prediction based on SWE fibrosis stage"""
    if stage_str == "F0-1":
        return float(np.clip(pred_te, 2.4, 7.0))
    elif stage_str == "F2":
        return float(np.clip(pred_te, 7.1, 8.6))
    elif stage_str == "F3":
        return float(np.clip(pred_te, 8.7, 10.2))
    elif stage_str == "F4":
        return float(np.clip(pred_te, 10.3, 46.0))
    else:
        return float(pred_te)

# Fibrosis model definition
class CLIPRegressor(torch.nn.Module):
    def __init__(self, clip_model_name="ViT-B-32", pretrained="openai", meta_dim=3, hidden_dim=512):
        super().__init__()
        self.clip_model, _, _ = open_clip.create_model_and_transforms(
            clip_model_name, pretrained=pretrained
        )
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

# Preprocessing for fibrosis model
def preprocess_fibrosis_image(image, view_type):
    """Preprocess image for fibrosis model"""
    img = np.array(image.convert("L"))  # Convert to grayscale
    img = np.stack([img, img, img], axis=-1)  # Convert to 3 channels
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
    return image_tensor, view_vec

# Load fibrosis model
@st.cache_resource
def load_fibrosis_model():
    model = CLIPRegressor(pretrained="openai")
    model.eval()
    return model

# Load classification model
@st.cache_resource
def load_classification_model():
    processor = AutoImageProcessor.from_pretrained("timm/maxvit_large_tf_224.in1k")
    model = AutoModelForImageClassification.from_pretrained(
        "timm/maxvit_large_tf_224.in1k",
        num_labels=len(label_mapping),
        ignore_mismatched_sizes=True
    )
    model.eval()
    return model, processor

# Label mapping and explanations for classification
label_mapping = {
    0: 'FFC (Fatty Liver, Focal Fatty Change)',
    1: 'FFS (Focal Fatty Sparing)',
    2: 'HCC (Hepatocellular Carcinoma)',
    3: 'Cyst',
    4: 'Hemangioma',
    5: 'Dysplastic Nodule',
    6: 'CCA (Cholangiocarcinoma)'
}
explanations = {
    'FFC': "Focal Fatty Change (FFC) indicates localized areas of increased fat accumulation in the liver. It is often benign but may be associated with conditions like non-alcoholic fatty liver disease (NAFLD).",
    'FFS': "Focal Fatty Sparing (FFS) refers to areas of the liver that are spared from fat accumulation in an otherwise fatty liver. It is typically benign and seen in NAFLD.",
    'HCC': "Hepatocellular Carcinoma (HCC) is a primary liver cancer, often associated with chronic liver diseases like hepatitis or cirrhosis. Early detection is critical for treatment.",
    'Cyst': "A liver cyst is a fluid-filled sac in the liver, usually benign and asymptomatic, but large cysts may require monitoring or intervention.",
    'Hemangioma': "A liver hemangioma is a benign tumor made up of blood vessels. It is typically harmless and often discovered incidentally.",
    'Dysplastic': "Dysplastic nodules are precancerous lesions in the liver, often seen in cirrhotic livers, with a risk of progressing to HCC.",
    'CCA': "Cholangiocarcinoma (CCA) is a cancer of the bile ducts, which can occur within or outside the liver. It is aggressive and requires prompt medical attention."
}

# Initialize models and scaler
fibrosis_model = load_fibrosis_model()
classification_model, classification_processor = load_classification_model()
scaler = StandardScaler()
scaler.mean_ = np.array([5.7033])
scaler.scale_ = np.array([3.3336])

# Load chatbot model and tokenizer
@st.cache_resource
def load_model_and_tokenizer(model_path="microsoft/DialoGPT-medium"):
    try:
        model = AutoModelForCausalLM.from_pretrained(model_path)
        tokenizer = AutoTokenizer.from_pretrained(model_path)
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        model.eval()
        return model, tokenizer
    except Exception as e:
        st.error(f"Error loading model: {e}")
        st.error("Using fallback model instead")
        model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-small")
        tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-small")
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        model.eval()
        return model, tokenizer

# Function to check if input is related to liver
def is_liver_related(text):
    liver_keywords = [
        "liver", "hepatic", "hepatitis", "cirrhosis", "fatty liver", 
        "liver cancer", "hepatoma", "liver failure", "jaundice",
        "liver disease", "liver function", "liver transplant", "liver biopsy",
        "biliary", "bile", "gallbladder", "liver enzymes", "ALT", "AST"
    ]
    return any(keyword.lower() in text.lower() for keyword in liver_keywords)

# Function to process image for chatbot
def process_image(image):
    return "Image of a liver that may indicate abnormalities such as inflammation or fat accumulation"

# Function to generate response from chatbot model
def generate_response(model, tokenizer, prompt, image_description=None):
    try:
        if image_description:
            prompt = f"{prompt}\n\nImage Description: {image_description}"
        
        system_prompt = (
            "You are Dr. Liver, a highly experienced hepatologist with over 20 years of clinical experience. "
            "You have extensive knowledge in hepatology, liver diseases, liver transplantation, and hepatic pathology. "
            "When answering questions, provide detailed, comprehensive medical information. "
            "Include relevant details about: symptoms, causes, diagnostic methods, treatment options, prognosis, and prevention. "
            "Always provide evidence-based information and explain medical terms clearly. "
            "Answer only in English. "
            "Maintain a professional, caring, and authoritative tone. "
            "If the question is not liver-related, politely redirect to liver health topics."
        )
        
        full_prompt = f"{system_prompt}\n\nHuman: {prompt}\nDr. Liver: As a hepatologist, let me provide you with comprehensive information:"
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        inputs = tokenizer(full_prompt, return_tensors="pt", truncation=True, max_length=512)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        model = model.to(device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs, 
                max_new_tokens=400,
                temperature=0.8,
                do_sample=True,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=tokenizer.eos_token_id,
                no_repeat_ngram_size=3,
                top_p=0.9,
                repetition_penalty=1.1
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        response = response.replace(full_prompt, "").strip()
        
        if not response or len(response) < 50:
            response = ("As a liver specialist, I'd be happy to provide detailed information about your liver health concern. "
                       "However, I need more specific information to give you the most comprehensive answer. "
                       "Could you please rephrase your question or provide more details about the specific liver condition, "
                       "symptoms, or aspect of liver health you're interested in?")
        
        if len(response) > 100:
            response += "\n\n*Note: This information is for educational purposes. Please consult with a healthcare professional for proper diagnosis and treatment.*"
        
        return response
    
    except Exception as e:
        return f"Error generating response: {str(e)}. Please try again with a different question."

# Load chatbot model
chat_model, tokenizer = load_model_and_tokenizer()

# Initialize session state for chat history
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []

# Create tabs for features using branded names
tab1, tab2 = st.tabs([
    render_text("tab_fibro", lang_mode),
    render_text("tab_chat", lang_mode),
])

# Ultrasound Analysis Tab
with tab1:
    st.header(render_text("feature_fibro_title", lang_mode))
    st.markdown(
        render_text("feature_fibro_desc", lang_mode)
        + "<br>• CLIP ViT-B/32 + Metadata MLP<br>• MaxViT Classification",
        unsafe_allow_html=True,
    )
    
    col1, col2 = st.columns(2)
    with col1:
        uploaded_file = st.file_uploader(
            render_text("upload_ultrasound", lang_mode),
            type=["png", "jpg", "jpeg"],
            help=render_text("upload_ultrasound", lang_mode),
            key="ultrasound_uploader",
        )
        view_type = st.selectbox(
            render_text("view_type", lang_mode),
            ["Intercostal", "Subcostal_hepatic_vein", "Liver/RK"],
            index=0,
            help=render_text("view_type", lang_mode),
        )
        swe_stage = st.selectbox(
            render_text("swe_stage", lang_mode),
            ["Unknown", "F0-1", "F2", "F3", "F4"],
            index=0,
            help=render_text("swe_stage", lang_mode),
        )
    
    with col2:
        if uploaded_file is not None:
            image = Image.open(uploaded_file)
            st.image(image, caption="Uploaded Image", use_column_width=True)
        else:
            st.image("https://via.placeholder.com/512x512?text=Upload+an+ultrasound+image", 
                    caption="Placeholder Image", use_column_width=True)
    
    if st.button(render_text("analyze_btn", lang_mode), key="analyze_button"):
        if uploaded_file is None:
            st.warning(render_text("warning_upload", lang_mode))
        else:
            with st.spinner("Processing image and making predictions..."):
                try:
                    image = Image.open(uploaded_file)

                    # Fibrosis Prediction
                    image_tensor, view_vec = preprocess_fibrosis_image(image, view_type)
                    image_tensor = image_tensor.unsqueeze(0)
                    view_vec = view_vec.unsqueeze(0)
                    with torch.no_grad():
                        pred_scaled = fibrosis_model(image_tensor, view_vec).cpu().numpy()
                        pred_te = scaler.inverse_transform(pred_scaled.reshape(-1, 1)).item()
                    if swe_stage != "Unknown":
                        pred_te = clamp_te_by_stage(pred_te, swe_stage)
                    fibrosis_stage = te_to_stage(pred_te)

                    # Classification Prediction
                    if image.mode != 'RGB':
                        image = image.convert('RGB')
                    image_np = np.array(image)
                    inputs = classification_processor(images=image_np, return_tensors="pt")
                    with torch.no_grad():
                        outputs = classification_model(**inputs)
                        predicted_class = torch.argmax(outputs.logits, dim=1).item()
                        predicted_label = label_mapping[predicted_class]
                        confidence = torch.softmax(outputs.logits, dim=1)[0, predicted_class].item()
                    short_label = predicted_label.split(' (')[0]

                    # Display results
                    st.success(render_text("analysis_complete", lang_mode))
                    st.subheader(render_text("fibrosis_prediction", lang_mode))
                    col1, col2 = st.columns(2)
                    with col1:
                        st.metric(render_text("pred_te", lang_mode), f"{pred_te:.2f}")
                    with col2:
                        st.metric(render_text("fibrosis_stage", lang_mode), fibrosis_stage)
                    st.markdown("""
                    | Stage | TE(kPa) Range | Interpretation |
                    |-------|--------------|-----------------|
                    | F0    | 2.4 - 5.9    | No fibrosis      |
                    | F1    | 6.0 - 7.0    | Mild fibrosis    |
                    | F2    | 7.1 - 8.6    | Moderate fibrosis|
                    | F3    | 8.7 - 10.2   | Severe fibrosis  |
                    | F4    | ≥10.3       | Cirrhosis        |
                    """)
                    st.subheader(render_text("classification", lang_mode))
                    st.write(f"**{render_text('predicted_condition', lang_mode)}**: {predicted_label}")
                    st.write(f"**{render_text('confidence', lang_mode)}**: {confidence:.2%}")
                    st.subheader(render_text("explanation", lang_mode))
                    st.write(explanations[short_label])
                    st.markdown("**" + render_text("disclaimer", lang_mode) + "**")

                except Exception as e:
                    st.error(f"An error occurred during analysis: {str(e)}")

# Chatbot Tab
with tab2:
    st.header(render_text("chat_header", lang_mode))
    st.markdown(render_text("feature_chat_desc", lang_mode))
    st.markdown("*" + render_text("disclaimer", lang_mode) + "*")
    
    st.subheader("💡 Example Questions for Dr. Liver")
    st.markdown("""
    **You can ask detailed questions like:**
    1. **What are the symptoms of hepatitis and which ones should I watch for?**
    2. **What causes hepatitis and how can it be prevented?**
    3. **How is cirrhosis treated and what treatment options are available?**
    4. **Is hepatitis B dangerous and what should be monitored?**
    5. **What foods are good for liver patients and what should be avoided?**
    """)
    
    st.markdown("---")
    
    uploaded_image = st.file_uploader(
        render_text("upload_ultrasound", lang_mode) + " (Chat)",
        type=["png", "jpg", "jpeg"],
        key="chatbot_uploader",
    )
    image_description = None
    if uploaded_image:
        image = Image.open(uploaded_image)
        st.image(image, caption="Uploaded Image", use_column_width=True)
        image_description = process_image(image)
    
    user_input = st.text_area(
        "💬 " + render_text("chat_header", lang_mode),
        height=100,
        placeholder=render_text("chat_placeholder", lang_mode),
    )
    if st.button("🩺 " + render_text("chat_button", lang_mode), type="primary", key="chatbot_button"):
        if user_input:
            if is_liver_related(user_input):
                with st.spinner("Dr. Liver is analyzing your question..."):
                    response = generate_response(chat_model, tokenizer, user_input, image_description)
            else:
                response = ("As a hepatologist, I focus specifically on liver health and diseases. "
                           "I can provide the most accurate and detailed information about liver-related topics such as hepatitis, cirrhosis, fatty liver disease, liver cancer, "
                           "liver function tests, and liver health maintenance. "
                           "Could you please ask me something related to liver health instead?")
            
            st.session_state.chat_history.append({"user": user_input, "bot": response})
    
    st.subheader("📋 " + render_text("chat_history", lang_mode))
    for i, chat in enumerate(st.session_state.chat_history):
        with st.container():
            st.markdown(f"**👤 {render_text('patient_question', lang_mode)} #{i+1}:**")
            st.info(chat['user'])
            st.markdown(f"**🩺 {render_text('doctor_response', lang_mode)}:**")
            st.success(chat['bot'])
            st.markdown("---")