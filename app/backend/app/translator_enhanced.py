"""
Enhanced Translation Service for SmartLiva Clinical AI System
Supports real-time translation using OpenAI API for medical accuracy
"""

import os
import json
from typing import Dict, List, Optional
from openai import OpenAI
from googletrans import Translator
import logging

logger = logging.getLogger(__name__)

class SmartLivaTranslator:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.google_translator = Translator()
        self.supported_languages = ["th", "en"]
        
        # Medical terminology mapping for accuracy
        self.medical_terms = {
            "en": {
                "fibrosis": "fibrosis",
                "cirrhosis": "cirrhosis", 
                "hepatocellular carcinoma": "hepatocellular carcinoma",
                "liver stiffness": "liver stiffness",
                "ultrasound": "ultrasound",
                "elastography": "elastography",
                "kPa": "kPa"
            },
            "th": {
                "fibrosis": "เส้นใยแข็งตับ",
                "cirrhosis": "ตับแข็ง",
                "hepatocellular carcinoma": "มะเร็งเซลล์ตับ", 
                "liver stiffness": "ความแข็งของตับ",
                "ultrasound": "อัลตราซาวด์",
                "elastography": "อีลาสโตกราฟี",
                "kPa": "กิโลปาสกาล",
                "lesion": "รอยโรค",
                "malignancy": "ความเป็นมะเร็ง",
                "benign": "ไม่เป็นมะเร็ง",
                "patient": "ผู้ป่วย",
                "diagnosis": "การวินิจฉัย",
                "treatment": "การรักษา",
                "clinical": "ทางคลินิก",
                "medical history": "ประวัติการรักษา",
                "symptoms": "อาการ",
                "examination": "การตรวจ",
                "report": "รายงาน",
                "analysis": "การวิเคราะห์"
            }
        }
    
    async def translate_medical_text(self, text: str, target_language: str, context: str = "medical") -> str:
        """
        Translate medical text with high accuracy using OpenAI
        """
        try:
            system_prompt = self._get_medical_system_prompt(target_language, context)
            
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Translate this medical text: {text}"}
                ],
                temperature=0.1,
                max_tokens=1000
            )
            
            translated_text = response.choices[0].message.content.strip()
            translated_text = self._apply_medical_terminology(translated_text, target_language)
            
            return translated_text
            
        except Exception as e:
            logger.error(f"OpenAI translation failed: {e}")
            # Fallback to Google Translate
            try:
                result = self.google_translator.translate(text, dest=target_language)
                return self._apply_medical_terminology(result.text, target_language)
            except Exception as fallback_error:
                logger.error(f"Fallback translation failed: {fallback_error}")
                return text  # Return original text if all translations fail
    
    def _get_medical_system_prompt(self, target_language: str, context: str) -> str:
        """Generate system prompt for medical translation"""
        
        if target_language == "th":
            return f"""
            You are a professional medical translator specializing in hepatology and radiology.
            Translate the following medical text to Thai with these requirements:
            
            1. Use accurate medical terminology in Thai
            2. Maintain clinical precision and clarity
            3. Use formal medical language appropriate for healthcare professionals
            4. Context: {context}
            5. Preserve all medical values, measurements, and technical terms accuracy
            
            Medical Translation Guidelines:
            - Fibrosis = เส้นใยแข็งตับ
            - Cirrhosis = ตับแข็ง  
            - Hepatocellular carcinoma = มะเร็งเซลล์ตับ
            - Liver stiffness = ความแข็งของตับ
            - Ultrasound = อัลตราซาวด์
            - Elastography = อีลาสโตกราฟี
            
            Provide only the translated text without explanations.
            """
        else:
            return f"""
            You are a professional medical translator specializing in hepatology and radiology.
            Translate the following medical text to English with these requirements:
            
            1. Use accurate medical terminology in English
            2. Maintain clinical precision and clarity  
            3. Use formal medical language appropriate for healthcare professionals
            4. Context: {context}
            5. Preserve all medical values, measurements, and technical terms accuracy
            
            Provide only the translated text without explanations.
            """
    
    def _apply_medical_terminology(self, text: str, target_language: str) -> str:
        """Apply consistent medical terminology mapping"""
        
        if target_language in self.medical_terms:
            terms = self.medical_terms[target_language]
            for en_term, target_term in terms.items():
                text = text.replace(en_term, target_term)
                text = text.replace(en_term.title(), target_term)
                text = text.replace(en_term.upper(), target_term)
        
        return text
    
    def translate_text(self, text: str, target_lang: str = "en") -> str:
        """
        Synchronous translation using Google Translate as fallback
        """
        try:
            if target_lang not in self.supported_languages:
                return text
                
            result = self.google_translator.translate(text, dest=target_lang)
            translated_text = result.text
            
            # Apply medical terminology corrections
            translated_text = self._apply_medical_terminology(translated_text, target_lang)
            
            return translated_text
        except Exception as e:
            logger.error(f"Translation error: {e}")
            return text
    
    def get_ui_text(self, key: str, language: str = "en") -> str:
        """Get translated UI text"""
        return UI_TRANSLATIONS.get(language, {}).get(key, key)

# Predefined UI translations for common interface elements
UI_TRANSLATIONS = {
    "en": {
        "app_title": "SmartLiva Clinical AI System",
        "dashboard": "Clinical Dashboard", 
        "patients": "Patients",
        "studies": "Studies",
        "reports": "Reports",
        "settings": "Settings",
        "logout": "Logout",
        "upload_image": "Upload Image",
        "analyze": "Analyze",
        "save_report": "Save Report",
        "patient_info": "Patient Information",
        "study_details": "Study Details",
        "ai_analysis": "AI Analysis",
        "liver_assessment": "Liver Assessment",
        "fibrosis_stage": "Fibrosis Stage",
        "confidence_score": "Confidence Score",
        "recommendations": "Recommendations",
        "next": "Next",
        "previous": "Previous", 
        "cancel": "Cancel",
        "submit": "Submit",
        "loading": "Loading...",
        "error": "Error",
        "success": "Success",
        "language": "Language",
        "thai": "Thai",
        "english": "English"
    },
    "th": {
        "app_title": "ระบบ AI วิเคราะห์ตับ SmartLiva",
        "dashboard": "แดชบอร์ดคลินิก",
        "patients": "ผู้ป่วย", 
        "studies": "การศึกษา",
        "reports": "รายงาน",
        "settings": "ตั้งค่า",
        "logout": "ออกจากระบบ",
        "upload_image": "อัปโหลดภาพ",
        "analyze": "วิเคราะห์",
        "save_report": "บันทึกรายงาน",
        "patient_info": "ข้อมูลผู้ป่วย",
        "study_details": "รายละเอียดการศึกษา",
        "ai_analysis": "การวิเคราะห์ AI",
        "liver_assessment": "การประเมินตับ",
        "fibrosis_stage": "ระยะเส้นใยแข็ง",
        "confidence_score": "คะแนนความเชื่อมั่น",
        "recommendations": "คำแนะนำ",
        "next": "ถัดไป",
        "previous": "ก่อนหน้า",
        "cancel": "ยกเลิก", 
        "submit": "ส่ง",
        "loading": "กำลังโหลด...",
        "error": "ข้อผิดพลาด",
        "success": "สำเร็จ",
        "language": "ภาษา",
        "thai": "ไทย",
        "english": "อังกฤษ"
    }
}

# Global translator instance
translator = SmartLivaTranslator()
