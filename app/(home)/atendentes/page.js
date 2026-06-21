"use client";
import { useState, useEffect, useRef } from "react";
import AtendenteModal from "../../../components/AtendenteModal";

export default function AtendentesPage() {
  const [atendentes, setAtendentes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [atendenteSelecionado, setAtendenteSelecionado] = useState(null);
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
  const [atendenteDeletar, setAtendenteDeletar] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const menuRef = useRef(null);
  const [busca, setBusca] = useState("");

  async function carregarAtendentes() {
    const res = await fetch("/api/atendentes");
    const data = await res.json();
    setAtendentes(data);
  }

  useEffect(() => {
    carregarAtendentes();
  }, []);

  useEffect(() => {
    function handleClickFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(null);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  async function handleToggleAtivo(atendente) {
    await fetch(`/api/atendentes/${atendente.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: atendente.nome, ativo: !atendente.ativo }),
    });
    carregarAtendentes();
  }

  function handleAdicionar() {
    setAtendenteSelecionado(null);
    setModalAberto(true);
  }

  function handleEditar(atendente) {
    setAtendenteSelecionado(atendente);
    setModalAberto(true);
    setMenuAberto(null);
  }

  function handleConfirmarExcluir(atendente) {
    setAtendenteDeletar(atendente);
    setModalDeleteAberto(true);
    setMenuAberto(null);
  }

  async function handleExcluir() {
    await fetch(`/api/atendentes/${atendenteDeletar.id}`, { method: "DELETE" });
    setModalDeleteAberto(false);
    setAtendenteDeletar(null);
    carregarAtendentes();
  }

  function handleSalvar() {
    carregarAtendentes();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Atendentes</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {atendentes.length} registros
          </p>
        </div>
        <button
          onClick={handleAdicionar}
          className="text-white px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-90"
          style={{ backgroundColor: "#8b47ff" }}
        >
          + Adicionar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-8 py-3 text-sm font-semibold text-gray-600">
                Nome
              </th>
              <th className="text-left px-8 py-3 text-sm font-semibold text-gray-600">
                Ativo
              </th>
              <th className="px-6 py-3 text-right">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 font-normal focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {atendentes
              .filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase()))
              .map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                        style={{ backgroundColor: "#ede9fe", color: "#6d28d9" }}
                      >
                        {a.nome.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {a.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAtivo(a)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        a.ativo ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          a.ativo ? "translate-x-4.5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button
                      onClick={() =>
                        setMenuAberto(menuAberto === a.id ? null : a.id)
                      }
                      className="text-gray-500 hover:text-gray-800 p-1 rounded transition-colors font-bold text-lg leading-none"
                    >
                      ⋮
                    </button>
                    {menuAberto === a.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-6 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-36 overflow-hidden"
                      >
                        <button
                          onClick={() => handleEditar(a)}
                          className="w-full text-left px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleConfirmarExcluir(a)}
                          className="w-full text-left px-5 py-4 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AtendenteModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        atendente={atendenteSelecionado}
        onSalvar={handleSalvar}
      />

      {modalDeleteAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden">
            <div className="px-6 pt-6 pb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-red-500 text-xl font-bold">!</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Deseja excluir o Atendente?
              </h2>
              <p className="text-sm text-gray-500">
                Você deseja mesmo excluir o Atendente{" "}
                <strong className="text-gray-700">
                  {atendenteDeletar?.nome}
                </strong>
                ?
              </p>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 flex justify-between items-center">
              <button
                onClick={() => setModalDeleteAberto(false)}
                className="px-4 py-2 rounded-xl border text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition"
              >
                Sim, excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
