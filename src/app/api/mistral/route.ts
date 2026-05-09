import { NextRequest, NextResponse } from "next/server";
import { getMistralReply } from "@/lib/services/mistral";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing 'text' in request body" },
        { status: 400 }
      );
    }

    const reply = await getMistralReply(text);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Mistral error:", error);
    return NextResponse.json(
      { error: "Failed to get response from Mistral AI" },
      { status: 500 }
    );
  }
}
