"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function AtendenteModal({ aberto, onFechar, atendente, onSalvar }) {
  const [form, setForm] = useState({ nome: "", email: "", ativo: true });

  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  useEffect(() => {
    if (atendente) {
      setForm({ nome: atendente.nome, email: atendente.email ?? "", ativo: atendente.ativo });
    } else {
      setForm({ nome: "", email: "", ativo: true });
    }
  }, [atendente]);

  function fechar() {
    setForm({ nome: "", email: "", ativo: true });
    onFechar();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const url = atendente ? `/api/atendentes/${atendente.id}` : "/api/atendentes";
    const method = atendente ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, email: form.email || null }),
    });
    onSalvar();
    fechar();
  }

  if (!aberto) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-sm shadow-lg">
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-semibold">
            {atendente ? "Editar Atendente" : "Novo Atendente"}
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
            <label className="text-sm font-medium">Nome</label>
            <input
              className="border rounded-lg w-full px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <input
              type="email"
              placeholder="nome@clinicaexperts.com.br"
              className="border rounded-lg w-full px-3 py-2 mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required={!atendente}
            />
          </div>
          <div className="flex justify-end">
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
