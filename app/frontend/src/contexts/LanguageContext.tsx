import React, { createContext, useContext, useState, useEffect } from "react";

// Language Context with OpenAI API support
interface LanguageContextType {
  currentLanguage: "th" | "en";
  setLanguage: (lang: "th" | "en") => void;
  t: (key: string) => string;
  translateText: (text: string, targetLang?: "th" | "en") => Promise<string>;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// Enhanced translation dictionaries with OpenAI support
const translations = {
  th: {
    // Navigation & General
    "app.title": "ระบบ AI วิเคราะห์ตับ SmartLiva",
    "app.subtitle":
      "เทคโนโลยี AI ขั้นสูงสำหรับการวิเคราะห์สุขภาพตับอย่างแม่นยำ",
    "nav.dashboard": "แดชบอร์ดคลินิก",
    "nav.patients": "ผู้ป่วย",
    "nav.analysis": "การวิเคราะห์ AI",
    "nav.reports": "รายงาน",
    "nav.settings": "ตั้งค่า",
    "nav.logout": "ออกจากระบบ",

    // Analysis & Upload
    "analysis.fibrosis_title": "FibroGauge™ การวิเคราะห์อัลตราซาวด์",
    "upload.button": "อัปโหลดภาพ",
    "upload.drag": "ลากภาพมาวางที่นี่หรือคลิกเพื่อเลือกไฟล์",
    "upload.formats": "รองรับไฟล์ JPG, PNG, DICOM",

    // Chat Section
    "chat.title": "HepaSage™ แชทบอท",
    "chat.subtitle":
      "ถามคำถาม Dr. HepaSage เกี่ยวกับสุขภาพตับ: เส้นใยแข็งตับ, ตับอักเสบ, ตับแข็ง, การดูแลสุขภาพ, การตรวจคัดกรอง",
    "chat.example": "ระยะของเส้นใยแข็งตับมีกี่ระยะและแต่ละระยะหมายถึงอะไร?",
    "chat.try_more": "ลองคำถามเพิ่มเติมในหน้าแชท",

    // Form Labels
    "form.view_type": "ชนิดการมอง",
    "form.swe_stage": "ระยะ SWE",
    "form.analyze": "วิเคราะห์",
    "form.analyzing": "กำลังวิเคราะห์...",

    // Results
    "results.title": "ผลการวิเคราะห์",
    "results.fibrosis": "ระยะเส้นใยแข็งตับ",
    "results.condition": "สภาวะ",
    "results.confidence": "ความเชื่อมั่น",

    // Common
    "common.loading": "กำลังโหลด...",
    "common.error": "เกิดข้อผิดพลาด",
    "common.success": "สำเร็จ",
    "common.translating": "กำลังแปล...",
    "lang.select": "เลือกภาษา",

    // Dashboard
    "dashboard.title": "แดชบอร์ดคลินิก SmartLiva",
    "dashboard.welcome": "ยินดีต้อนรับสู่ระบบวิเคราะห์ตับอัจฉริยะ",
    "dashboard.patients.today": "ผู้ป่วยวันนี้",
    "dashboard.analyses.pending": "การวิเคราะห์ที่รอดำเนินการ",
    "dashboard.reports.generated": "รายงานที่สร้างแล้ว",
    "dashboard.accuracy.rate": "อัตราความแม่นยำ",

    // Patient Management
    "patients.title": "จัดการผู้ป่วย",
    "patients.add": "เพิ่มผู้ป่วยใหม่",
    "patients.search": "ค้นหาผู้ป่วย...",
    "patients.id": "รหัสผู้ป่วย",
    "patients.name": "ชื่อ-นามสกุล",
    "patients.age": "อายุ",
    "patients.gender": "เพศ",
    "patients.contact": "ข้อมูลติดต่อ",
    "patients.last.visit": "การเยี่ยมล่าสุด",
    "patients.status": "สถานะ",

    // Medical Analysis
    "analysis.title": "การวิเคราะห์ทางการแพทย์",
    "analysis.upload": "อัปโหลดภาพ Ultrasound",
    "analysis.processing": "กำลังประมวลผล...",
    "analysis.fibrosis": "การวิเคราะห์ไฟโบรซิส",
    "analysis.hcc": "การตรวจหามะเร็งตับ",
    "analysis.quality": "คุณภาพภาพ",
    "analysis.confidence": "ความมั่นใจ",
    "analysis.stage": "ระยะ",
    "analysis.recommendation": "คำแนะนำ",

    // Medical Reports
    "reports.title": "รายงานทางการแพทย์",
    "reports.generate": "สร้างรายงาน",
    "reports.patient": "ผู้ป่วย",
    "reports.date": "วันที่",
    "reports.type": "ประเภทรายงาน",
    "reports.status": "สถานะ",
    "reports.download": "ดาวน์โหลด",
    "reports.view": "ดู",
    "reports.sign": "ลงนามดิจิทัล",

    // Medical Terms
    "medical.fibrosis": "ไฟโบรซิส",
    "medical.cirrhosis": "ตับแข็ง",
    "medical.hcc": "มะเร็งตับ",
    "medical.ultrasound": "คลื่นเสียงความถี่สูง",
    "medical.elastography": "อีลาสโตกราฟี",
    "medical.stiffness": "ความแข็งของตับ",
    "medical.lesion": "รอยโรค",
    "medical.benign": "ไม่เป็นมะเร็ง",
    "medical.malignant": "เป็นมะเร็ง",
    "medical.normal": "ปกติ",
    "medical.abnormal": "ผิดปกติ",

    // Buttons & Actions
    "btn.save": "บันทึก",
    "btn.cancel": "ยกเลิก",
    "btn.edit": "แก้ไข",
    "btn.delete": "ลบ",
    "btn.view": "ดู",
    "btn.download": "ดาวน์โหลด",
    "btn.upload": "อัปโหลด",
    "btn.analyze": "วิเคราะห์",
    "btn.generate": "สร้าง",
    "btn.approve": "อนุมัติ",
    "btn.reject": "ปฏิเสธ",

    // Status
    "status.active": "ใช้งาน",
    "status.inactive": "ไม่ใช้งาน",
    "status.pending": "รอดำเนินการ",
    "status.completed": "เสร็จสิ้น",
    "status.processing": "กำลังประมวลผล",
    "status.approved": "อนุมัติแล้ว",
    "status.rejected": "ปฏิเสธ",

    // Messages
    "msg.success": "ดำเนินการสำเร็จ",
    "msg.error": "เกิดข้อผิดพลาด",
    "msg.loading": "กำลังโหลด...",
    "msg.no.data": "ไม่มีข้อมูล",
    "msg.confirm.delete": "คุณแน่ใจหรือไม่ที่จะลบ?",

    // Language Selector
    "lang.thai": "ไทย",
    "lang.english": "English",

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
  },

  en: {
    // Navigation & General
    "app.title": "SmartLiva Clinical AI",
    "nav.dashboard": "Dashboard",
    "nav.patients": "Patients",
    "nav.analysis": "Analysis",
    "nav.reports": "Reports",
    "nav.settings": "Settings",
    "nav.logout": "Logout",

    // Dashboard
    "dashboard.title": "SmartLiva Clinical Dashboard",
    "dashboard.welcome": "Welcome to Intelligent Liver Analysis System",
    "dashboard.patients.today": "Patients Today",
    "dashboard.analyses.pending": "Pending Analyses",
    "dashboard.reports.generated": "Reports Generated",
    "dashboard.accuracy.rate": "Accuracy Rate",

    // Patient Management
    "patients.title": "Patient Management",
    "patients.add": "Add New Patient",
    "patients.search": "Search patients...",
    "patients.id": "Patient ID",
    "patients.name": "Full Name",
    "patients.age": "Age",
    "patients.gender": "Gender",
    "patients.contact": "Contact Info",
    "patients.last.visit": "Last Visit",
    "patients.status": "Status",

    // Medical Analysis
    "analysis.title": "Medical Analysis",
    "analysis.upload": "Upload Ultrasound Image",
    "analysis.processing": "Processing...",
    "analysis.fibrosis": "Fibrosis Analysis",
    "analysis.hcc": "HCC Detection",
    "analysis.quality": "Image Quality",
    "analysis.confidence": "Confidence",
    "analysis.stage": "Stage",
    "analysis.recommendation": "Recommendation",

    // Medical Reports
    "reports.title": "Medical Reports",
    "reports.generate": "Generate Report",
    "reports.patient": "Patient",
    "reports.date": "Date",
    "reports.type": "Report Type",
    "reports.status": "Status",
    "reports.download": "Download",
    "reports.view": "View",
    "reports.sign": "Digital Sign",

    // Medical Terms
    "medical.fibrosis": "Fibrosis",
    "medical.cirrhosis": "Cirrhosis",
    "medical.hcc": "Hepatocellular Carcinoma",
    "medical.ultrasound": "Ultrasound",
    "medical.elastography": "Elastography",
    "medical.stiffness": "Liver Stiffness",
    "medical.lesion": "Lesion",
    "medical.benign": "Benign",
    "medical.malignant": "Malignant",
    "medical.normal": "Normal",
    "medical.abnormal": "Abnormal",

    // Buttons & Actions
    "btn.save": "Save",
    "btn.cancel": "Cancel",
    "btn.edit": "Edit",
    "btn.delete": "Delete",
    "btn.view": "View",
    "btn.download": "Download",
    "btn.upload": "Upload",
    "btn.analyze": "Analyze",
    "btn.generate": "Generate",
    "btn.approve": "Approve",
    "btn.reject": "Reject",

    // Status
    "status.active": "Active",
    "status.inactive": "Inactive",
    "status.pending": "Pending",
    "status.completed": "Completed",
    "status.processing": "Processing",
    "status.approved": "Approved",
    "status.rejected": "Rejected",

    // Messages
    "msg.success": "Operation successful",
    "msg.error": "An error occurred",
    "msg.loading": "Loading...",
    "msg.no.data": "No data available",
    "msg.confirm.delete": "Are you sure you want to delete?",

    // Language Selector
    "lang.thai": "ไทย",
    "lang.english": "English",
    "lang.select": "Select Language",

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
  },
};

// Language Provider Component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<"th" | "en">("en");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as "th" | "en";
    if (savedLanguage && ["th", "en"].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: "th" | "en") => {
    setCurrentLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    const currentTranslations = translations[currentLanguage] as Record<
      string,
      string
    >;
    const fallbackTranslations = translations["en"] as Record<string, string>;
    return currentTranslations?.[key] || fallbackTranslations?.[key] || key;
  };

  const translateText = async (
    text: string,
    targetLang: "th" | "en" = currentLanguage
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
      return text; // Fallback to original text
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

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Language Selector Component
export const LanguageSelector: React.FC = () => {
  const { currentLanguage, setLanguage, t } = useLanguage();

  const languages = [
    { code: "th" as const, name: "ไทย", flag: "🇹🇭" },
    { code: "en" as const, name: "English", flag: "🇺🇸" },
  ];

  return (
    <div className="relative inline-block text-left">
      <select
        value={currentLanguage}
        onChange={(e) => setLanguage(e.target.value as "th" | "en")}
        className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageProvider;
