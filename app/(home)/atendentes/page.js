"use client";
import { useState, useEffect } from "react";

export default function Atendentes() {
  const [atendentes, setAtendentes] = useState([]);
  const [form, setForm] = useState({ nome: "", email: "" });
  const [editandoId, setEditandoId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editandoId != null) {
    } else {
      setAtendentes([...atendentes, { id: Date.now(), ...form }]);
    }
    setForm({ nome: "", email: "" });
    setEditandoId(null);
  };

  function handleDelete(id) {
    setAtendentes(atendentes.filter((a) => a.id !== id));
  }
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-3">Atendentes</h2>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          className="border rounded px=3 py-2"
          placeholder="Nome"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editandoId != null ? "Salvar" : "Adicionar"}
        </button>
      </form>

      <table className="w-full border collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-2 border">Nome</th>
            <th className="text-left p-2 border">Email</th>
            <th className="p-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {atendentes.map((a) => (
            <tr key={a.id} className="border-b">
              <td className="p-2 border">{a.nome}</td>
              <td className="p-2 border">{a.email}</td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-red-500"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
