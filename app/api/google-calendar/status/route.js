import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.atendenteId) {
    return Response.json({ conectado: false });
  }

  const atendente = await prisma.atendente.findUnique({
    where: { id: session.atendenteId },
    select: { googleCalendarConectado: true },
  });

  return Response.json({ conectado: atendente?.googleCalendarConectado ?? false });
}
