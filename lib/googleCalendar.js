import { google } from "googleapis";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SCOPES = ["https://www.googleapis.com/auth/calendar.events", "openid", "email"];

export function getOAuthClient(redirectUri) {
  return new google.auth.OAuth2(process.env.AUTH_GOOGLE_ID, process.env.AUTH_GOOGLE_SECRET, redirectUri);
}

export function getAuthUrl(client, state, email) {
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
    login_hint: email,
    hd: email?.split("@")[1],
  });
}

// Garante que a conta Google usada para conceder os tokens é a mesma do login da sessão
export async function verificarEmailToken(client, idToken, emailEsperado) {
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.AUTH_GOOGLE_ID });
  const payload = ticket.getPayload();
  return payload?.email?.toLowerCase() === emailEsperado?.toLowerCase();
}

export async function revogarToken(client, token) {
  await client.revokeToken(token).catch((err) => console.error("Falha ao revogar token do Google:", err));
}

export async function getClientForAtendente(atendente) {
  const client = getOAuthClient();

  client.setCredentials({
    access_token: atendente.googleAccessToken,
    refresh_token: atendente.googleRefreshToken,
    expiry_date: atendente.googleTokenExpiry?.getTime(),
  });

  client.on("tokens", (tokens) => {
    prisma.atendente
      .update({
        where: { id: atendente.id },
        data: {
          googleAccessToken: tokens.access_token ?? atendente.googleAccessToken,
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : atendente.googleTokenExpiry,
        },
      })
      .catch((err) => console.error("Falha ao persistir token renovado do Google Calendar:", err));
  });

  return client;
}

function montarEvento(agendamento) {
  const descricaoPartes = [agendamento.observacoes, agendamento.linkUmbler].filter(Boolean);

  return {
    summary: agendamento.cliente,
    description: descricaoPartes.join("\n\n") || undefined,
    start: { dateTime: agendamento.dataHoraInicio.toISOString(), timeZone: "America/Sao_Paulo" },
    end: { dateTime: agendamento.dataHoraFim.toISOString(), timeZone: "America/Sao_Paulo" },
  };
}

async function marcarDesconectado(atendenteId) {
  await prisma.atendente
    .update({ where: { id: atendenteId }, data: { googleCalendarConectado: false } })
    .catch((err) => console.error("Falha ao marcar atendente como desconectado:", err));
}

async function executarComTratamento(atendenteId, acao) {
  try {
    return await acao();
  } catch (error) {
    if (error?.response?.data?.error === "invalid_grant") {
      await marcarDesconectado(atendenteId);
    } else {
      console.error("Erro ao sincronizar com Google Calendar:", error?.message ?? error);
    }
    return null;
  }
}

export async function criarEvento(atendente, agendamento) {
  if (!atendente?.googleCalendarConectado) return null;

  return executarComTratamento(atendente.id, async () => {
    const client = await getClientForAtendente(atendente);
    const calendar = google.calendar({ version: "v3", auth: client });
    const { data } = await calendar.events.insert({
      calendarId: "primary",
      requestBody: montarEvento(agendamento),
    });
    return data.id;
  });
}

export async function atualizarEvento(atendente, agendamento) {
  if (!atendente?.googleCalendarConectado || !agendamento.googleEventId) return null;

  return executarComTratamento(atendente.id, async () => {
    const client = await getClientForAtendente(atendente);
    const calendar = google.calendar({ version: "v3", auth: client });
    await calendar.events.update({
      calendarId: "primary",
      eventId: agendamento.googleEventId,
      requestBody: montarEvento(agendamento),
    });
    return agendamento.googleEventId;
  });
}

export async function apagarEvento(atendente, googleEventId) {
  if (!atendente?.googleCalendarConectado || !googleEventId) return;

  await executarComTratamento(atendente.id, async () => {
    const client = await getClientForAtendente(atendente);
    const calendar = google.calendar({ version: "v3", auth: client });
    await calendar.events.delete({ calendarId: "primary", eventId: googleEventId });
  });
}
