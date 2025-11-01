from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from pathlib import Path
from typing import List, Optional

# Optional .env loading (python-dotenv)
try:
    from dotenv import load_dotenv  # type: ignore
    _dotenv_loaded = load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / '.env')
except Exception:
    _dotenv_loaded = False

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

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://*.vercel.app",
        "https://smartliva.vercel.app",
        "https://*.railway.app",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------- Pydantic Models ---------
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    history: List[Message]
    max_new_tokens: Optional[int] = 300
    temperature: Optional[float] = 0.7

class ChatResponse(BaseModel):
    reply: str
    usage_tokens: Optional[int] = None

# --------- Health Check ---------
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "openai_available": _openai_available,
        "translation_available": _translation_available
    }

# --------- Helper Functions ---------
def is_liver_related(text: str) -> bool:
    """Check if the question is liver-related"""
    liver_keywords = [
        "liver", "hepat", "cirrhosis", "fibrosis", "hcc", "hepatocellular",
        "fatty liver", "nafld", "nash", "alt", "ast", "bilirubin",
        "jaundice", "ascites", "portal hypertension", "varices",
        "hepatitis", "cholangiocarcinoma", "biliary", "gallbladder",
        "transplant", "fibroscan", "elastography", "steatosis",
        "ตับ", "ตับอักเสบ", "ตับแข็ง", "มะเร็งตับ", "ไขมันพอกตับ"
    ]
    text_lower = text.lower()
    return any(kw in text_lower for kw in liver_keywords)

def try_openai_chat(history: List[Message], max_tokens: int, temperature: float):
    """Try OpenAI GPT, return (reply, tokens) or None"""
    if not _openai_available:
        return None
    
    api_key = os.environ.get("OPENAI_API_KEY")
    model_name = os.environ.get("OPENAI_MODEL", "gpt-3.5-turbo")
    
    if not api_key:
        return None
    
    try:
        client = OpenAI(api_key=api_key)
        
        # System prompt
        system_prompt = (
            "You are Dr. HepaSage, a world-renowned hepatologist providing evidence-based, educational information about liver health. "
            "Focus ONLY on hepatology (hepatitis, fibrosis staging F0-F4, fatty liver, cirrhosis complications, HCC screening, portal hypertension, transplantation, autoimmune/drug-induced liver disease, lifestyle factors). "
            "If user asks something non-liver-related, politely redirect to liver topics. "
            "IMPORTANT: Always respond in the SAME LANGUAGE that the user uses (Thai, German, English, or any other language). "
            "Explain terms clearly, structure answers with short paragraphs or bullet points where helpful, and ALWAYS end with this disclaimer in the user's language: *Medical Disclaimer: This information is for educational purposes only and should not replace professional medical advice. Please consult a qualified healthcare provider.*"
        )
        
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({"role": msg.role, "content": msg.content})
        
        response = client.chat.completions.create(
            model=model_name,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        reply = response.choices[0].message.content
        usage = response.usage.total_tokens if response.usage else 0
        
        return (reply, usage)
    except Exception as e:
        print(f"OpenAI error: {e}")
        return None

# --------- Chat Endpoint ---------
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    if not req.history or req.history[-1].role != "user":
        raise HTTPException(status_code=400, detail="Last message must be from user")
    
    user_message = req.history[-1].content
    
    # Check if liver-related
    if not is_liver_related(user_message):
        return ChatResponse(
            reply="As Dr. HepaSage, I specialize in liver health and hepatology. I can provide detailed information about hepatitis, cirrhosis, fatty liver disease, liver cancer, liver function tests, and liver health maintenance. Could you please ask me something related to liver health instead?",
            usage_tokens=50
        )
    
    # Try OpenAI
    openai_attempt = try_openai_chat(req.history, req.max_new_tokens or 300, req.temperature or 0.7)
    if openai_attempt is not None:
        reply, usage = openai_attempt
        return ChatResponse(reply=reply, usage_tokens=usage)
    
    # Fallback if OpenAI not available
    return ChatResponse(
        reply="OpenAI API is not configured. Please set OPENAI_API_KEY environment variable to use Dr. HepaSage chat feature.",
        usage_tokens=0
    )

# Include translation routes
if _translation_available:
    app.include_router(translation_router)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
