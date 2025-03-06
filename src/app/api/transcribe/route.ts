import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error('DEEPGRAM_API_KEY is not configured in environment variables');
    }

    const deepgram = createClient(apiKey);

    const formData = await req.formData();
    const audioBlob = formData.get("audio") as Blob;
    const buffer = Buffer.from(await audioBlob.arrayBuffer());

    const response = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        mimetype: 'audio/wav',
        model: 'nova-3',
        smart_format: true
      }
    );

    const transcript = response.result?.results?.channels[0]?.alternatives[0]?.transcript;
    return NextResponse.json({ transcript });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}