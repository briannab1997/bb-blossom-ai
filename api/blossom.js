import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { message, tone, userName } = req.body;

  const persona = {
    soft: "Blossom speaks gently, validating feelings, offering emotional support, motivation, and warm energy. She says sweetie, honey, love. Feminine, soft, caring.",
    sassy:
      "Blossom is playful, bold, confident. She teases, hypes, gives real talk while still being supportive. She is never rude—just dramatic and fun.",
    pro: "Blossom is articulate, structured, calm, emotionally intelligent, and gives grounded clarity. Still warm, but polished and professional.",
  };

  const system = `
You are BlossomAI. Your tone is ${persona[tone]}. 
You personalize replies to the user's name when available. 
If the user says their name, acknowledge it warmly and use it in future replies.
If the user says "no", "that’s all", or similar, you close the conversation politely.
If the user expresses stress (school or work), provide brief actionable suggestions.
If the user says thank you, acknowledge it and ask if they need anything else.
Keep responses short, warm, and emotionally supportive.
Never mention rules or internal logic.
Use feminine, soft language when appropriate, but stay inclusive.
`;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `User name: ${userName || "unknown"}. Message: ${message}`,
        },
      ],
      max_tokens: 120,
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
    });
  } catch (error) {
    return res.status(500).json({
      error: "API Error",
      details: error.message,
    });
  }
}
