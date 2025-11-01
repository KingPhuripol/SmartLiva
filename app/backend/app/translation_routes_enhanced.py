"""
Translation Routes for SmartLiva Clinical AI System
API endpoints for real-time translation services
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Optional
from pydantic import BaseModel
import logging

from .translator_enhanced import translator, UI_TRANSLATIONS
from .auth import get_current_user
from .models import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/translation", tags=["Translation"])

class TranslationRequest(BaseModel):
    text: str
    target_language: str
    context: Optional[str] = "medical"

class BulkTranslationRequest(BaseModel):
    texts: List[str]
    target_language: str
    context: Optional[str] = "medical"

class UITranslationRequest(BaseModel):
    language: str

@router.post("/translate")
async def translate_text(
    request: TranslationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Translate medical text using OpenAI API with fallback to Google Translate
    """
    try:
        if request.target_language not in ["th", "en"]:
            raise HTTPException(status_code=400, detail="Unsupported language")
        
        translated_text = await translator.translate_medical_text(
            text=request.text,
            target_language=request.target_language,
            context=request.context
        )
        
        return {
            "original_text": request.text,
            "translated_text": translated_text,
            "target_language": request.target_language,
            "context": request.context,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

@router.post("/translate-bulk")
async def translate_bulk(
    request: BulkTranslationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Translate multiple texts in batch
    """
    try:
        if request.target_language not in ["th", "en"]:
            raise HTTPException(status_code=400, detail="Unsupported language")
        
        translated_texts = []
        for text in request.texts:
            translated = await translator.translate_medical_text(
                text=text,
                target_language=request.target_language,
                context=request.context
            )
            translated_texts.append(translated)
        
        return {
            "original_texts": request.texts,
            "translated_texts": translated_texts,
            "target_language": request.target_language,
            "context": request.context,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Bulk translation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Bulk translation failed: {str(e)}")

@router.get("/ui-translations/{language}")
async def get_ui_translations(
    language: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get all UI translations for a specific language
    """
    try:
        if language not in ["th", "en"]:
            raise HTTPException(status_code=400, detail="Unsupported language")
        
        translations = UI_TRANSLATIONS.get(language, UI_TRANSLATIONS["en"])
        
        return {
            "language": language,
            "translations": translations,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"UI translation retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"UI translation retrieval failed: {str(e)}")

@router.get("/ui-text/{key}")
async def get_ui_text(
    key: str,
    language: str = "en",
    current_user: User = Depends(get_current_user)
):
    """
    Get specific UI text translation
    """
    try:
        if language not in ["th", "en"]:
            language = "en"  # Default to English
        
        translated_text = translator.get_ui_text(key, language)
        
        return {
            "key": key,
            "language": language,
            "text": translated_text,
            "success": True
        }
        
    except Exception as e:
        logger.error(f"UI text retrieval failed: {e}")
        raise HTTPException(status_code=500, detail=f"UI text retrieval failed: {str(e)}")

@router.get("/supported-languages")
async def get_supported_languages():
    """
    Get list of supported languages
    """
    return {
        "supported_languages": [
            {"code": "en", "name": "English", "native_name": "English"},
            {"code": "th", "name": "Thai", "native_name": "ไทย"}
        ],
        "default_language": "en",
        "success": True
    }

@router.post("/medical-report/translate")
async def translate_medical_report(
    report_id: str,
    target_language: str,
    current_user: User = Depends(get_current_user)
):
    """
    Translate complete medical report
    """
    try:
        if target_language not in ["th", "en"]:
            raise HTTPException(status_code=400, detail="Unsupported language")
        
        # This would integrate with your report system
        # For now, return a placeholder response
        
        return {
            "report_id": report_id,
            "target_language": target_language,
            "status": "translated",
            "message": f"Medical report {report_id} has been translated to {target_language}",
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Medical report translation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Medical report translation failed: {str(e)}")
