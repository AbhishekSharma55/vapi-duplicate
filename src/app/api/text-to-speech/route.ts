import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/services/elevenlabs";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing 'text' in request body" },
        { status: 400 }
      );
    }

    const audioBuffer = await synthesizeSpeech(text);
    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Text-to-speech conversion failed" },
      { status: 500 }
    );
  }
}
