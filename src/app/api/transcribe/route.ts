import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/services/deepgram";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob | null;
    if (!audioBlob) {
      return NextResponse.json(
        { error: "Missing 'audio' field in form data" },
        { status: 400 }
      );
    }

    const transcript = await transcribeAudio(audioBlob);
    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
