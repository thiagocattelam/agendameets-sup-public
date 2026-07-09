"use client";
import { useState, useEffect, useRef } from "react";
import { X, ChevronDown } from "lucide-react";
import AtendenteModal from "../../../components/AtendenteModal";
import Skeleton from "../../../components/Skeleton";

export default function AtendentesClient() {
  const [atendentes, setAtendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [atendenteSelecionado, setAtendenteSelecionado] = useState(null);
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
  const [atendenteDeletar, setAtendenteDeletar] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const menuRef = useRef(null);
  const filtroDropdownRef = useRef(null);
  const [filtroDropdownAberto, setFiltroDropdownAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("ativos");
  const [pendingToggle, setPendingToggle] = useState({});

  async function carregarAtendentes() {
    const res = await fetch("/api/atendentes");
    const data = await res.json();
    setAtendentes(data);
    setLoading(false);
  }

  useEffect(() => {
    carregarAtendentes();
  }, []);

  useEffect(() => {
    function handleClickFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(null);
      }
      if (filtroDropdownRef.current && !filtroDropdownRef.current.contains(e.target)) {
        setFiltroDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  async function handleToggleAtivo(atendente) {
    const novoAtivo = !atendente.ativo;
    setPendingToggle((prev) => ({ ...prev, [atendente.id]: novoAtivo }));
    await fetch(`/api/atendentes/${atendente.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: atendente.nome,
        ativo: novoAtivo,
        email: atendente.email,
        alertaMinutos: atendente.alertaMinutos,
      }),
    });
    setTimeout(() => {
      carregarAtendentes();
      setPendingToggle((prev) => { const n = { ...prev }; delete n[atendente.id]; return n; });
    }, 700);
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
            {loading ? (
              <Skeleton className="h-4 w-20 inline-block align-middle" />
            ) : (
              <>
                {atendentes
                  .filter((a) => filtroAtivo === "ativos" ? a.ativo : filtroAtivo === "inativos" ? !a.ativo : true)
                  .filter((a) => a.nome.toLowerCase().includes(busca.toLowerCase())).length} registros
              </>
            )}
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

      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative" ref={filtroDropdownRef}>
          <button
            type="button"
            onClick={() => setFiltroDropdownAberto((v) => !v)}
            className={`flex items-center justify-between gap-2 border rounded-xl px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none transition-colors w-36 ${filtroDropdownAberto ? "border-purple-400 ring-2 ring-purple-200" : "border-gray-200 hover:border-gray-300"}`}
          >
            <span>{{ ativos: "Ativos", inativos: "Inativos", todos: "Todos" }[filtroAtivo]}</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${filtroDropdownAberto ? "rotate-180" : ""}`} />
          </button>
          {filtroDropdownAberto && (
            <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-full overflow-hidden">
              {[
                { label: "Ativos", value: "ativos" },
                { label: "Inativos", value: "inativos" },
                { label: "Todos", value: "todos" },
              ].map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => { setFiltroAtivo(op.value); setFiltroDropdownAberto(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${filtroAtivo === op.value ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          type="text"
          placeholder="Buscar..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
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
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-5 w-9 rounded-full" />
                </td>
                <td className="px-6 py-4" />
              </tr>
            ))}
            {!loading && atendentes
              .filter((a) => filtroAtivo === "ativos" ? a.ativo : filtroAtivo === "inativos" ? !a.ativo : true)
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
                        (pendingToggle[a.id] ?? a.ativo) ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          (pendingToggle[a.id] ?? a.ativo) ? "translate-x-4.5" : "translate-x-0.5"
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
            <div className="px-6 pt-6 pb-4 relative">
              <button
                onClick={() => setModalDeleteAberto(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <span className="text-red-500 text-xl font-bold">!</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Deseja excluir o Atendente?
              </h2>
              <p className="text-sm text-gray-500">
                Você deseja mesmo excluir o Atendente{" "}
                <strong className="text-gray-700">{atendenteDeletar?.nome}</strong>?
              </p>
            </div>
            <div className="border-t border-gray-100 px-6 py-4 flex justify-end">
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
