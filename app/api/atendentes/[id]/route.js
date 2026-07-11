import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  const session = await auth();
  if (!session?.atendenteId) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { nome, ativo, email, alertaMinutos } = await request.json();

  const atendente = await prisma.atendente.update({
    where: { id },
    data: { nome, ativo, email: email || null, alertaMinutos: alertaMinutos ?? null },
  });
  return Response.json(atendente);
}

export async function DELETE(_, { params }) {
  const session = await auth();
  if (!session?.atendenteId) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.atendente.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
