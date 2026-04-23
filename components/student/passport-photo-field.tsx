"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/compress-image";

type PassportPhotoFieldProps = {
  name?: string;
  defaultImageUrl?: string | null;
};

function DefaultAvatar() {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 rounded-full bg-slate-100" />
      <div className="absolute left-1/2 top-[24%] h-20 w-20 -translate-x-1/2 rounded-full bg-slate-400" />
      <div className="absolute left-1/2 top-[48%] h-28 w-36 -translate-x-1/2 rounded-t-[45%] rounded-b-[35%] bg-slate-500" />
      <div className="absolute inset-3 rounded-full border border-slate-200" />
    </div>
  );
}

export function PassportPhotoField({
  name = "passportPhoto",
  defaultImageUrl = null,
}: PassportPhotoFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dataTransferRef = useRef<DataTransfer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImageUrl);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputId = useMemo(() => `${name}-file-input`, [name]);

  useEffect(() => {
    setPreviewUrl(defaultImageUrl);
  }, [defaultImageUrl]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    async function attachStream() {
      if (!cameraOpen || !videoRef.current || !streamRef.current) return;

      try {
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
      } catch {
        setCameraError("Unable to preview camera feed.");
      }
    }

    attachStream();
  }, [cameraOpen]);

  function ensureDataTransfer() {
    if (!dataTransferRef.current) {
      dataTransferRef.current = new DataTransfer();
    }
    return dataTransferRef.current;
  }

  function stopCamera() {
    const stream = streamRef.current;
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function updatePreviewUrl(nextUrl: string) {
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return nextUrl;
    });
  }

  function setInputFile(file: File) {
    const dataTransfer = ensureDataTransfer();
    dataTransfer.items.clear();
    dataTransfer.items.add(file);

    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }

    updatePreviewUrl(URL.createObjectURL(file));
  }

  async function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setCameraError(null);
    setIsCompressing(true);

    try {
      stopCamera();
      setCameraOpen(false);

      const compressedFile = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.82,
        mimeType: "image/jpeg",
      });

      setInputFile(compressedFile);
    } catch {
      setCameraError("Unable to process the selected image.");
    } finally {
      setIsCompressing(false);
    }
  }

  async function openCamera() {
    setCameraError(null);
    setIsStartingCamera(true);

    try {
      stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 720 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);
    } catch {
      setCameraError(
        "Unable to access the camera. Check permission or use Upload File."
      );
      setCameraOpen(false);
    } finally {
      setIsStartingCamera(false);
    }
  }

  function closeCamera() {
    stopCamera();
    setCameraOpen(false);
  }

  async function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth || 720;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, width, height);

    setCameraError(null);
    setIsCompressing(true);

    canvas.toBlob(
      async (blob) => {
        try {
          if (!blob) return;

          const rawFile = new File([blob], `passport-${Date.now()}.png`, {
            type: "image/png",
          });

          const compressedFile = await compressImage(rawFile, {
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.82,
            mimeType: "image/jpeg",
          });

          setInputFile(compressedFile);
          closeCamera();
        } catch {
          setCameraError("Unable to process captured image.");
        } finally {
          setIsCompressing(false);
        }
      },
      "image/png",
      0.95
    );
  }

  const isBlobPreview = Boolean(previewUrl?.startsWith("blob:"));

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        id={fileInputId}
        name={name}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />

      {cameraError ? <p className="text-sm text-red-600">{cameraError}</p> : null}

      <div className="flex justify-center">
        <div className="relative h-64 w-64 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm">
          {cameraOpen ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover object-center"
            />
          ) : previewUrl ? (
            isBlobPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Passport preview"
                className="h-full w-full object-cover object-center"
              />
            ) : (
              <Image
                src={previewUrl}
                alt="Passport preview"
                fill
                unoptimized
                className="object-cover object-center"
              />
            )
          ) : (
            <DefaultAvatar />
          )}

          <div className="pointer-events-none absolute inset-3 rounded-full border-2 border-white/70" />
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-slate-200" />

          {cameraOpen ? (
            <div className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Live Camera
            </div>
          ) : null}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {isCompressing ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Processing image...
        </div>
      ) : null}

      {cameraOpen ? (
        <div className="space-y-3">
          <Button
            type="button"
            onClick={capturePhoto}
            className="w-full bg-green-600 hover:bg-green-500"
            disabled={isCompressing}
          >
            Capture Photo
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={closeCamera}
            className="w-full"
            disabled={isCompressing}
          >
            Close Camera
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-3">
          <Button
            type="button"
            onClick={openCamera}
            className="w-[250px] bg-green-600 hover:bg-green-500"
            disabled={isStartingCamera || isCompressing}
          >
            {isStartingCamera ? "Opening Camera..." : "Take Photo"}
          </Button>

          <Button
            type="button"
            className="w-[250px] bg-green-600 hover:bg-green-500"
            onClick={() => fileInputRef.current?.click()}
            disabled={isCompressing}
          >
            Upload File
          </Button>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Best results come from a clear, front-facing image with good lighting.
      </p>
    </div>
  );
}