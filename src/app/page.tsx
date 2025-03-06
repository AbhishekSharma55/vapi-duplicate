"use client";
import { useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function Home() {
  const [reply, setReply] = useState<string | null>(null);

  const handleTranscript = async (transcript: string) => {
    console.log("User said:", transcript);

    try {
      // Send to Mistral AI
      const mistralRes = await fetch("/api/mistral", {
        method: "POST",
        body: JSON.stringify({ text: transcript }),
      });
      
      if (!mistralRes.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const { reply } = await mistralRes.json();
      setReply(reply);

      // Convert reply to speech
      const audioRes = await fetch("/api/text-to-speech", {
        method: "POST",
        body: JSON.stringify({ text: reply }),
      });
      
      if (!audioRes.ok) {
        throw new Error('Text-to-speech conversion failed');
      }
      
      const audioBlob = await audioRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the audio
      const audio = new Audio(audioUrl);
      await audio.play();
      
      // Clean up the URL object after playing
      URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error('Error:', error);
      setReply('Sorry, there was an error processing your request.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Voice Assistant</h1>
      <VoiceRecorder onTranscript={handleTranscript} />
      {reply && <p className="mt-4">Assistant: {reply}</p>}
    </div>
  );
}
