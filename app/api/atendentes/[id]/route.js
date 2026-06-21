import { PrismaClient } from "@/lib/generated/prisma/client";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const { id } = await params;
  const { nome, ativo } = await request.json();

  const atendente = await prisma.atendente.update({
    where: { id },
    data: { nome, ativo },
  });
  return Response.json(atendente);
}

export async function DELETE(_, { params }) {
  const { id } = await params;

  await prisma.atendente.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
