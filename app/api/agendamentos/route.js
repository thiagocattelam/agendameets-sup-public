import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const inicio = searchParams.get("inicio");
  const fim = searchParams.get("fim");
  const atendenteId = searchParams.get("atendenteId");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.max(1, parseInt(searchParams.get("pageSize") ?? "15", 10));

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

  const [data, total] = await Promise.all([
    prisma.agendamento.findMany({
      where,
      include: {
        atendente: true,
        assuntos: true,
        status: true,
      },
      orderBy: { dataHoraInicio: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.agendamento.count({ where }),
  ]);

  return Response.json({ data, total });
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
