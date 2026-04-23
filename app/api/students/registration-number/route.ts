import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationNumber } from "@/lib/students/registration-number";

export async function GET(request: NextRequest) {
  const programmeId =
    request.nextUrl.searchParams.get("programmeId")?.trim() ?? "";
  const batch = request.nextUrl.searchParams.get("batch")?.trim() ?? "";
  const disability =
    request.nextUrl.searchParams.get("disability")?.trim() === "true";

  if (!programmeId || !batch) {
    return NextResponse.json({ registrationNumber: "" });
  }

  try {
    const registrationNumber = await generateRegistrationNumber({
      programmeId,
      batch,
      disability,
    });

    return NextResponse.json({ registrationNumber });
  } catch {
    return NextResponse.json({ registrationNumber: "" }, { status: 400 });
  }
}