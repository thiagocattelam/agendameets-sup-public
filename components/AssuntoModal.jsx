"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AssuntoModal({ aberto, onFechar, assunto, onSalvar }) {
  const [form, setForm] = useState({ descricao: "" });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  useEffect(() => {
    if (assunto) {
      setForm({ descricao: assunto.descricao });
    } else {
      setForm({ descricao: "" });
    }
  }, [assunto]);

  function fechar() {
    setForm({ descricao: "" });
    onFechar();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (salvando) return;
    setSalvando(true);
    try {
      const url = assunto ? `/api/assuntos/${assunto.id}` : "/api/assuntos";
      const method = assunto ? "PUT" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onSalvar();
      fechar();
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-lg">
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-semibold">
            {assunto ? "Editar Assunto" : "Novo Assunto"}
          </h2>
          <button
            onClick={fechar}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <input
              className="border rounded w-full px-3 py-2 mt-1"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-xl text-white text-sm disabled:opacity-60"
              style={{ backgroundColor: "#8b47ff" }}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
