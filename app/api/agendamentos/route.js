import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");
  const atendenteId = searchParams.get("atendenteId");

  const where = {};

  if (inicio && fim) {
    where.dataHoraInicio = {
      gte: new Date(inicio),
      lte: new Date(fim),
    };
  }

  if (atendenteId) {
    where.atendenteId = atendenteId;
  }

  const agendamentos = await prisma.agendamento.findMany({
    where,
    include: {
      atendente: true,
      assuntos: true,
      status: true,
    },
    orderBy: { dataHoraInicio: "asc" },
  });

  return Response.json(agendamentos);
}

export async function POST(request) {
  const { dataHoraInicio, dataHoraFim, cliente, linkUmbler, atendenteId, statusId, assuntoIds } =
    await request.json();

  const agendamento = await prisma.agendamento.create({
    data: {
      dataHoraInicio: new Date(dataHoraInicio),
      dataHoraFim: new Date(dataHoraFim),
      cliente,
      linkUmbler: linkUmbler || null,
      atendenteId,
      statusId,
      assuntos: { connect: assuntoIds.map((id) => ({ id })) },
    },
  });

  return Response.json(agendamento, { status: 201 });
}
