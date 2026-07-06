import { PrismaClient } from "@prisma/client";
import { criarEvento, atualizarEvento, apagarEvento } from "@/lib/googleCalendar";

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  const { id } = await params;
  const { dataHoraInicio, dataHoraFim, cliente, linkUmbler, observacoes, alertaMinutos, atendenteId, statusId, assuntoIds } =
    await request.json();

  const anterior = await prisma.agendamento.findUnique({
    where: { id },
    include: { atendente: true },
  });

  const agendamento = await prisma.agendamento.update({
    where: { id },
    data: {
      dataHoraInicio: new Date(dataHoraInicio),
      dataHoraFim: new Date(dataHoraFim),
      cliente,
      linkUmbler: linkUmbler || null,
      observacoes: observacoes || null,
      alertaMinutos: alertaMinutos ?? null,
      atendenteId,
      statusId,
      assuntos: { set: assuntoIds.map((id) => ({ id })) },
    },
    include: { atendente: true },
  });

  const trocouAtendente = anterior && anterior.atendenteId !== agendamento.atendenteId;

  if (trocouAtendente) {
    await apagarEvento(anterior.atendente, anterior.googleEventId);
    const googleEventId = await criarEvento(agendamento.atendente, agendamento);
    await prisma.agendamento.update({ where: { id }, data: { googleEventId } });
  } else if (agendamento.googleEventId) {
    await atualizarEvento(agendamento.atendente, agendamento);
  } else {
    const googleEventId = await criarEvento(agendamento.atendente, agendamento);
    if (googleEventId) {
      await prisma.agendamento.update({ where: { id }, data: { googleEventId } });
    }
  }

  return Response.json(agendamento);
}

export async function DELETE(_, { params }) {
  const { id } = await params;

  const agendamento = await prisma.agendamento.findUnique({
    where: { id },
    include: { atendente: true },
  });

  if (agendamento) {
    await apagarEvento(agendamento.atendente, agendamento.googleEventId);
  }

  await prisma.agendamento.delete({ where: { id } });

  return new Response(null, { status: 204 });
}
