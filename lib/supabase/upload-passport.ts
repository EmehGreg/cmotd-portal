import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/server";

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "students-passport";

export async function uploadPassportPhoto(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
      ? "webp"
      : "jpg";

  const objectPath = `passports/${new Date().getFullYear()}/${randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(objectPath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  return objectPath;
}