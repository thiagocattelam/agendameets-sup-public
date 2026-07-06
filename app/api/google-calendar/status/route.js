import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
