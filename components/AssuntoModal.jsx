"use client";
import { useState, useEffect } from "react";

export default function AssuntoModal({ aberto, onFechar, assunto, onSalvar }) {
  const [form, setForm] = useState({ descricao: "" });

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
    const url = assunto ? `/api/assuntos/${assunto.id}` : "/api/assuntos";
    const method = assunto ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onSalvar();
    fechar();
  }

  if (!aberto) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          {assunto ? "Editar Assunto" : "Novo Assunto"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Descrição</label>
            <input
              className="border rounded w-full px-3 py-2 mt-1"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={fechar}
              className="px-4 py-2 rounded-xl border text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-white text-sm"
              style={{ backgroundColor: "#8b47ff" }}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
