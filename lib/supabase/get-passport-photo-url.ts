import { supabaseAdmin } from "@/lib/supabase/server";

const bucket = process.env.SUPABASE_STORAGE_BUCKET || "students-passport";

export async function getPassportPhotoUrl(path: string | null) {
  if (!path) return null;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60);

  if (error || !data?.signedUrl) {
    return null;
  }

  return data.signedUrl;
}