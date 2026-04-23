export async function compressImage(
  file: File,
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    mimeType?: string;
  }
): Promise<File> {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.82,
    mimeType = "image/jpeg",
  } = options ?? {};

  if (!file.type.startsWith("image/")) {
    throw new Error("Selected file is not an image.");
  }

  const imageBitmap = await createImageBitmap(file);

  let { width, height } = imageBitmap;

  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context.");
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });

  if (!blob) {
    throw new Error("Failed to compress image.");
  }

  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}.jpg`, {
    type: mimeType,
    lastModified: Date.now(),
  });
}