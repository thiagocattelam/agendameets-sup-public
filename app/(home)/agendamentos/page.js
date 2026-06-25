"use client";
import { useState, useEffect, useRef } from "react";
import { ExternalLink, X } from "lucide-react";
import AgendamentoModal from "../../../components/AgendamentoModal";

function getMondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function formatHora(dateStr) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDataCabecalho(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export default function AgendamentosPage() {
  const [dataInicio, setDataInicio] = useState(getMondayOf(new Date()));
  const [dataFim, setDataFim] = useState(addDays(getMondayOf(new Date()), 6));
  const [atendenteId, setAtendenteId] = useState("");

  const [agendamentos, setAgendamentos] = useState([]);
  const [atendentes, setAtendentes] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [assuntosList, setAssuntosList] = useState([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
  const [agendamentoDeletar, setAgendamentoDeletar] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/atendentes").then((r) => r.json()),
      fetch("/api/status").then((r) => r.json()),
      fetch("/api/assuntos").then((r) => r.json()),
    ]).then(([at, st, as]) => {
      setAtendentes(at);
      setStatusList(st);
      setAssuntosList(as);
    });
  }, []);

  useEffect(() => {
    carregarAgendamentos();
  }, [dataInicio, dataFim, atendenteId]);

  useEffect(() => {
    function handleClickFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(null);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  function carregarAgendamentos() {
    const inicio = new Date(dataInicio + "T00:00:00").toISOString();
    const fim = new Date(dataFim + "T23:59:59").toISOString();
    const params = new URLSearchParams({ inicio, fim });
    if (atendenteId) params.set("atendenteId", atendenteId);
    fetch(`/api/agendamentos?${params}`).then((r) => r.json()).then(setAgendamentos);
  }

  function handleAdicionar() {
    setAgendamentoSelecionado(null);
    setModalAberto(true);
  }

  function handleEditar(ag) {
    setAgendamentoSelecionado(ag);
    setModalAberto(true);
    setMenuAberto(null);
  }

  function handleConfirmarExcluir(ag) {
    setAgendamentoDeletar(ag);
    setModalDeleteAberto(true);
    setMenuAberto(null);
  }

  async function handleExcluir() {
    await fetch(`/api/agendamentos/${agendamentoDeletar.id}`, { method: "DELETE" });
    setModalDeleteAberto(false);
    setAgendamentoDeletar(null);
    carregarAgendamentos();
  }

  const agrupados = {};
  for (const ag of agendamentos) {
    const key = ag.dataHoraInicio.slice(0, 10);
    if (!agrupados[key])
      agrupados[key] = { label: formatDataCabecalho(key), items: [] };
    agrupados[key].items.push(ag);
  }
  const dias = Object.keys(agrupados).sort();

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Agendamentos</h2>
          <p className="text-sm text-gray-400 mt-0.5">{agendamentos.length} registros</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={atendenteId}
            onChange={(e) => setAtendenteId(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="">Todos os atendentes</option>
            {atendentes.map((a) => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </select>
          <button
            onClick={handleAdicionar}
            className="text-white px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-90 whitespace-nowrap"
            style={{ backgroundColor: "#8b47ff" }}
          >
            + Adicionar
          </button>
        </div>
      </div>

      {/* Filtro de datas */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">De</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
          <span className="text-gray-300 mt-4">–</span>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Até</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 sm:mt-4">
          <button
            onClick={() => { const d = hoje(); setDataInicio(d); setDataFim(d); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Hoje
          </button>
          <button
            onClick={() => { const seg = getMondayOf(new Date()); setDataInicio(seg); setDataFim(addDays(seg, 6)); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Esta semana
          </button>
          <button
            onClick={() => { setDataInicio((s) => addDays(s, -7)); setDataFim((s) => addDays(s, -7)); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            ← Anterior
          </button>
          <button
            onClick={() => { setDataInicio((s) => addDays(s, 7)); setDataFim((s) => addDays(s, 7)); }}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Próxima →
          </button>
        </div>
      </div>

      {/* Lista */}
      {dias.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          Nenhum agendamento nesse período.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {dias.map((key) => {
            const { label, items } = agrupados[key];
            return (
              <div key={key}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 capitalize">
                  {label}
                </h3>
                <div className="flex flex-col gap-3">
                  {items.map((ag) => (
                    <div
                      key={ag.id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col gap-1.5 px-5 py-4 relative"
                      style={{
                        borderLeftWidth: "4px",
                        borderLeftColor: ag.status?.corHex ?? "#e5e7eb",
                      }}
                    >
                      {/* Linha superior: horário + status + menu */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-mono text-gray-400">
                          {formatHora(ag.dataHoraInicio)} – {formatHora(ag.dataHoraFim)}
                        </span>
                        <div className="flex items-center gap-2">
                          {ag.status && (
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-full"
                              style={{
                                backgroundColor: ag.status.corHex + "22",
                                color: ag.status.corHex,
                              }}
                            >
                              {ag.status.descricao}
                            </span>
                          )}
                          <button
                            onClick={() => setMenuAberto(menuAberto === ag.id ? null : ag.id)}
                            className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors font-bold text-lg leading-none"
                          >
                            ⋮
                          </button>
                        </div>
                      </div>

                      {/* Cliente */}
                      <p className="text-base font-semibold text-gray-800">{ag.cliente}</p>

                      {/* Atendente + assuntos */}
                      <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                        <span>{ag.atendente.nome}</span>
                        {ag.assuntos.length > 0 && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span>{ag.assuntos.map((a) => a.descricao).join(", ")}</span>
                          </>
                        )}
                      </div>

                      {/* Link Umbler */}
                      {ag.linkUmbler && (
                        <a
                          href={ag.linkUmbler}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-700 hover:underline mt-0.5 w-fit"
                        >
                          <ExternalLink size={11} />
                          Abrir no Umbler
                        </a>
                      )}

                      {/* Dropdown menu */}
                      {menuAberto === ag.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-36 overflow-hidden"
                        >
                          <button
                            onClick={() => handleEditar(ag)}
                            className="w-full text-left px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleConfirmarExcluir(ag)}
                            className="w-full text-left px-5 py-4 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Excluir
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de criação/edição */}
      <AgendamentoModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        agendamento={agendamentoSelecionado}
        onSalvar={carregarAgendamentos}
        atendentes={atendentes}
        statusList={statusList}
        assuntosList={assuntosList}
      />

      {/* Modal de confirmação de exclusão */}
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
              <h2 className="text-lg font-bold text-gray-900 mb-2">Deseja excluir o Agendamento?</h2>
              <p className="text-sm text-gray-500">
                Você deseja mesmo excluir o agendamento de{" "}
                <strong className="text-gray-700">{agendamentoDeletar?.cliente}</strong>?
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
