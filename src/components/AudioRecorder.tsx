"use client";

import React, { useEffect, useRef, useState } from "react";
import { decodeMorse } from "../utils/morseDecoder";

const AudioRecorder = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [currentMorse, setCurrentMorse] = useState<string>("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          audioContextRef.current = new AudioContext();
          const source =
            audioContextRef.current.createMediaStreamSource(stream);
          analyserRef.current = audioContextRef.current.createAnalyser();
          source.connect(analyserRef.current);
          analyserRef.current.fftSize = 2048;

          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount
          );

          const processAudio = () => {
            analyserRef.current?.getByteTimeDomainData(dataArray);
            const decodedMessage = decodeMorse(dataArray);
            setCurrentMorse((prevMorse) => prevMorse + decodedMessage);
            requestAnimationFrame(processAudio);
          };

          processAudio();
        })
        .catch((err) => {
          console.error("Error accessing the microphone", err);
        });
    } else {
      console.error("getUserMedia not supported in this browser");
    }

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Update transcript when currentMorse changes
  useEffect(() => {
    setTranscript((prevTranscript) => prevTranscript + currentMorse);
  }, [currentMorse]);

  return (
    <div className="w-screen overflow-clip flex flex-col h-screen px-6">
      <h1>Real-time Morse Code Translator</h1>
      <textarea
        title="morse"
        value={transcript}
        className=" w-full grow  whitespace-pre-wrap bg-slate-200 rounded-md"
      />
    </div>
  );
};

export default AudioRecorder;
