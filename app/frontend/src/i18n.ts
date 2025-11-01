export type Lang = "en" | "th";

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    title: "SmartLiva",
    subtitle: "FibroGauge™ • HepaSage™ AI Liver Platform",
    upload: "Upload Ultrasound Image",
    viewType: "View Type",
    sweStage: "SWE Stage",
    runAnalysis: "Run Analysis",
    analyzing: "Analyzing...",
    results: "Results",
    fibrosis: "Fibrosis",
    condition: "Condition Classification",
    confidence: "Confidence",
    chat: "HepaSage™ Chat",
    chatPlaceholder: "Ask about liver health, symptoms, treatments...",
    send: "Send",
    language: "Language",
    typing: "Dr. HepaSage is typing...",
    chatWelcome:
      "Hello! I'm Dr. HepaSage, your AI liver specialist. Ask me anything about liver health, diseases, or treatments.",
    exampleQuestions: "Example Questions:",
    example1: "What are the stages of liver fibrosis?",
    example2: "How is hepatitis B transmitted?",
    example3: "What foods are good for liver health?",
    example4: "What are the symptoms of liver cirrhosis?",
    clearChat: "Clear Chat",
    copyMessage: "Copy message",
    messageCopied: "Message copied!",
  },
  th: {
    title: "SmartLiva",
    subtitle: "FibroGauge™ • HepaSage™ แพลตฟอร์ม AI ด้านตับ",
    upload: "อัปโหลดภาพอัลตราซาวด์",
    viewType: "มุมมองภาพ",
    sweStage: "ระยะ SWE",
    runAnalysis: "วิเคราะห์",
    analyzing: "กำลังวิเคราะห์...",
    results: "ผลลัพธ์",
    fibrosis: "พังผืด",
    condition: "การจัดจำแนกภาวะ",
    confidence: "ความเชื่อมั่น",
    chat: "HepaSage™ แชต",
    chatPlaceholder: "พิมพ์คำถามเกี่ยวกับสุขภาพตับ อาการ การรักษา...",
    send: "ส่ง",
    language: "ภาษา",
    typing: "ดร.HepaSage กำลังพิมพ์...",
    chatWelcome:
      "สวัสดี! ผมดร.HepaSage ผู้เชี่ยวชาญด้านตับ AI ของคุณ ถามผมเรื่องสุขภาพตับ โรค หรือการรักษาได้เลย",
    exampleQuestions: "คำถามตัวอย่าง:",
    example1: "ระยะของพังผืดตับมีอะไรบ้าง?",
    example2: "ไวรัสตับอักเสบบีติดต่อกันอย่างไร?",
    example3: "อาหารอะไรดีต่อตับ?",
    example4: "อาการของตับแข็งมีอะไรบ้าง?",
    clearChat: "ล้างแชต",
    copyMessage: "คัดลอกข้อความ",
    messageCopied: "คัดลอกแล้ว!",
  },
};

export function t(lang: Lang, key: string) {
  return translations[lang][key] || key;
}
