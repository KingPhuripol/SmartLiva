export default async function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    openai_available: !!process.env.OPENAI_API_KEY,
    translation_available: false
  });
}
