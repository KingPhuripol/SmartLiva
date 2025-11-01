function isLiverRelated(text) {
  const liverKeywords = [
    "liver",
    "hepat",
    "cirrhosis",
    "fibrosis",
    "hcc",
    "hepatocellular",
    "fatty liver",
    "nafld",
    "nash",
    "alt",
    "ast",
    "bilirubin",
    "jaundice",
    "ascites",
    "portal hypertension",
    "varices",
    "hepatitis",
    "cholangiocarcinoma",
    "biliary",
    "gallbladder",
    "transplant",
    "fibroscan",
    "elastography",
    "steatosis",
    "ตับ",
    "ตับอักเสบ",
    "ตับแข็ง",
    "มะเร็งตับ",
    "ไขมันพอกตับ",
  ];
  const textLower = text.toLowerCase();
  return liverKeywords.some((kw) => textLower.includes(kw));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { history, max_new_tokens = 300, temperature = 0.7 } = req.body;

    if (
      !history ||
      history.length === 0 ||
      history[history.length - 1].role !== "user"
    ) {
      return res.status(400).json({ error: "Last message must be from user" });
    }

    const userMessage = history[history.length - 1].content;

    // Check if liver-related
    if (!isLiverRelated(userMessage)) {
      return res.status(200).json({
        reply:
          "As Dr. HepaSage, I specialize in liver health and hepatology. I can provide detailed information about hepatitis, cirrhosis, fatty liver disease, liver cancer, liver function tests, and liver health maintenance. Could you please ask me something related to liver health instead?",
        usage_tokens: 50,
      });
    }

    // Check OpenAI API key
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "OpenAI API key not configured" });
    }

    // System prompt
    const systemPrompt = `You are Dr. HepaSage, a world-renowned hepatologist providing evidence-based, educational information about liver health. Focus ONLY on hepatology (hepatitis, fibrosis staging F0-F4, fatty liver, cirrhosis complications, HCC screening, portal hypertension, transplantation, autoimmune/drug-induced liver disease, lifestyle factors). If user asks something non-liver-related, politely redirect to liver topics. IMPORTANT: Always respond in the SAME LANGUAGE that the user uses (Thai, German, English, or any other language). Explain terms clearly, structure answers with short paragraphs or bullet points where helpful, and ALWAYS end with this disclaimer in the user's language: *Medical Disclaimer: This information is for educational purposes only and should not replace professional medical advice. Please consult a qualified healthcare provider.*`;

    // Build messages
    const messages = [{ role: "system", content: systemPrompt }, ...history];

    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages,
        max_tokens: max_new_tokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return res.status(response.status).json({ error: "OpenAI API error" });
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;
    const usage = data.usage?.total_tokens || 0;

    return res.status(200).json({
      reply,
      usage_tokens: usage,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
