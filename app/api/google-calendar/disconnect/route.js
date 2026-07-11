import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.atendenteId) {
    return Response.json({ ok: false }, { status: 401 });
  }

  await prisma.atendente.update({
    where: { id: session.atendenteId },
    data: {
      googleAccessToken: null,
      googleRefreshToken: null,
      googleTokenExpiry: null,
      googleCalendarConectado: false,
    },
  });

  return Response.json({ ok: true });
}
