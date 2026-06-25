"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/sync-sheets", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setStatus({ tipo: "sucesso", mensagem: `${data.criados} criados · ${data.ignorados} ignorados` });
      } else {
        setStatus({ tipo: "erro", mensagem: data.error });
      }
    } catch {
      setStatus({ tipo: "erro", mensagem: "Erro ao conectar com a API." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-400 mt-0.5">Painel de controle do AgendaMeets</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-1">Google Sheets</h3>
        <p className="text-sm text-gray-400 mb-4">Importa os agendamentos da planilha para o sistema.</p>

        <button
          onClick={handleSync}
          disabled={loading}
          className="text-white px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "#8b47ff" }}
        >
          {loading ? "Sincronizando..." : "Sincronizar com Sheets"}
        </button>

        {status && (
          <p className={`mt-4 text-sm ${status.tipo === "sucesso" ? "text-green-600" : "text-red-500"}`}>
            {status.mensagem}
          </p>
        )}
      </div>
    </div>
  );
}
