"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

function toLocalDate(isoString) {
  const d = new Date(isoString);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function toLocalTime(isoString) {
  const d = new Date(isoString);
  return [
    String(d.getHours()).padStart(2, "0"),
    String(d.getMinutes()).padStart(2, "0"),
  ].join(":");
}

const emptyForm = {
  data: "",
  horaInicio: "",
  horaFim: "",
  cliente: "",
  linkUmbler: "",
  atendenteId: "",
  statusId: "",
  assuntoIds: [],
};

export default function AgendamentoModal({
  aberto,
  onFechar,
  agendamento,
  onSalvar,
  atendentes,
  statusList,
  assuntosList,
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (agendamento) {
      setForm({
        data: toLocalDate(agendamento.dataHoraInicio),
        horaInicio: toLocalTime(agendamento.dataHoraInicio),
        horaFim: toLocalTime(agendamento.dataHoraFim),
        cliente: agendamento.cliente,
        linkUmbler: agendamento.linkUmbler ?? "",
        atendenteId: agendamento.atendenteId,
        statusId: agendamento.statusId,
        assuntoIds: agendamento.assuntos.map((a) => a.id),
      });
    } else {
      setForm(emptyForm);
    }
  }, [agendamento, aberto]);

  function fechar() {
    setForm(emptyForm);
    onFechar();
  }

  function toggleAssunto(id) {
    setForm((f) => ({
      ...f,
      assuntoIds: f.assuntoIds.includes(id)
        ? f.assuntoIds.filter((x) => x !== id)
        : [...f.assuntoIds, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const body = {
      dataHoraInicio: new Date(`${form.data}T${form.horaInicio}:00`).toISOString(),
      dataHoraFim: new Date(`${form.data}T${form.horaFim}:00`).toISOString(),
      cliente: form.cliente,
      linkUmbler: form.linkUmbler || null,
      atendenteId: form.atendenteId,
      statusId: form.statusId,
      assuntoIds: form.assuntoIds,
    };

    const url = agendamento ? `/api/agendamentos/${agendamento.id}` : "/api/agendamentos";
    const method = agendamento ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    onSalvar();
    fechar();
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <button
            type="button"
            onClick={fechar}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto flex-1">
          <div className="px-6 py-5 flex flex-col gap-4">

            {/* Data e horários */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Data</label>
                <input
                  type="date"
                  required
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Início</label>
                <input
                  type="time"
                  required
                  value={form.horaInicio}
                  onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Fim</label>
                <input
                  type="time"
                  required
                  value={form.horaFim}
                  onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>

            {/* Cliente */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Cliente</label>
              <input
                type="text"
                required
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            {/* Atendente e Status */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Atendente</label>
                <select
                  required
                  value={form.atendenteId}
                  onChange={(e) => setForm({ ...form, atendenteId: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option value="">Selecione...</option>
                  {atendentes.map((a) => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                <select
                  required
                  value={form.statusId}
                  onChange={(e) => setForm({ ...form, statusId: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
                >
                  <option value="">Selecione...</option>
                  {statusList.map((s) => (
                    <option key={s.id} value={s.id}>{s.descricao}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assuntos */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Assuntos</label>
              <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2 max-h-36 overflow-y-auto">
                {assuntosList.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.assuntoIds.includes(a.id)}
                      onChange={() => toggleAssunto(a.id)}
                      className="accent-purple-600 w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{a.descricao}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Link Umbler */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Link Umbler</label>
              <input
                type="url"
                value={form.linkUmbler}
                onChange={(e) => setForm({ ...form, linkUmbler: e.target.value })}
                placeholder="https://..."
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 px-6 py-4 flex justify-end items-center flex-shrink-0">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white text-sm font-semibold"
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
