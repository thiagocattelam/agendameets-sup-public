import { PrismaClient } from "@prisma/client";
import { getSheetData } from "@/lib/sheets";

const prisma = new PrismaClient();

function parseDataHora(dataStr, horaStr) {
  const [dia, mes] = dataStr.split("/");
  const ano = new Date().getFullYear();
  return new Date(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}T${horaStr}:00`);
}

async function findOrCreate(model, where, create) {
  const found = await prisma[model].findFirst({ where });
  if (found) return found;
  return prisma[model].create({ data: create });
}

export async function POST() {
  try {
    const rows = await getSheetData("A7:J");

    let criados = 0, ignorados = 0;

    for (const row of rows) {
      const [dataStr, , horaInicio, horaFim, nomeAtendente, cliente, nomeAssunto, linkUmbler, nomeStatus, observacoes] = row;

      if (!linkUmbler?.startsWith("http")) {
        ignorados++;
        continue;
      }

      const dataHoraInicio = parseDataHora(dataStr, horaInicio);
      const dataHoraFim = parseDataHora(dataStr, horaFim);

      const nomesAssuntos = nomeAssunto.split(",").map((s) => s.trim()).filter(Boolean);

      const [atendente, status, assuntos] = await Promise.all([
        findOrCreate("atendente", { nome: nomeAtendente }, { nome: nomeAtendente, ativo: true }),
        findOrCreate("status", { descricao: nomeStatus }, { descricao: nomeStatus, corHex: "#6b7280" }),
        Promise.all(nomesAssuntos.map((desc) => findOrCreate("assunto", { descricao: desc }, { descricao: desc }))),
      ]);

      const assuntosConnect = assuntos.map((a) => ({ id: a.id }));

      const existing = await prisma.agendamento.findFirst({ where: { linkUmbler } });

      if (existing) {
        ignorados++;
        continue;
      } else {
        await prisma.agendamento.create({
          data: {
            dataHoraInicio, dataHoraFim, cliente, linkUmbler, observacoes: observacoes ?? null,
            atendenteId: atendente.id, statusId: status.id,
            assuntos: { connect: assuntosConnect },
          },
        });
        criados++;
      }
    }

    return Response.json({ ok: true, criados, ignorados });
  } catch (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
