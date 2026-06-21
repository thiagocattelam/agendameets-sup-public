"use client";
import { signIn } from "next-auth/react";

export default function LoginClient() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold mb-2">AgendaMeets</h1>
        <p className="text-gray-500 text-sm mb-6">Entre com sua conta Google</p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" />
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
