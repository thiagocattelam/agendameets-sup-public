import { getSheetData } from "@/lib/sheets";

export async function GET() {
  try {
    const rows = await getSheetData("A7:J");
    return Response.json({ ok: true, rows });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
