import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const atendentes = await prisma.atendente.findMany({
    orderBy: { nome: "asc" },
  });
  return Response.json(atendentes);
}

export async function POST(request) {
  const { nome, ativo, email } = await request.json();

  if (!nome?.trim()) {
    return Response.json({ error: "O nome é obrigatório." }, { status: 400 });
  }
  const atendente = await prisma.atendente.create({
    data: { nome, ativo, email: email || null },
  });
  return Response.json(atendente);
}
