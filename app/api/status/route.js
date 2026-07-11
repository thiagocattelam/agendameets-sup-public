import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.atendenteId) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const status = await prisma.status.findMany({
    orderBy: { descricao: "asc" },
  });
  return Response.json(status);
}
