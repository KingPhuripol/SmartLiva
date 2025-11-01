import React, { createContext, useContext, useState, useEffect } from "react";

interface LanguageContextType {
  currentLanguage: "th" | "en" | "de";
  setLanguage: (lang: "th" | "en" | "de") => void;
  t: (key: string) => string;
  translateText: (
    text: string,
    targetLang?: "th" | "en" | "de"
  ) => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Simple translations dictionary
const translations: Record<"th" | "en" | "de", Record<string, string>> = {
  th: {
    // App
    "app.title": "ระบบ AI วิเคราะห์ตับ SmartLiva",
    "app.subtitle":
      "เทคโนโลยี AI ขั้นสูงสำหรับการวิเคราะห์สุขภาพตับอย่างแม่นยำ",

    // Navigation
    "nav.logout": "ออกจากระบบ",

    // Analysis
    "analysis.fibrosis_title": "FibroGauge™ การวิเคราะห์อัลตราซาวด์",
    "upload.button": "อัปโหลดภาพ",

    // Chat
    "chat.title": "HepaSage™ แชทบอท",
    "chat.subtitle":
      "ถามคำถาม Dr. HepaSage เกี่ยวกับสุขภาพตับ: เส้นใยแข็งตับ, ตับอักเสบ, ตับแข็ง, การดูแลสุขภาพ, การตรวจคัดกรอง",
    "chat.example": "ระยะของเส้นใยแข็งตับมีกี่ระยะและแต่ละระยะหมายถึงอะไร?",
    "chat.try_more": "ลองคำถามเพิ่มเติมในหน้าแชท",

    // Forms
    "form.view_type": "ชนิดการมอง",
    "form.swe_stage": "ระยะ SWE",
    "form.analyze": "วิเคราะห์",
    "form.analyzing": "กำลังวิเคราะห์...",

    // Results
    "results.title": "ผลการวิเคราะห์",
    "results.fibrosis": "ระยะเส้นใยแข็งตับ",
    "results.condition": "สภาวะ",
    "results.confidence": "ความเชื่อมั่น",
    "results.parasite_detected": "ตรวจพบพยาธิ",
    "results.parasite_status": "สถานะพยาธิ",
    "results.parasite_type": "ชนิดพยาธิ",
    "results.no_parasites": "ไม่พบพยาธิ",
    "results.parasites_found": "พบพยาธิ",

    // Common
    "common.translating": "กำลังแปล...",
    "lang.select": "เลือกภาษา",

    // Upload
    "upload.drag": "ลากภาพมาวางที่นี่หรือคลิกเพื่อเลือกไฟล์",
    "upload.formats": "รองรับไฟล์ JPG, PNG, DICOM",

    // Landing Page
    "landing.hero.title": "SmartLiva",
    "landing.hero.subtitle": "ระบบ AI วิเคราะห์ตับอัจฉริยะระดับนานาชาติ",
    "landing.hero.description":
      "เทคโนโลยี AI ขั้นสูงด้วย Deep Learning และ Computer Vision สำหรับการวิเคราะห์สุขภาพตับอย่างแม่นยำ รวดเร็ว และเชื่อถือได้ระดับมาตรฐานสากล",

    "landing.cta.start": "เริ่มต้นใช้งาน",
    "landing.cta.demo": "ดูการสาธิต",
    "landing.cta.title": "พร้อมปฏิวัติการดูแลสุขภาพตับแล้วหรือยัง?",
    "landing.cta.subtitle":
      "เข้าร่วมกับเราในการยกระดับการวิเคราะห์ทางการแพทย์สู่ยุคดิจิทัล",
    "landing.cta.get_started": "เริ่มต้นทันที",

    "landing.features.title": "ฟีเจอร์หลัก",
    "landing.features.subtitle": "ระบบครบครันด้วยเทคโนโลยี AI ที่ทันสมัยที่สุด",

    "landing.feature1.title": "FibroGauge™ AI Analysis",
    "landing.feature1.desc":
      "วิเคราะห์ระดับไฟโบรซิสด้วย AI ความแม่นยำสูงกว่า 95% พร้อมการประเมินแบบ Real-time",

    "landing.feature2.title": "HepaSage™ Medical Chatbot",
    "landing.feature2.desc":
      "แชทบอทด้านการแพทย์ที่ขับเคลื่อนด้วย AI ให้คำปรึกษาและข้อมูลทางการแพทย์ได้อย่างแม่นยำ",

    "landing.feature3.title": "Real-time Processing",
    "landing.feature3.desc":
      "ประมวลผลและวิเคราะห์ภาพ Ultrasound แบบเรียลไทม์ ผลลัพธ์ออกมาภายในไม่กี่วินาที",

    "landing.feature4.title": "Medical-Grade Security",
    "landing.feature4.desc":
      "ระบบรักษาความปลอดภัยระดับโรงพยาบาล รองรับมาตรฐาน HIPAA และการเข้ารหัสข้อมูลขั้นสูง",

    "landing.feature5.title": "Comprehensive Reporting",
    "landing.feature5.desc":
      "รายงานผลการวิเคราะห์ที่ครบถ้วน พร้อมการแปลงเป็น PDF และระบบลงนามดิจิทัล",

    "landing.feature6.title": "Multi-language Support",
    "landing.feature6.desc":
      "รองรับหลายภาษาด้วยระบบแปลเฉพาะทางการแพทย์ เหมาะสำหรับการใช้งานระดับสากล",

    "landing.tech.title": "เทคโนโลยีขั้นสูง",
    "landing.tech.ai.title": "AI & Deep Learning",
    "landing.tech.ai.desc1":
      "ระบบ AI ที่พัฒนาด้วย PyTorch และ Transformers รวมกับ Computer Vision สำหรับการวิเคราะห์ภาพทางการแพทย์",
    "landing.tech.ai.desc2":
      "โมเดล Deep Learning ที่ได้รับการฝึกฝนด้วยข้อมูลจริงจากโรงพยาบาล เพื่อความแม่นยำสูงสุด",

    "landing.tech.medical.title": "Medical Expertise",
    "landing.tech.medical.desc1":
      "พัฒนาร่วมกับผู้เชี่ยวชาญด้านตับวิทยาและรังสีวิทยา เพื่อให้ได้มาตรฐานทางการแพทย์ที่สูง",
    "landing.tech.medical.desc2":
      "รองรับการวิเคราะห์ Liver Fibrosis, Elastography และ HCC Detection ตามมาตรฐานสากล",

    "landing.footer":
      "© 2024 SmartLiva. AI-Powered Liver Analysis System for Medical Excellence.",

    // Welcome Page
    "welcome.initializing": "กำลังเริ่มต้นระบบ...",
    "welcome.title": "ระบบ AI วิเคราะห์ตับอัจฉริยะ",
    "welcome.subtitle":
      "ยินดีต้อนรับสู่ระบบวิเคราะห์สุขภาพตับด้วยเทคโนโลยี AI ขั้นสูง พร้อมให้บริการแพทย์และผู้เชี่ยวชาญอย่างมืออาชีพ",
    "welcome.feature1.title": "FibroGauge™ Analysis",
    "welcome.feature1.desc":
      "วิเคราะห์ระดับไฟโบรซิสด้วย AI ความแม่นยำสูง พร้อมรายงานผลแบบละเอียด",
    "welcome.feature2.title": "HepaSage™ Consultation",
    "welcome.feature2.desc":
      "ระบบให้คำปรึกษาทางการแพทย์ด้วย AI เฉพาะทางตับวิทยา",
    "welcome.feature3.title": "Clinical Reports",
    "welcome.feature3.desc": "ระบบรายงานทางคลินิกที่ครบถ้วน พร้อมลงนามดิจิทัล",
    "welcome.ready": "พร้อมเข้าสู่ระบบหรือยัง?",
    "welcome.enter_system": "เข้าสู่ระบบ",
    "welcome.footer":
      "SmartLiva Professional Medical AI System - เทคโนโลยีเพื่อการแพทย์ที่ดีกว่า",

    // Portal Page
    "portal.title": "SmartLiva Portal",
    "portal.subtitle":
      "เลือกระบบที่ต้องการใช้งาน - แต่ละระบบออกแบบมาเฉพาะทางเพื่อประสิทธิภาพสูงสุด",
    "portal.fibrogauge.title": "FibroGauge™",
    "portal.fibrogauge.desc":
      "ระบบวิเคราะห์ภาพ Ultrasound สำหรับตรวจหาระดับไฟโบรซิสในตับด้วย AI ความแม่นยำสูง",
    "portal.hepasage.title": "HepaSage™",
    "portal.hepasage.desc":
      "แพทย์ AI เฉพาะทางตับวิทยา ให้คำปรึกษาและข้อมูลทางการแพทย์อย่างแม่นยำ",
    "portal.reports.title": "Clinical Reports",
    "portal.reports.desc":
      "ระบบจัดการและสร้างรายงานทางคลินิก พร้อมระบบลงนามดิจิทัลและการจัดเก็บ",
    "portal.open_service": "เปิดใช้งาน",
    "portal.status.online": "ออนไลน์",
    "portal.status.accuracy": "ความแม่นยำ",
    "portal.status.response_time": "เวลาตอบสนอง",
    "portal.status.version": "เวอร์ชัน",

    // FibroGauge Page
    "fibrogauge.analysis_system": "ระบบวิเคราะห์",
    "fibrogauge.title": "FibroGauge™ Smart AI Analysis",
    "fibrogauge.smart_ai_subtitle": "การวิเคราะห์อัจฉริยะด้วย AI อัตโนมัติ",
    "fibrogauge.smart_ai_description":
      "AI จะวิเคราะห์ภาพ Ultrasound โดยอัตโนมัติ ไม่ต้องตั้งค่าใดๆ",
    "fibrogauge.subtitle":
      "ระบบวิเคราะห์ภาพ Ultrasound ด้วย AI เพื่อประเมินระดับไฟโบรซิสในตับอย่างแม่นยำ",
    "fibrogauge.upload_title": "อัปโหลดภาพ Ultrasound",
    "fibrogauge.results_title": "ผลการวิเคราะห์ AI",
    "fibrogauge.smart_analysis": "วิเคราะห์อัจฉริยะ",
    "fibrogauge.analyzing": "AI กำลังวิเคราะห์...",
    "fibrogauge.analysis_complete": "การวิเคราะห์เสร็จสมบูรณ์",
    "fibrogauge.confidence": "ความเชื่อมั่น",
    "fibrogauge.fibrosis_stage": "ระดับไฟโบรซิส",
    "fibrogauge.ai_insights": "ข้อมูลเชิงลึกจาก AI",
    "fibrogauge.recommendations": "คำแนะนำ",
    "fibrogauge.reset": "รีเซ็ต",
    "fibrogauge.steps.upload": "อัปโหลดภาพ",
    "fibrogauge.steps.configure": "ตั้งค่า",
    "fibrogauge.steps.analyze": "วิเคราะห์",
    "fibrogauge.steps.results": "ผลลัพธ์",
    "fibrogauge.step1_title": "1. อัปโหลดภาพ Ultrasound",
    "fibrogauge.step2_title": "2. ตั้งค่าการวิเคราะห์",
    "fibrogauge.step4_title": "4. ผลการวิเคราะห์",
    "fibrogauge.file_selected": "เลือกไฟล์แล้ว",
    "fibrogauge.image_uploaded": "อัปโหลดภาพสำเร็จ",
    "fibrogauge.upload_formats": "รองรับ JPG, PNG, DICOM",
    "fibrogauge.preview": "ตัวอย่างภาพ",
    "fibrogauge.start_analysis": "เริ่มการวิเคราะห์",
    "fibrogauge.processing_message": "AI กำลังวิเคราะห์ภาพ กรุณารอสักครู่...",
    "fibrogauge.waiting_analysis": "รอการวิเคราะห์",
    "fibrogauge.upload_instruction":
      "คลิกเพื่ออัปโหลดภาพ Ultrasound หรือลากไฟล์มาวาง",
    "fibrogauge.clinical_interpretation": "การตีความทางคลินิก",
    "fibrogauge.new_analysis": "วิเคราะห์ใหม่",
    "fibrogauge.generate_report": "สร้างรายงาน",

    // Smart Analysis
    "fibrogauge.smart_analysis.title": "🤖 Smart AI Analysis",
    "fibrogauge.smart_analysis.description":
      "ระบบ AI จะวิเคราะห์ภาพโดยอัตโนมัติ ไม่ต้องตั้งค่าใดๆ",
    "fibrogauge.smart_analysis.ready": "AI พร้อมวิเคราะห์ภาพของคุณแล้ว",
    "fibrogauge.smart_analysis.analyzing": "AI กำลังวิเคราะห์ภาพ",
    "fibrogauge.smart_analysis.ai_working":
      "กำลังตรวจหา View Type, SWE Stage และระดับไฟโบรซิสโดยอัตโนมัติ...",
    "fibrogauge.smart_analysis.auto_detected":
      "AI ตรวจพบและวิเคราะห์พารามิเตอร์ทั้งหมดโดยอัตโนมัติ",
    "fibrogauge.smart_analysis.no_config":
      "ไม่ต้องตั้งค่าใดๆ AI จะจัดการให้หมด!",

    // Error messages
    "fibrogauge.error.no_file": "กรุณาเลือกไฟล์ภาพก่อน",
    "fibrogauge.error.analysis_failed": "การวิเคราะห์ล้มเหลว กรุณาลองใหม่",

    // Results
    "fibrogauge.results.normal_liver": "ตับปกติ ไม่พบไฟโบรซิสที่มีนัยสำคัญ",
    "fibrogauge.results.mild_fibrosis":
      "พบไฟโบรซิสระดับเล็กน้อย มีการเปลี่ยนแปลงโครงสร้างน้อยมาก",
    "fibrogauge.results.moderate_fibrosis": "พบไฟโบรซิสระดับปานกลาง (F2)",
    "fibrogauge.results.severe_fibrosis":
      "พบไฟโบรซิสระดับรุนแรง มีการเปลี่ยนแปลงโครงสร้างอย่างมาก",
    "fibrogauge.results.cirrhosis":
      "พบตับแข็ง - ไฟโบรซิสขั้นรุนแรงและความเสียหายของเนื้อเยื่อ",
    "fibrogauge.ai_insights.sample":
      "AI วิเคราะห์พบลักษณะเนื้อเยื่อที่แสดงถึงการเปลี่ยนแปลงในระดับ F2 ด้วยความเชื่อมั่นสูง การติดตามอย่างสม่ำเสมอจะช่วยในการประเมินความก้าวหน้า",
    "fibrogauge.recommendations.lifestyle":
      "ปรับปรุงพฤติกรรมการกิน หลีกเลี่ยงเครื่องดื่มแอลกอฮอล์",
    "fibrogauge.recommendations.monitoring": "ติดตามผลการตรวจทุก 6 เดือน",
    "fibrogauge.recommendations.consultation":
      "ปรึกษาแพทย์เฉพาะทางเพื่อรับการดูแลต่อเนื่อง",

    // HepaSage Page
    "hepasage.medical_assistant": "ผู้ช่วยแพทย์ AI",
    "hepasage.specialist_title": "ผู้เชี่ยวชาญด้านตับวิทยา",
    "hepasage.online": "ออนไลน์",
    "hepasage.typing": "กำลังพิมพ์...",
    "hepasage.input_placeholder": "พิมพ์คำถามเกี่ยวกับสุขภาพตับ...",
    "hepasage.quick_questions": "คำถามยอดนิยม",
    "hepasage.disclaimer_title": "คำแนะนำ",
    "hepasage.disclaimer":
      "ข้อมูลที่ได้รับเป็นเพียงการให้ความรู้ทั่วไป ไม่ใช่การวินิจฉัยทางการแพทย์ กรุณาปรึกษาแพทย์เพื่อการรักษาที่เหมาะสม",
    "hepasage.capabilities": "ความสามารถ",
    "hepasage.capability1": "ตอบคำถามเรื่องสุขภาพตับ",
    "hepasage.capability2": "อธิบายผลการตรวจ",
    "hepasage.capability3": "แนะนำการดูแลสุขภาพ",
    "hepasage.capability4": "ให้ข้อมูลการรักษา",

    // Help Dialog
    "help.dialog.title": "คู่มือการใช้งาน",
    "help.dialog.close": "ปิด",
    "help.fibrogauge.title": "คู่มือ FibroGauge™ การวิเคราะห์ไฟโบรซิส",
    "help.fibrogauge.description":
      "ระบบวิเคราะห์ภาพอัลตราซาวด์เพื่อประเมินระดับไฟโบรซิสในตับ ใช้เทคโนโลยี AI ขั้นสูงเพื่อความแม่นยำสูง",

    "help.view_type.title": "ชนิดการมอง (View Type)",
    "help.view_type.description":
      "ตำแหน่งของ probe ในการถ่ายภาพอัลตราซาวด์ตับ แต่ละชนิดให้ข้อมูลที่แตกต่างกัน",
    "help.view_type.intercostal.title": "Intercostal View",
    "help.view_type.intercostal.description":
      "การถ่ายภาพผ่านซี่โครง มองเห็นตับจากด้านข้าง เหมาะสำหรับวัดความแข็งของเนื้อเยื่อ",
    "help.view_type.subcostal.title": "Subcostal View",
    "help.view_type.subcostal.description":
      "การถ่ายภาพจากใต้ซี่โครง มองเห็นตับจากด้านล่าง ให้ภาพรวมของตับทั้งหมด",

    "help.swe_stage.title": "ระยะ SWE (Shear Wave Elastography)",
    "help.swe_stage.description":
      "การวัดความแข็งของเนื้อเยื่อตับด้วยคลื่นเสียง ยิ่งมีไฟโบรซิสมาก เนื้อเยื่อจะแข็งมากขึ้น",
    "help.swe_stage.f0.title": "F0 - ตับปกติ",
    "help.swe_stage.f0.description":
      "ไม่มีไฟโบรซิส ความแข็ง < 7 kPa ตับมีสุขภาพดี",
    "help.swe_stage.f1.title": "F1 - ไฟโบรซิสเล็กน้อย",
    "help.swe_stage.f1.description":
      "ไฟโบรซิสระยะเริ่มต้น ความแข็ง 7-9 kPa ยังสามารถรักษาได้",
    "help.swe_stage.f2.title": "F2 - ไฟโบรซิสปานกลาง",
    "help.swe_stage.f2.description":
      "ไฟโบรซิสระยะกลาง ความแข็ง 9-12 kPa ต้องเฝ้าระวังและรักษา",
    "help.swe_stage.f3.title": "F3 - ไฟโบรซิสมาก",
    "help.swe_stage.f3.description":
      "ไฟโบรซิสระยะแรง ความแข็ง 12-14 kPa ใกล้ตับแข็ง ต้องรักษาเร่งด่วน",
    "help.swe_stage.f4.title": "F4 - ตับแข็ง",
    "help.swe_stage.f4.description":
      "ตับแข็งเต็มที่ ความแข็ง > 14 kPa ต้องรักษาทันที อาจต้องปลูกถ่ายตับ",

    "help.setup.title": "วิธีการตั้งค่า",
    "help.setup.description": "ขั้นตอนการตั้งค่าสำหรับการวิเคราะห์ที่แม่นยำ",
    "help.setup.step1": "1. เลือก View Type",
    "help.setup.step1_detail":
      "เลือกตำแหน่งการถ่ายภาพตามแผนที่มี หากไม่แน่ใจเลือก 'Unknown'",
    "help.setup.step2": "2. ระบุ SWE Stage (ถ้ามี)",
    "help.setup.step2_detail":
      "หากมีผลตรวจ SWE อยู่แล้ว ให้เลือกระยะที่ตรงกัน หากไม่มีให้เลือก 'Unknown'",
    "help.setup.step3": "3. เริ่มการวิเคราะห์",
    "help.setup.step3_detail":
      "AI จะวิเคราะห์ภาพและให้ผลลัพธ์พร้อมคำแนะนำทางคลินิก",

    "help.hepasage.title": "คู่มือ HepaSage™ แพทย์ AI",
    "help.hepasage.description":
      "ระบบปรึกษาทางการแพทย์เฉพาะทางตับวิทยา ให้คำปรึกษาและข้อมูลทางการแพทย์",
    "help.hepasage.features.title": "ความสามารถหลัก",
    "help.hepasage.features.medical_qa": "ตอบคำถามทางการแพทย์",
    "help.hepasage.features.medical_qa_desc":
      "ตอบคำถามเกี่ยวกับโรคตับ การรักษา และการดูแลสุขภาพ",
    "help.hepasage.features.result_interpretation": "อธิบายผลการตรวจ",
    "help.hepasage.features.result_interpretation_desc":
      "อธิบายผลการตรวจต่างๆ และให้คำแนะนำทางคลินิก",

    // Clinical Reports
    "reports.title": "รายงานทางคลินิก",
    "reports.header.title": "ระบบจัดการรายงานทางคลินิก",
    "reports.header.subtitle":
      "สร้าง จัดการ และลงนามรายงานทางการแพทย์อย่างมืออาชีพ",
    "reports.search.placeholder": "ค้นหาด้วยชื่อผู้ป่วย รหัส หรือชื่อรายงาน...",
    "reports.filter.status": "สถานะ",
    "reports.filter.type": "ประเภทรายงาน",
    "reports.filter.all": "ทั้งหมด",
    "reports.status.draft": "ร่าง",
    "reports.status.completed": "เสร็จสมบูรณ์",
    "reports.status.signed": "ลงนามแล้ว",
    "reports.status.archived": "เก็บถาวร",
    "reports.type.comprehensive": "รายงานครบถ้วน",
    "reports.create.button": "สร้างรายงาน",
    "reports.create.title": "สร้างรายงานใหม่",
    "reports.create.patient_id": "รหัสผู้ป่วย",
    "reports.create.patient_name": "ชื่อผู้ป่วย",
    "reports.create.type": "ประเภทรายงาน",
    "reports.create.findings": "ผลการตรวจพบ",
    "reports.create.recommendations": "คำแนะนำ",
    "reports.create.save": "บันทึก",
    "reports.table.id": "รหัสรายงาน",
    "reports.table.patient": "ผู้ป่วย",
    "reports.table.type": "ประเภท",
    "reports.table.title": "ชื่อรายงาน",
    "reports.table.status": "สถานะ",
    "reports.table.created": "วันที่สร้าง",
    "reports.table.actions": "การดำเนินการ",
    "reports.details.findings": "ผลการตรวจพบ",
    "reports.details.recommendations": "คำแนะนำ",
    "reports.signed_by": "ลงนามโดย",
    "reports.download_pdf": "ดาวน์โหลด PDF",
    "reports.sign": "ลงนาม",
    "reports.no_results": "ไม่พบรายงานที่ตรงกับเงื่อนไขการค้นหา",
    "common.cancel": "ยกเลิก",
    "common.close": "ปิด",
  },
  en: {
    // App
    "app.title": "SmartLiva Clinical AI System",
    "app.subtitle": "Advanced AI Technology for Accurate Liver Health Analysis",

    // Navigation
    "nav.logout": "Logout",

    // Analysis
    "analysis.fibrosis_title": "FibroGauge™ Ultrasound Analysis",
    "upload.button": "Upload Image",

    // Chat
    "chat.title": "HepaSage™ Chat",
    "chat.subtitle":
      "Ask Dr. HepaSage anything about liver health: fibrosis, hepatitis, cirrhosis, lifestyle, screening.",
    "chat.example":
      "What are the stages of liver fibrosis and what do they mean?",
    "chat.try_more": "Try more in the chat page.",

    // Forms
    "form.view_type": "View Type",
    "form.swe_stage": "SWE Stage",
    "form.analyze": "Analyze",
    "form.analyzing": "Analyzing...",

    // Results
    "results.title": "Analysis Results",
    "results.fibrosis": "Fibrosis Stage",
    "results.condition": "Condition",
    "results.confidence": "Confidence",
    "results.parasite_detected": "Parasite Detected",
    "results.parasite_status": "Parasite Status",
    "results.parasite_type": "Parasite Type",
    "results.no_parasites": "No Parasites Detected",
    "results.parasites_found": "Parasites Found",

    // Common
    "common.translating": "Translating...",
    "lang.select": "Language",

    // Upload
    "upload.drag": "Drag an image here or click to select a file",
    "upload.formats": "Supports JPG, PNG, DICOM files",

    // Landing Page
    "landing.hero.title": "SmartLiva",
    "landing.hero.subtitle": "International-Grade AI Liver Analysis System",
    "landing.hero.description":
      "Advanced AI technology powered by Deep Learning and Computer Vision for accurate, rapid, and reliable liver health analysis meeting international medical standards",

    "landing.cta.start": "Get Started",
    "landing.cta.demo": "View Demo",
    "landing.cta.title": "Ready to Revolutionize Liver Care?",
    "landing.cta.subtitle":
      "Join us in elevating medical analysis to the digital age",
    "landing.cta.get_started": "Start Now",

    "landing.features.title": "Key Features",
    "landing.features.subtitle":
      "Complete system with cutting-edge AI technology",

    "landing.feature1.title": "FibroGauge™ AI Analysis",
    "landing.feature1.desc":
      "Analyze fibrosis levels with AI achieving >95% accuracy with real-time assessment capabilities",

    "landing.feature2.title": "HepaSage™ Medical Chatbot",
    "landing.feature2.desc":
      "AI-powered medical chatbot providing accurate medical consultation and information",

    "landing.feature3.title": "Real-time Processing",
    "landing.feature3.desc":
      "Real-time ultrasound image processing and analysis with results in seconds",

    "landing.feature4.title": "Medical-Grade Security",
    "landing.feature4.desc":
      "Hospital-level security system supporting HIPAA standards and advanced data encryption",

    "landing.feature5.title": "Comprehensive Reporting",
    "landing.feature5.desc":
      "Complete analysis reports with PDF conversion and digital signature system",

    "landing.feature6.title": "Multi-language Support",
    "landing.feature6.desc":
      "Multi-language support with specialized medical translation system suitable for international use",

    "landing.tech.title": "Advanced Technology",
    "landing.tech.ai.title": "AI & Deep Learning",
    "landing.tech.ai.desc1":
      "AI system developed with PyTorch and Transformers combined with Computer Vision for medical image analysis",
    "landing.tech.ai.desc2":
      "Deep Learning models trained with real hospital data for maximum accuracy",

    "landing.tech.medical.title": "Medical Expertise",
    "landing.tech.medical.desc1":
      "Developed in collaboration with hepatology and radiology specialists to achieve high medical standards",
    "landing.tech.medical.desc2":
      "Supports Liver Fibrosis analysis, Elastography, and HCC Detection according to international standards",

    "landing.footer":
      "© 2024 SmartLiva. AI-Powered Liver Analysis System for Medical Excellence.",

    // Welcome Page
    "welcome.initializing": "Initializing System...",
    "welcome.title": "Smart AI Liver Analysis System",
    "welcome.subtitle":
      "Welcome to our advanced AI-powered liver health analysis system. Professional medical technology designed for healthcare providers and specialists.",
    "welcome.feature1.title": "FibroGauge™ Analysis",
    "welcome.feature1.desc":
      "High-precision AI fibrosis analysis with detailed comprehensive reporting",
    "welcome.feature2.title": "HepaSage™ Consultation",
    "welcome.feature2.desc":
      "Specialized AI medical consultation system for hepatology expertise",
    "welcome.feature3.title": "Clinical Reports",
    "welcome.feature3.desc":
      "Complete clinical reporting system with digital signature capabilities",
    "welcome.ready": "Ready to Enter the System?",
    "welcome.enter_system": "Enter System",
    "welcome.footer":
      "SmartLiva Professional Medical AI System - Better Technology for Better Medicine",

    // Portal Page
    "portal.title": "SmartLiva Portal",
    "portal.subtitle":
      "Choose the system you need - Each system is specifically designed for maximum efficiency",
    "portal.fibrogauge.title": "FibroGauge™",
    "portal.fibrogauge.desc":
      "High-precision AI ultrasound image analysis system for detecting liver fibrosis levels",
    "portal.hepasage.title": "HepaSage™",
    "portal.hepasage.desc":
      "Specialized AI hepatology physician providing accurate medical consultation and information",
    "portal.reports.title": "Clinical Reports",
    "portal.reports.desc":
      "Clinical report management and generation system with digital signature and storage capabilities",
    "portal.open_service": "Open Service",
    "portal.status.online": "Online",
    "portal.status.accuracy": "Accuracy",
    "portal.status.response_time": "Response Time",
    "portal.status.version": "Version",

    // FibroGauge Page
    "fibrogauge.analysis_system": "Analysis System",
    "fibrogauge.title": "FibroGauge™ Smart AI Analysis",
    "fibrogauge.smart_ai_subtitle": "Intelligent Automated AI Analysis",
    "fibrogauge.smart_ai_description":
      "AI automatically analyzes ultrasound images without any configuration needed",
    "fibrogauge.subtitle":
      "AI ultrasound image analysis system for accurate liver fibrosis level assessment",
    "fibrogauge.upload_title": "Upload Ultrasound Image",
    "fibrogauge.results_title": "AI Analysis Results",
    "fibrogauge.smart_analysis": "Smart Analysis",
    "fibrogauge.analyzing": "AI Analyzing...",
    "fibrogauge.analysis_complete": "Analysis Complete",
    "fibrogauge.confidence": "Confidence",
    "fibrogauge.fibrosis_stage": "Fibrosis Stage",
    "fibrogauge.ai_insights": "AI Insights",
    "fibrogauge.recommendations": "Recommendations",
    "fibrogauge.reset": "Reset",
    "fibrogauge.steps.upload": "Upload Image",
    "fibrogauge.steps.configure": "Configure",
    "fibrogauge.steps.analyze": "Analyze",
    "fibrogauge.steps.results": "Results",
    "fibrogauge.step1_title": "1. Upload Ultrasound Image",
    "fibrogauge.step2_title": "2. Configure Analysis Settings",
    "fibrogauge.step4_title": "4. Analysis Results",
    "fibrogauge.file_selected": "File Selected",
    "fibrogauge.image_uploaded": "Image uploaded successfully",
    "fibrogauge.upload_formats": "Supports JPG, PNG, DICOM",
    "fibrogauge.preview": "Image Preview",
    "fibrogauge.start_analysis": "Start Analysis",
    "fibrogauge.processing_message":
      "AI is analyzing the image, please wait...",
    "fibrogauge.waiting_analysis": "Waiting for Analysis",
    "fibrogauge.upload_instruction":
      "Click to upload ultrasound image or drag and drop file",
    "fibrogauge.clinical_interpretation": "Clinical Interpretation",
    "fibrogauge.new_analysis": "New Analysis",
    "fibrogauge.generate_report": "Generate Report",

    // Smart Analysis
    "fibrogauge.smart_analysis.title": "🤖 Smart AI Analysis",
    "fibrogauge.smart_analysis.description":
      "AI system will analyze the image automatically without any configuration needed",
    "fibrogauge.smart_analysis.ready": "AI is ready to analyze your image",
    "fibrogauge.smart_analysis.analyzing": "AI is analyzing the image",
    "fibrogauge.smart_analysis.ai_working":
      "Auto-detecting View Type, SWE Stage and fibrosis level...",
    "fibrogauge.smart_analysis.auto_detected":
      "AI automatically detected and analyzed all parameters",
    "fibrogauge.smart_analysis.no_config":
      "No configuration needed - AI handles everything!",

    // Error messages
    "fibrogauge.error.no_file": "Please select an image file first",
    "fibrogauge.error.analysis_failed": "Analysis failed, please try again",

    // Results
    "fibrogauge.results.normal_liver":
      "Normal liver tissue with no significant fibrosis",
    "fibrogauge.results.mild_fibrosis":
      "Mild fibrosis detected with minimal structural changes",
    "fibrogauge.results.moderate_fibrosis": "Moderate fibrosis detected (F2)",
    "fibrogauge.results.severe_fibrosis":
      "Severe fibrosis with significant structural changes",
    "fibrogauge.results.cirrhosis":
      "Cirrhosis detected - extensive fibrosis and tissue damage",
    "fibrogauge.ai_insights.sample":
      "AI analysis detected tissue characteristics indicating F2-level changes with high confidence. Regular monitoring will help assess progression.",
    "fibrogauge.recommendations.lifestyle":
      "Improve dietary habits, avoid alcohol consumption",
    "fibrogauge.recommendations.monitoring":
      "Follow-up monitoring every 6 months",
    "fibrogauge.recommendations.consultation":
      "Consult specialist for ongoing care",

    // HepaSage Page
    "hepasage.medical_assistant": "AI Medical Assistant",
    "hepasage.specialist_title": "Hepatology Specialist",
    "hepasage.online": "Online",
    "hepasage.typing": "Typing...",
    "hepasage.input_placeholder": "Type your question about liver health...",
    "hepasage.quick_questions": "Popular Questions",
    "hepasage.disclaimer_title": "Important Notice",
    "hepasage.disclaimer":
      "Information provided is for educational purposes only, not medical diagnosis. Please consult a physician for appropriate treatment.",
    "hepasage.capabilities": "Capabilities",
    "hepasage.capability1": "Answer liver health questions",
    "hepasage.capability2": "Explain test results",
    "hepasage.capability3": "Recommend health care",
    "hepasage.capability4": "Provide treatment information",

    // Help Dialog
    "help.dialog.title": "User Guide",
    "help.dialog.close": "Close",
    "help.fibrogauge.title": "FibroGauge™ Fibrosis Analysis Guide",
    "help.fibrogauge.description":
      "Ultrasound image analysis system for liver fibrosis level assessment using advanced AI technology for high accuracy",

    "help.view_type.title": "View Type",
    "help.view_type.description":
      "Probe position for liver ultrasound imaging. Each type provides different information",
    "help.view_type.intercostal.title": "Intercostal View",
    "help.view_type.intercostal.description":
      "Imaging through ribs, lateral liver view. Ideal for tissue stiffness measurement",
    "help.view_type.subcostal.title": "Subcostal View",
    "help.view_type.subcostal.description":
      "Imaging from below ribs, inferior liver view. Provides overall liver assessment",

    "help.swe_stage.title": "SWE Stage (Shear Wave Elastography)",
    "help.swe_stage.description":
      "Liver tissue stiffness measurement using sound waves. More fibrosis means stiffer tissue",
    "help.swe_stage.f0.title": "F0 - Normal Liver",
    "help.swe_stage.f0.description":
      "No fibrosis. Stiffness < 7 kPa. Healthy liver",
    "help.swe_stage.f1.title": "F1 - Mild Fibrosis",
    "help.swe_stage.f1.description":
      "Early-stage fibrosis. Stiffness 7-9 kPa. Still treatable",
    "help.swe_stage.f2.title": "F2 - Moderate Fibrosis",
    "help.swe_stage.f2.description":
      "Moderate fibrosis. Stiffness 9-12 kPa. Requires monitoring and treatment",
    "help.swe_stage.f3.title": "F3 - Severe Fibrosis",
    "help.swe_stage.f3.description":
      "Advanced fibrosis. Stiffness 12-14 kPa. Pre-cirrhotic, urgent treatment needed",
    "help.swe_stage.f4.title": "F4 - Cirrhosis",
    "help.swe_stage.f4.description":
      "Full cirrhosis. Stiffness > 14 kPa. Immediate treatment, may need liver transplant",

    "help.setup.title": "Setup Instructions",
    "help.setup.description": "Configuration steps for accurate analysis",
    "help.setup.step1": "1. Select View Type",
    "help.setup.step1_detail":
      "Choose imaging position as per protocol. Select 'Unknown' if uncertain",
    "help.setup.step2": "2. Specify SWE Stage (if available)",
    "help.setup.step2_detail":
      "If SWE results available, select matching stage. Choose 'Unknown' if not available",
    "help.setup.step3": "3. Start Analysis",
    "help.setup.step3_detail":
      "AI will analyze the image and provide results with clinical recommendations",

    "help.hepasage.title": "HepaSage™ AI Physician Guide",
    "help.hepasage.description":
      "Specialized hepatology medical consultation system providing medical advice and information",
    "help.hepasage.features.title": "Key Capabilities",
    "help.hepasage.features.medical_qa": "Medical Q&A",
    "help.hepasage.features.medical_qa_desc":
      "Answer questions about liver diseases, treatments, and health care",
    "help.hepasage.features.result_interpretation": "Result Interpretation",
    "help.hepasage.features.result_interpretation_desc":
      "Explain various test results and provide clinical recommendations",

    // Clinical Reports
    "reports.title": "Clinical Reports",
    "reports.header.title": "Clinical Report Management System",
    "reports.header.subtitle":
      "Create, manage, and digitally sign medical reports professionally",
    "reports.search.placeholder":
      "Search by patient name, ID, or report title...",
    "reports.filter.status": "Status",
    "reports.filter.type": "Report Type",
    "reports.filter.all": "All",
    "reports.status.draft": "Draft",
    "reports.status.completed": "Completed",
    "reports.status.signed": "Signed",
    "reports.status.archived": "Archived",
    "reports.type.comprehensive": "Comprehensive Report",
    "reports.create.button": "Create Report",
    "reports.create.title": "Create New Report",
    "reports.create.patient_id": "Patient ID",
    "reports.create.patient_name": "Patient Name",
    "reports.create.type": "Report Type",
    "reports.create.findings": "Findings",
    "reports.create.recommendations": "Recommendations",
    "reports.create.save": "Save",
    "reports.table.id": "Report ID",
    "reports.table.patient": "Patient",
    "reports.table.type": "Type",
    "reports.table.title": "Report Title",
    "reports.table.status": "Status",
    "reports.table.created": "Created Date",
    "reports.table.actions": "Actions",
    "reports.details.findings": "Findings",
    "reports.details.recommendations": "Recommendations",
    "reports.signed_by": "Signed by",
    "reports.download_pdf": "Download PDF",
    "reports.sign": "Sign",
    "reports.no_results": "No reports found matching the search criteria",
    "common.cancel": "Cancel",
    "common.close": "Close",
  },
  de: {
    // App
    "app.title": "SmartLiva Klinisches KI-System",
    "app.subtitle":
      "Fortschrittliche KI-Technologie für präzise Lebergesundheitsanalyse",

    // Navigation
    "nav.logout": "Abmelden",

    // Analysis
    "analysis.fibrosis_title": "FibroGauge™ Ultraschall-Analyse",
    "upload.button": "Bild hochladen",

    // Chat
    "chat.title": "HepaSage™ Chat",
    "chat.subtitle":
      "Fragen Sie Dr. HepaSage alles über Lebergesundheit: Fibrose, Hepatitis, Zirrhose, Lebensstil, Vorsorge.",
    "chat.example":
      "Was sind die Stadien der Leberfibrose und was bedeuten sie?",
    "chat.try_more": "Probieren Sie mehr auf der Chat-Seite.",

    // Forms
    "form.view_type": "Ansichtstyp",
    "form.swe_stage": "SWE-Stadium",
    "form.analyze": "Analysieren",
    "form.analyzing": "Analysiere...",

    // Results
    "results.title": "Analyseergebnisse",
    "results.fibrosis": "Fibrose-Stadium",
    "results.condition": "Zustand",
    "results.confidence": "Vertrauen",
    "results.parasite_detected": "Parasit erkannt",
    "results.parasite_status": "Parasitenstatus",
    "results.parasite_type": "Parasitentyp",
    "results.no_parasites": "Keine Parasiten gefunden",
    "results.parasites_found": "Parasiten gefunden",

    // Common
    "common.translating": "Übersetze...",
    "lang.select": "Sprache",

    // Upload
    "upload.drag":
      "Ziehen Sie ein Bild hierher oder klicken Sie, um eine Datei auszuwählen",
    "upload.formats": "Unterstützt JPG-, PNG-, DICOM-Dateien",

    // Landing Page
    "landing.hero.title": "SmartLiva",
    "landing.hero.subtitle": "Internationales KI-Leberanalysesystem",
    "landing.hero.description":
      "Fortschrittliche KI-Technologie mit Deep Learning und Computer Vision für präzise, schnelle und zuverlässige Lebergesundheitsanalyse nach internationalen medizinischen Standards",

    "landing.cta.start": "Loslegen",
    "landing.cta.demo": "Demo ansehen",
    "landing.cta.title": "Bereit, die Leberversorgung zu revolutionieren?",
    "landing.cta.subtitle":
      "Begleiten Sie uns dabei, die medizinische Analyse ins digitale Zeitalter zu bringen",
    "landing.cta.get_started": "Jetzt starten",

    "landing.features.title": "Hauptmerkmale",
    "landing.features.subtitle":
      "Komplettes System mit modernster KI-Technologie",

    "landing.feature1.title": "FibroGauge™ KI-Analyse",
    "landing.feature1.desc":
      "Analysieren Sie Fibrose-Level mit KI mit >95% Genauigkeit und Echtzeit-Bewertungsfähigkeiten",

    "landing.feature2.title": "HepaSage™ Medizinischer Chatbot",
    "landing.feature2.desc":
      "KI-gestützter medizinischer Chatbot für präzise medizinische Beratung und Informationen",

    "landing.feature3.title": "Echtzeitverarbeitung",
    "landing.feature3.desc":
      "Echtzeit-Ultraschallbildverarbeitung und -analyse mit Ergebnissen in Sekunden",

    "landing.feature4.title": "Medizinische Sicherheit",
    "landing.feature4.desc":
      "Krankenhaus-Sicherheitssystem mit HIPAA-Standards und fortschrittlicher Datenverschlüsselung",

    "landing.feature5.title": "Umfassende Berichterstattung",
    "landing.feature5.desc":
      "Vollständige Analyseberichte mit PDF-Konvertierung und digitalem Signatursystem",

    "landing.feature6.title": "Mehrsprachige Unterstützung",
    "landing.feature6.desc":
      "Mehrsprachige Unterstützung mit spezialisiertem medizinischem Übersetzungssystem für internationalen Einsatz",

    "landing.tech.title": "Fortschrittliche Technologie",
    "landing.tech.ai.title": "KI & Deep Learning",
    "landing.tech.ai.desc1":
      "KI-System entwickelt mit PyTorch und Transformers kombiniert mit Computer Vision für medizinische Bildanalyse",
    "landing.tech.ai.desc2":
      "Deep Learning-Modelle trainiert mit echten Krankenhausdaten für maximale Genauigkeit",

    "landing.tech.medical.title": "Medizinische Expertise",
    "landing.tech.medical.desc1":
      "Entwickelt in Zusammenarbeit mit Hepatologie- und Radiologie-Spezialisten für hohe medizinische Standards",
    "landing.tech.medical.desc2":
      "Unterstützt Leberfibrose-Analyse, Elastographie und HCC-Erkennung nach internationalen Standards",

    "landing.footer":
      "© 2024 SmartLiva. KI-gestütztes Leberanalysesystem für medizinische Exzellenz.",

    // Welcome Page
    "welcome.initializing": "System wird initialisiert...",
    "welcome.title": "Intelligentes KI-Leberanalysesystem",
    "welcome.subtitle":
      "Willkommen bei unserem fortschrittlichen KI-gestützten Lebergesundheitsanalysesystem. Professionelle Medizintechnik für Gesundheitsdienstleister und Spezialisten.",
    "welcome.feature1.title": "FibroGauge™ Analyse",
    "welcome.feature1.desc":
      "Hochpräzise KI-Fibrose-Analyse mit detaillierter umfassender Berichterstattung",
    "welcome.feature2.title": "HepaSage™ Beratung",
    "welcome.feature2.desc":
      "Spezialisiertes KI-medizinisches Beratungssystem für Hepatologie-Expertise",
    "welcome.feature3.title": "Klinische Berichte",
    "welcome.feature3.desc":
      "Vollständiges klinisches Berichtssystem mit digitalen Signaturfähigkeiten",
    "welcome.ready": "Bereit, das System zu betreten?",
    "welcome.enter_system": "System betreten",
    "welcome.footer":
      "SmartLiva Professionelles Medizinisches KI-System - Bessere Technologie für bessere Medizin",

    // Portal Page
    "portal.title": "SmartLiva Portal",
    "portal.subtitle":
      "Wählen Sie das benötigte System - Jedes System ist speziell für maximale Effizienz entwickelt",
    "portal.fibrogauge.title": "FibroGauge™",
    "portal.fibrogauge.desc":
      "Hochpräzises KI-Ultraschallbildanalysesystem zur Erkennung von Leberfibrose-Leveln",
    "portal.hepasage.title": "HepaSage™",
    "portal.hepasage.desc":
      "Spezialisierter KI-Hepatologie-Arzt für präzise medizinische Beratung und Informationen",
    "portal.reports.title": "Klinische Berichte",
    "portal.reports.desc":
      "Klinisches Berichtsmanagement- und Generierungssystem mit digitaler Signatur und Speicherfähigkeiten",
    "portal.open_service": "Service öffnen",
    "portal.status.online": "Online",
    "portal.status.accuracy": "Genauigkeit",
    "portal.status.response_time": "Antwortzeit",
    "portal.status.version": "Version",

    // FibroGauge Page
    "fibrogauge.analysis_system": "Analysesystem",
    "fibrogauge.title": "FibroGauge™ Intelligente KI-Analyse",
    "fibrogauge.smart_ai_subtitle": "Intelligente automatisierte KI-Analyse",
    "fibrogauge.smart_ai_description":
      "KI analysiert Ultraschallbilder automatisch ohne Konfiguration",
    "fibrogauge.subtitle":
      "KI-Ultraschallbildanalysesystem für präzise Leberfibrose-Level-Bewertung",
    "fibrogauge.upload_title": "Ultraschallbild hochladen",
    "fibrogauge.results_title": "KI-Analyseergebnisse",
    "fibrogauge.smart_analysis": "Intelligente Analyse",
    "fibrogauge.analyzing": "KI analysiert...",
    "fibrogauge.analysis_complete": "Analyse abgeschlossen",
    "fibrogauge.confidence": "Vertrauen",
    "fibrogauge.fibrosis_stage": "Fibrose-Stadium",
    "fibrogauge.ai_insights": "KI-Erkenntnisse",
    "fibrogauge.recommendations": "Empfehlungen",
    "fibrogauge.reset": "Zurücksetzen",
    "fibrogauge.steps.upload": "Bild hochladen",
    "fibrogauge.steps.configure": "Konfigurieren",
    "fibrogauge.steps.analyze": "Analysieren",
    "fibrogauge.steps.results": "Ergebnisse",
    "fibrogauge.step1_title": "1. Ultraschallbild hochladen",
    "fibrogauge.step2_title": "2. Analyseeinstellungen konfigurieren",
    "fibrogauge.step4_title": "4. Analyseergebnisse",
    "fibrogauge.file_selected": "Datei ausgewählt",
    "fibrogauge.image_uploaded": "Bild erfolgreich hochgeladen",
    "fibrogauge.upload_formats": "Unterstützt JPG, PNG, DICOM",
    "fibrogauge.preview": "Bildvorschau",
    "fibrogauge.start_analysis": "Analyse starten",
    "fibrogauge.processing_message": "KI analysiert das Bild, bitte warten...",
    "fibrogauge.waiting_analysis": "Warten auf Analyse",
    "fibrogauge.upload_instruction":
      "Klicken Sie zum Hochladen eines Ultraschallbildes oder ziehen Sie die Datei hierher",
    "fibrogauge.clinical_interpretation": "Klinische Interpretation",
    "fibrogauge.new_analysis": "Neue Analyse",
    "fibrogauge.generate_report": "Bericht erstellen",

    // Smart Analysis
    "fibrogauge.smart_analysis.title": "🤖 Intelligente KI-Analyse",
    "fibrogauge.smart_analysis.description":
      "KI-System analysiert das Bild automatisch ohne Konfiguration",
    "fibrogauge.smart_analysis.ready": "KI ist bereit, Ihr Bild zu analysieren",
    "fibrogauge.smart_analysis.analyzing": "KI analysiert das Bild",
    "fibrogauge.smart_analysis.ai_working":
      "Automatische Erkennung von Ansichtstyp, SWE-Stadium und Fibrose-Level...",
    "fibrogauge.smart_analysis.auto_detected":
      "KI hat automatisch alle Parameter erkannt und analysiert",
    "fibrogauge.smart_analysis.no_config":
      "Keine Konfiguration erforderlich - KI erledigt alles!",

    // Error messages
    "fibrogauge.error.no_file": "Bitte wählen Sie zuerst eine Bilddatei aus",
    "fibrogauge.error.analysis_failed":
      "Analyse fehlgeschlagen, bitte versuchen Sie es erneut",

    // Results
    "fibrogauge.results.normal_liver":
      "Normales Lebergewebe ohne signifikante Fibrose",
    "fibrogauge.results.mild_fibrosis":
      "Leichte Fibrose mit minimalen strukturellen Veränderungen erkannt",
    "fibrogauge.results.moderate_fibrosis": "Mäßige Fibrose erkannt (F2)",
    "fibrogauge.results.severe_fibrosis":
      "Schwere Fibrose mit erheblichen strukturellen Veränderungen",
    "fibrogauge.results.cirrhosis":
      "Zirrhose erkannt - ausgedehnte Fibrose und Gewebeschäden",
    "fibrogauge.ai_insights.sample":
      "KI-Analyse erkannte Gewebemerkmale, die auf F2-Level-Veränderungen mit hohem Vertrauen hinweisen. Regelmäßige Überwachung hilft bei der Bewertung des Fortschreitens.",
    "fibrogauge.recommendations.lifestyle":
      "Ernährungsgewohnheiten verbessern, Alkoholkonsum vermeiden",
    "fibrogauge.recommendations.monitoring": "Nachuntersuchungen alle 6 Monate",
    "fibrogauge.recommendations.consultation":
      "Spezialist für kontinuierliche Betreuung konsultieren",

    // HepaSage Page
    "hepasage.medical_assistant": "KI-Medizinassistent",
    "hepasage.specialist_title": "Hepatologie-Spezialist",
    "hepasage.online": "Online",
    "hepasage.typing": "Tippt...",
    "hepasage.input_placeholder":
      "Geben Sie Ihre Frage zur Lebergesundheit ein...",
    "hepasage.quick_questions": "Beliebte Fragen",
    "hepasage.disclaimer_title": "Wichtiger Hinweis",
    "hepasage.disclaimer":
      "Die bereitgestellten Informationen dienen nur Bildungszwecken, nicht der medizinischen Diagnose. Bitte konsultieren Sie einen Arzt für eine angemessene Behandlung.",
    "hepasage.capabilities": "Fähigkeiten",
    "hepasage.capability1": "Fragen zur Lebergesundheit beantworten",
    "hepasage.capability2": "Testergebnisse erklären",
    "hepasage.capability3": "Gesundheitsversorgung empfehlen",
    "hepasage.capability4": "Behandlungsinformationen bereitstellen",

    // Help Dialog
    "help.dialog.title": "Benutzerhandbuch",
    "help.dialog.close": "Schließen",
    "help.fibrogauge.title": "FibroGauge™ Fibrose-Analyse Leitfaden",
    "help.fibrogauge.description":
      "Ultraschall-Bildanalysesystem zur Bewertung des Leberfibrose-Levels mit fortschrittlicher KI-Technologie für hohe Genauigkeit",

    "help.view_type.title": "Ansichtstyp",
    "help.view_type.description":
      "Sonden-Position für Leber-Ultraschallbildgebung. Jeder Typ liefert unterschiedliche Informationen",
    "help.view_type.intercostal.title": "Interkostale Ansicht",
    "help.view_type.intercostal.description":
      "Bildgebung durch Rippen, seitliche Leberansicht. Ideal für Gewebesteifigkeitsmessung",
    "help.view_type.subcostal.title": "Subkostale Ansicht",
    "help.view_type.subcostal.description":
      "Bildgebung von unter den Rippen, untere Leberansicht. Bietet Gesamtleberbewertung",

    "help.swe_stage.title": "SWE-Stadium (Scherwellen-Elastographie)",
    "help.swe_stage.description":
      "Lebergewebesteifigkeitsmessung mit Schallwellen. Mehr Fibrose bedeutet steiferes Gewebe",
    "help.swe_stage.f0.title": "F0 - Normale Leber",
    "help.swe_stage.f0.description":
      "Keine Fibrose. Steifigkeit < 7 kPa. Gesunde Leber",
    "help.swe_stage.f1.title": "F1 - Leichte Fibrose",
    "help.swe_stage.f1.description":
      "Frühstadium-Fibrose. Steifigkeit 7-9 kPa. Noch behandelbar",
    "help.swe_stage.f2.title": "F2 - Mäßige Fibrose",
    "help.swe_stage.f2.description":
      "Mäßige Fibrose. Steifigkeit 9-12 kPa. Erfordert Überwachung und Behandlung",
    "help.swe_stage.f3.title": "F3 - Schwere Fibrose",
    "help.swe_stage.f3.description":
      "Fortgeschrittene Fibrose. Steifigkeit 12-14 kPa. Prä-zirrhotisch, dringende Behandlung erforderlich",
    "help.swe_stage.f4.title": "F4 - Zirrhose",
    "help.swe_stage.f4.description":
      "Vollständige Zirrhose. Steifigkeit > 14 kPa. Sofortige Behandlung, möglicherweise Lebertransplantation erforderlich",

    "help.setup.title": "Setup-Anweisungen",
    "help.setup.description": "Konfigurationsschritte für genaue Analyse",
    "help.setup.step1": "1. Ansichtstyp auswählen",
    "help.setup.step1_detail":
      "Bildgebungsposition gemäß Protokoll wählen. 'Unbekannt' wählen, wenn unsicher",
    "help.setup.step2": "2. SWE-Stadium angeben (falls verfügbar)",
    "help.setup.step2_detail":
      "Falls SWE-Ergebnisse verfügbar, passendes Stadium wählen. 'Unbekannt' wählen, wenn nicht verfügbar",
    "help.setup.step3": "3. Analyse starten",
    "help.setup.step3_detail":
      "KI analysiert das Bild und liefert Ergebnisse mit klinischen Empfehlungen",

    "help.hepasage.title": "HepaSage™ KI-Arzt Leitfaden",
    "help.hepasage.description":
      "Spezialisiertes Hepatologie-Beratungssystem für medizinische Beratung und Informationen",
    "help.hepasage.features.title": "Hauptfähigkeiten",
    "help.hepasage.features.medical_qa": "Medizinische Q&A",
    "help.hepasage.features.medical_qa_desc":
      "Fragen zu Lebererkrankungen, Behandlungen und Gesundheitsversorgung beantworten",
    "help.hepasage.features.result_interpretation": "Ergebnisinterpretation",
    "help.hepasage.features.result_interpretation_desc":
      "Verschiedene Testergebnisse erklären und klinische Empfehlungen geben",

    // Clinical Reports
    "reports.title": "Klinische Berichte",
    "reports.header.title": "Klinisches Berichtsmanagementsystem",
    "reports.header.subtitle":
      "Erstellen, verwalten und digital signieren Sie medizinische Berichte professionell",
    "reports.search.placeholder":
      "Suche nach Patientenname, ID oder Berichtstitel...",
    "reports.filter.status": "Status",
    "reports.filter.type": "Berichtstyp",
    "reports.filter.all": "Alle",
    "reports.status.draft": "Entwurf",
    "reports.status.completed": "Abgeschlossen",
    "reports.status.signed": "Signiert",
    "reports.status.archived": "Archiviert",
    "reports.type.comprehensive": "Umfassender Bericht",
    "reports.create.button": "Bericht erstellen",
    "reports.create.title": "Neuen Bericht erstellen",
    "reports.create.patient_id": "Patienten-ID",
    "reports.create.patient_name": "Patientenname",
    "reports.create.type": "Berichtstyp",
    "reports.create.findings": "Befunde",
    "reports.create.recommendations": "Empfehlungen",
    "reports.create.save": "Speichern",
    "reports.table.id": "Berichts-ID",
    "reports.table.patient": "Patient",
    "reports.table.type": "Typ",
    "reports.table.title": "Berichtstitel",
    "reports.table.status": "Status",
    "reports.table.created": "Erstellungsdatum",
    "reports.table.actions": "Aktionen",
    "reports.details.findings": "Befunde",
    "reports.details.recommendations": "Empfehlungen",
    "reports.signed_by": "Signiert von",
    "reports.download_pdf": "PDF herunterladen",
    "reports.sign": "Signieren",
    "reports.no_results":
      "Keine Berichte gefunden, die den Suchkriterien entsprechen",
    "common.cancel": "Abbrechen",
    "common.close": "Schließen",
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<"th" | "en" | "de">(
    "en"
  );
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as
      | "th"
      | "en"
      | "de";
    if (savedLanguage && ["th", "en", "de"].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: "th" | "en" | "de") => {
    setCurrentLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    const currentTranslations = translations[currentLanguage];
    const fallbackTranslations = translations["en"];
    return currentTranslations?.[key] || fallbackTranslations?.[key] || key;
  };

  const translateText = async (
    text: string,
    targetLang: "th" | "en" | "de" = currentLanguage
  ): Promise<string> => {
    if (!text) return text;

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translation/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          text,
          target_language: targetLang,
          context: "medical",
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      return data.translated_text || text;
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        translateText,
        isTranslating,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
