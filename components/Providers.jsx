"use client";
import { SessionProvider } from "next-auth/react";
import AlertaProvider from "@/components/AlertaProvider";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <AlertaProvider>{children}</AlertaProvider>
    </SessionProvider>
  );
}
