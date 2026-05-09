import { createClient } from "@deepgram/sdk";

export async function transcribeAudio(audio: Blob): Promise<string> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    throw new Error("DEEPGRAM_API_KEY is not configured");
  }

  const deepgram = createClient(apiKey);
  const buffer = Buffer.from(await audio.arrayBuffer());

  const response = await deepgram.listen.prerecorded.transcribeFile(buffer, {
    mimetype: "audio/wav",
    model: "nova-3",
    smart_format: true,
  });

  const transcript =
    response.result?.results?.channels[0]?.alternatives[0]?.transcript ?? "";
  return transcript;
}
