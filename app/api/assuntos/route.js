import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const assuntos = await prisma.assunto.findMany({
    orderBy: { descricao: "asc" },
  });
  return Response.json(assuntos);
}

export async function POST(request) {
  const { descricao } = await request.json();

  if (!descricao?.trim()) {
    return Response.json({ error: "A descrição é obrigatória." }, { status: 400 });
  }

  const assunto = await prisma.assunto.create({
    data: { descricao },
  });
  return Response.json(assunto);
}
