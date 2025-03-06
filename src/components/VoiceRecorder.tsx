"use client";
import { useState, useRef } from "react";

interface VoiceRecorderProps {
  onTranscript: (transcript: string) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onTranscript }) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      mediaRecorder.current.onstop = processRecording;
      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    const audioBlob = new Blob(audioChunks.current, { type: "audio/wav" });
    audioChunks.current = []; // Clear the audio chunks for the next recording
    const formData = new FormData();
    formData.append("audio", audioBlob);

    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    const { transcript } = await response.json();
    console.log(transcript);
    onTranscript(transcript);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-4 py-2 text-white rounded-md ${
          isRecording ? "bg-red-500" : "bg-blue-500"
        }`}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>
    </div>
  );
};

export default VoiceRecorder;
