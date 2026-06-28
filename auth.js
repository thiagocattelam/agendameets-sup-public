import NextAuth from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authConfig } from "@/auth.config";

const prisma = new PrismaClient();

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ profile }) {
      return profile?.email?.endsWith("@clinicaexperts.com.br") ?? false;
    },
    async jwt({ token, profile }) {
      if (profile?.email) {
        const atendente = await prisma.atendente.findUnique({
          where: { email: profile.email },
          select: { id: true },
        });
        token.atendenteId = atendente?.id ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      session.atendenteId = token.atendenteId ?? null;
      return session;
    },
  },
});
