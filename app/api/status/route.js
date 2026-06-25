import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const status = await prisma.status.findMany({
    orderBy: { descricao: "asc" },
  });
  return Response.json(status);
}
