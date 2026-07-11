import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.atendenteId) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { descricao } = await request.json();

  const assunto = await prisma.assunto.update({
    where: { id },
    data: { descricao },
  });
  return Response.json(assunto);
}

export async function DELETE(_, { params }) {
  const session = await auth();
  if (!session?.atendenteId) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.assunto.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
