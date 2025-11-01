export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, source_lang, target_lang } = req.body;

    if (!text || !target_lang) {
      return res.status(400).json({ error: "Missing text or target_lang" });
    }

    // Use Google Translate API (free alternative: use googletrans Python package via API)
    // For now, using a simple implementation with Google Translate unofficial API

    const translate = require("@vitalets/google-translate-api");

    const result = await translate(text, {
      from: source_lang || "auto",
      to: target_lang,
    });

    return res.status(200).json({
      translated_text: result.text,
      source_lang: result.from.language.iso,
      target_lang: target_lang,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return res.status(500).json({
      error: "Translation failed",
      details: error.message,
    });
  }
}
