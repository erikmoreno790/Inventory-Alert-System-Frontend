// src/hooks/useBarcodeScanner.js
import { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/library";

export default function useBarcodeScanner(onDetected) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);
  const scanning = useRef(false);
  const [isScanning, setIsScanning] = useState(false);

  const lastCode = useRef(null);

  // Inicializar lector
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();

    return () => {
      stop();
      readerRef.current?.reset();
    };
  }, []);

  const start = useCallback(async () => {
    try {
      if (isScanning) return;

      setIsScanning(true);
      scanning.current = true;

      const devices = await navigator.mediaDevices.enumerateDevices();
      const backCamera = devices.find(
        (d) =>
          d.kind === "videoinput" &&
          d.label.toLowerCase().includes("back")
      );

      const constraints = {
        video: backCamera
          ? { deviceId: backCamera.deviceId }
          : { facingMode: "environment" },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      readerRef.current.decodeFromVideoDevice(
        null,
        video,
        (result) => {
          if (!result) return;

          const text = result.getText().trim();

          if (text === lastCode.current) return;
          lastCode.current = text;

          if (navigator.vibrate) navigator.vibrate(100);

          stop();
          onDetected(text);
        }
      );
    } catch (err) {
      setIsScanning(false);
      throw err;
    }
  }, [isScanning, onDetected]);

  const stop = useCallback(() => {
    scanning.current = false;
    setIsScanning(false);

    if (readerRef.current) readerRef.current.reset();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  return {
    videoRef,
    isScanning,
    start,
    stop,
  };
}
