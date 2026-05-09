import axios from "axios";

const MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions";

export async function getMistralReply(userText: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY is not configured");
  }

  const response = await axios.post(
    MISTRAL_URL,
    {
      model: "mistral-tiny",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly voice assistant. Keep replies short, natural, and conversational so they sound good when spoken out loud.",
        },
        { role: "user", content: userText },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      stream: false,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  const reply = response.data?.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error("Invalid response format from Mistral API");
  }
  return reply;
}
