"use client";
import { useState, useRef } from "react";

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void | Promise<void>;
  disabled?: boolean;
}

type Status = "idle" | "recording" | "transcribing" | "error";

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  disabled = false,
}) => {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const mediaStream = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStream.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorder.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.current.push(event.data);
      };
      recorder.onstop = processRecording;
      recorder.start();
      setStatus("recording");
    } catch (error) {
      console.error("Error starting recording:", error);
      setStatus("error");
      setErrorMessage(
        "Could not access microphone. Please grant permission and try again."
      );
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    mediaStream.current?.getTracks().forEach((t) => t.stop());
    mediaStream.current = null;
    setStatus("transcribing");
  };

  const processRecording = async () => {
    try {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
      audioChunks.current = [];

      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Transcription request failed");

      const { transcript } = await response.json();
      if (!transcript) {
        setStatus("error");
        setErrorMessage("Couldn't make out what you said. Try again?");
        return;
      }

      await onTranscript(transcript);
      setStatus("idle");
    } catch (error) {
      console.error("Error processing recording:", error);
      setStatus("error");
      setErrorMessage("Something went wrong while processing your voice.");
    }
  };

  const isBusy = status === "transcribing";
  const isRecording = status === "recording";
  const isDisabled = disabled || isBusy;

  const label = isRecording
    ? "Stop"
    : isBusy
      ? "Transcribing…"
      : "Start talking";

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isDisabled}
        className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white shadow-lg transition focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${
          isRecording
            ? "bg-red-500 hover:bg-red-600 focus:ring-red-300"
            : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300"
        }`}
        aria-label={label}
      >
        {isRecording && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
        )}
        <span className="relative text-3xl">{isRecording ? "■" : "🎙"}</span>
      </button>
      <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p>
      {errorMessage && (
        <p className="text-sm text-red-500" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default VoiceRecorder;
