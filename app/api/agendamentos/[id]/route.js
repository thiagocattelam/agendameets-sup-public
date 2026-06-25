import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const { id } = await params;
  const { dataHoraInicio, dataHoraFim, cliente, linkUmbler, atendenteId, statusId, assuntoIds } =
    await request.json();

  const agendamento = await prisma.agendamento.update({
    where: { id },
    data: {
      dataHoraInicio: new Date(dataHoraInicio),
      dataHoraFim: new Date(dataHoraFim),
      cliente,
      linkUmbler: linkUmbler || null,
      atendenteId,
      statusId,
      assuntos: { set: assuntoIds.map((id) => ({ id })) },
    },
  });

  return Response.json(agendamento);
}

export async function DELETE(_, { params }) {
  const { id } = await params;

  await prisma.agendamento.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
