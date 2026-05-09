"use client";
import { useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";

type Turn = { role: "user" | "assistant"; text: string };

export default function Home() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranscript = async (transcript: string) => {
    setError(null);
    setTurns((prev) => [...prev, { role: "user", text: transcript }]);
    setThinking(true);

    try {
      const mistralRes = await fetch("/api/mistral", {
        method: "POST",
        body: JSON.stringify({ text: transcript }),
      });
      if (!mistralRes.ok) throw new Error("Failed to get AI response");
      const { reply } = await mistralRes.json();
      setTurns((prev) => [...prev, { role: "assistant", text: reply }]);

      const audioRes = await fetch("/api/text-to-speech", {
        method: "POST",
        body: JSON.stringify({ text: reply }),
      });
      if (!audioRes.ok) throw new Error("Text-to-speech conversion failed");

      const audioBlob = await audioRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => URL.revokeObjectURL(audioUrl);
      await audio.play();
    } catch (err) {
      console.error("Pipeline error:", err);
      setError("Sorry, there was an error processing your request.");
    } finally {
      setThinking(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-12">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Voice AI Assistant
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          A Vapi-style demo · Deepgram → Mistral → ElevenLabs
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/50 p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/40">
        <div className="flex min-h-[180px] flex-col gap-3">
          {turns.length === 0 && !thinking && (
            <p className="m-auto text-sm text-gray-500">
              Press the microphone and start talking.
            </p>
          )}
          {turns.map((turn, idx) => (
            <div
              key={idx}
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                turn.role === "user"
                  ? "self-end bg-indigo-600 text-white"
                  : "self-start bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              }`}
            >
              {turn.text}
            </div>
          ))}
          {thinking && (
            <div className="self-start rounded-2xl bg-gray-100 px-4 py-2 text-sm text-gray-500 dark:bg-gray-800">
              Thinking…
            </div>
          )}
        </div>

        <div className="flex flex-col items-center border-t border-gray-200 pt-6 dark:border-gray-800">
          <VoiceRecorder onTranscript={handleTranscript} disabled={thinking} />
          {error && (
            <p className="mt-3 text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>
      </section>

      <footer className="text-center text-xs text-gray-500">
        Built with Next.js · Speech-to-text by Deepgram · LLM by Mistral · Voice
        by ElevenLabs
      </footer>
    </main>
  );
}
