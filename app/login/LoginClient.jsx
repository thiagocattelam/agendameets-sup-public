"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold mb-2">AgendaMeets</h1>
        <p className="text-gray-500 text-sm mb-6">Entre com sua conta Google</p>

        {error === "AccessDenied" && (
          <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-left">
            <p className="text-sm font-medium text-red-700">
              Acesso não permitido
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              Use sua conta{" "}
              <span className="font-semibold">
                {process.env.NEXT_PUBLIC_AUTH_ALLOWED_EMAIL_DOMAINS}
              </span>{" "}
              para entrar.
            </p>
          </div>
        )}

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
