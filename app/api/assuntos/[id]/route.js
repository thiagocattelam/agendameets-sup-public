import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const { id } = await params;
  const { descricao } = await request.json();

  const assunto = await prisma.assunto.update({
    where: { id },
    data: { descricao },
  });
  return Response.json(assunto);
}

export async function DELETE(_, { params }) {
  const { id } = await params;

  await prisma.assunto.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
