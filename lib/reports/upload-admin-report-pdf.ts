import { supabaseAdmin } from "@/lib/supabase-admin";

type UploadAdminReportPdfArgs = {
  file: File;
  title: string;
  submittedById: string;
};

export async function uploadAdminReportPdf({
  file,
  title,
  submittedById,
}: UploadAdminReportPdfArgs) {
  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const safeTitle = title.replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `${safeTitle}-${Date.now()}.${fileExt}`;
  const storagePath = `admin-reports/${submittedById}/${fileName}`;

  const bytes = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from("reports")
    .upload(storagePath, bytes, {
      contentType: file.type || "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload admin report PDF: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from("reports").getPublicUrl(storagePath);

  return {
    storageKey: storagePath,
    publicUrl: data.publicUrl,
  };
}