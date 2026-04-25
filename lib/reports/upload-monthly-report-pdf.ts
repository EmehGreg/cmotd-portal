import { supabaseAdmin } from "@/lib/supabase-admin";

type UploadMonthlyReportPdfArgs = {
  file: File;
  programmeCode: string;
  month: number;
  year: number;
};

export async function uploadMonthlyReportPdf({
  file,
  programmeCode,
  month,
  year,
}: UploadMonthlyReportPdfArgs) {
  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const safeProgrammeCode = programmeCode.replace(/[^a-zA-Z0-9_-]/g, "");
  const fileName = `${safeProgrammeCode}-month-${month}-${year}-${Date.now()}.${fileExt}`;
  const storagePath = `monthly-reports/${year}/month-${month}/${fileName}`;

  const bytes = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from("reports")
    .upload(storagePath, bytes, {
      contentType: file.type || "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload monthly report PDF: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from("reports").getPublicUrl(storagePath);

  return {
    storageKey: storagePath,
    publicUrl: data.publicUrl,
  };
}