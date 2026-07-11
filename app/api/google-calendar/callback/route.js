import { auth } from "@/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getOAuthClient, verificarEmailToken, revogarToken } from "@/lib/googleCalendar";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_calendar_oauth_state")?.value;
  cookieStore.delete("google_calendar_oauth_state");

  const session = await auth();

  if (!code || !state || state !== savedState || !session?.atendenteId) {
    return Response.redirect(new URL("/", request.url));
  }

  const redirectUri = new URL("/api/google-calendar/callback", request.url).toString();
  const client = getOAuthClient(redirectUri);
  const { tokens } = await client.getToken(code);

  const emailCorresponde = tokens.id_token
    ? await verificarEmailToken(client, tokens.id_token, session.user?.email)
    : false;

  if (!emailCorresponde) {
    await revogarToken(client, tokens.access_token);
    return Response.redirect(new URL("/?googleCalendarErro=email_mismatch", request.url));
  }

  await prisma.atendente.update({
    where: { id: session.atendenteId },
    data: {
      googleAccessToken: tokens.access_token,
      googleRefreshToken: tokens.refresh_token ?? undefined,
      googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      googleCalendarConectado: true,
    },
  });

  return Response.redirect(new URL("/", request.url));
}
