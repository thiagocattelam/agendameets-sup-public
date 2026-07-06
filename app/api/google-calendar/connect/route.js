import { auth } from "@/auth";
import { cookies } from "next/headers";
import { getOAuthClient, getAuthUrl } from "@/lib/googleCalendar";

export async function GET(request) {
  const session = await auth();
  if (!session?.atendenteId) {
    return Response.redirect(new URL("/", request.url));
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set("google_calendar_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 300,
    path: "/",
  });

  const redirectUri = new URL("/api/google-calendar/callback", request.url).toString();
  const client = getOAuthClient(redirectUri);

  return Response.redirect(getAuthUrl(client, state, session.user?.email));
}
