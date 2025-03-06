import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.MISTRAL_API_KEY;
    const url = "https://api.mistral.ai/v1/chat/completions";

    const requestBody = {
      model: "mistral-tiny",
      messages: [
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      stream: false,
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      url,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Mistral API');
    }

    return NextResponse.json({ reply: response.data.choices[0].message.content });
  } catch (error: any) {
    console.error('Mistral API Error:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to get response from Mistral AI' },
      { status: 500 }
    );
  }
}
