import { supabaseAdmin } from "@/lib/supabase-admin";

type UploadWeeklyReportPdfArgs = {
  file: File;
  programmeCode: string;
  week: number;
  year: number;
};

export async function uploadWeeklyReportPdf({
  file,
  programmeCode,
  week,
  year,
}: UploadWeeklyReportPdfArgs) {
  const fileExt = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const safeProgrammeCode = programmeCode.replace(/[^a-zA-Z0-9_-]/g, "");
  const fileName = `${safeProgrammeCode}-week-${week}-${year}-${Date.now()}.${fileExt}`;
  const storagePath = `weekly-reports/${year}/week-${week}/${fileName}`;

  const bytes = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage
    .from("reports")
    .upload(storagePath, bytes, {
      contentType: file.type || "application/pdf",
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload weekly report PDF: ${error.message}`);
  }

  const { data } = supabaseAdmin.storage.from("reports").getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
}