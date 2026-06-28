"use client";
import { useState, useEffect, useRef, forwardRef } from "react";
import { X, ChevronDown, CalendarDays, Clock } from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";

registerLocale("pt-BR", ptBR);

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

function timeStringToDate(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m), 0, 0);
  return d;
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

const TimeInput = forwardRef(({ onClick, isOpen, displayValue, hasError }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm w-full text-left focus:outline-none transition-colors ${
      isOpen ? "border-purple-400 ring-2 ring-purple-200" : hasError ? "border-red-400 ring-2 ring-red-100" : "border-gray-200"
    } ${displayValue ? "text-gray-700" : "text-gray-400"}`}
  >
    <span>{displayValue || "--:--"}</span>
    <Clock size={14} className="text-gray-400 flex-shrink-0" />
  </button>
));

const DateInput = forwardRef(({ onClick, isOpen, displayValue, hasError }, ref) => (
  <button
    type="button"
    onClick={onClick}
    ref={ref}
    className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm w-full text-left focus:outline-none transition-colors ${
      isOpen ? "border-purple-400 ring-2 ring-purple-200" : hasError ? "border-red-400 ring-2 ring-red-100" : "border-gray-200"
    } ${displayValue ? "text-gray-700" : "text-gray-400"}`}
  >
    <span>{displayValue || "dd/mm/aaaa"}</span>
    <CalendarDays size={14} className="text-gray-400 flex-shrink-0" />
  </button>
));

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

  const [tentouSalvar, setTentouSalvar] = useState(false);
  const [dataPickerAberto, setDataPickerAberto] = useState(false);
  const [horaInicioAberto, setHoraInicioAberto] = useState(false);
  const [horaFimAberto, setHoraFimAberto] = useState(false);
  const [atendenteDropdownAberto, setAtendenteDropdownAberto] = useState(false);
  const [statusDropdownAberto, setStatusDropdownAberto] = useState(false);

  const atendenteDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    if (!atendenteDropdownAberto && !statusDropdownAberto) return;
    function handleClickFora(e) {
      if (atendenteDropdownRef.current && !atendenteDropdownRef.current.contains(e.target)) {
        setAtendenteDropdownAberto(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, [atendenteDropdownAberto, statusDropdownAberto]);

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
    setTentouSalvar(false);
    setDataPickerAberto(false);
    setHoraInicioAberto(false);
    setHoraFimAberto(false);
    setAtendenteDropdownAberto(false);
    setStatusDropdownAberto(false);
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
    setTentouSalvar(true);
    if (!form.data || !form.horaInicio || !form.horaFim || !form.atendenteId || !form.statusId) return;
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

  const dataDate = form.data ? new Date(form.data + "T12:00:00") : null;
  const atendenteSelecionado = atendentes?.find((a) => String(a.id) === String(form.atendenteId));
  const statusSelecionado = statusList?.find((s) => String(s.id) === String(form.statusId));

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {agendamento ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <button type="button" onClick={fechar} className="text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto flex-1">
          <div className="px-6 py-5 flex flex-col gap-4">

            {/* Data e horários */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Data</label>
                <DatePicker
                  selected={dataDate}
                  onChange={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, "0");
                      const dd = String(date.getDate()).padStart(2, "0");
                      setForm((f) => ({ ...f, data: `${yyyy}-${mm}-${dd}` }));
                    }
                  }}
                  onCalendarOpen={() => setDataPickerAberto(true)}
                  onCalendarClose={() => setDataPickerAberto(false)}
                  popperProps={{ strategy: "fixed" }}
                  popperPlacement="bottom-start"
                  dateFormat="dd/MM/yyyy"
                  locale="pt-BR"
                  customInput={
                    <DateInput
                      isOpen={dataPickerAberto}
                      displayValue={form.data ? new Date(form.data + "T12:00:00").toLocaleDateString("pt-BR") : ""}
                      hasError={tentouSalvar && !form.data}
                    />
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Início</label>
                <DatePicker
                  selected={timeStringToDate(form.horaInicio)}
                  onChange={(date) => {
                    if (date) {
                      const h = String(date.getHours()).padStart(2, "0");
                      const m = String(date.getMinutes()).padStart(2, "0");
                      setForm((f) => ({ ...f, horaInicio: `${h}:${m}` }));
                    }
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Horário"
                  timeFormat="HH:mm"
                  dateFormat="HH:mm"
                  locale="pt-BR"
                  onCalendarOpen={() => setHoraInicioAberto(true)}
                  onCalendarClose={() => setHoraInicioAberto(false)}
                  popperProps={{ strategy: "fixed" }}
                  popperPlacement="bottom-start"
                  customInput={
                    <TimeInput isOpen={horaInicioAberto} displayValue={form.horaInicio} hasError={tentouSalvar && !form.horaInicio} />
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Fim</label>
                <DatePicker
                  selected={timeStringToDate(form.horaFim)}
                  onChange={(date) => {
                    if (date) {
                      const h = String(date.getHours()).padStart(2, "0");
                      const m = String(date.getMinutes()).padStart(2, "0");
                      setForm((f) => ({ ...f, horaFim: `${h}:${m}` }));
                    }
                  }}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Horário"
                  timeFormat="HH:mm"
                  dateFormat="HH:mm"
                  locale="pt-BR"
                  onCalendarOpen={() => setHoraFimAberto(true)}
                  onCalendarClose={() => setHoraFimAberto(false)}
                  popperProps={{ strategy: "fixed" }}
                  popperPlacement="bottom-start"
                  customInput={
                    <TimeInput isOpen={horaFimAberto} displayValue={form.horaFim} hasError={tentouSalvar && !form.horaFim} />
                  }
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
                <div className="relative" ref={atendenteDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setAtendenteDropdownAberto((v) => !v)}
                    className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none transition-colors ${
                      atendenteDropdownAberto ? "border-purple-400 ring-2 ring-purple-200" : tentouSalvar && !form.atendenteId ? "border-red-400 ring-2 ring-red-100" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className={`truncate ${atendenteSelecionado ? "text-gray-700" : "text-gray-400"}`}>
                      {atendenteSelecionado?.nome ?? "Selecione..."}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 transition-transform ${atendenteDropdownAberto ? "rotate-180" : ""}`} />
                  </button>
                  {atendenteDropdownAberto && (
                    <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-full max-h-48 overflow-y-auto">
                      {atendentes?.filter((a) => a.ativo).map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => { setForm({ ...form, atendenteId: a.id }); setAtendenteDropdownAberto(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${String(form.atendenteId) === String(a.id) ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                          {a.nome}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                <div className="relative" ref={statusDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setStatusDropdownAberto((v) => !v)}
                    className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2 text-sm w-full bg-white focus:outline-none transition-colors ${
                      statusDropdownAberto ? "border-purple-400 ring-2 ring-purple-200" : tentouSalvar && !form.statusId ? "border-red-400 ring-2 ring-red-100" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className={`truncate ${statusSelecionado ? "text-gray-700" : "text-gray-400"}`}>
                      {statusSelecionado?.descricao ?? "Selecione..."}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 transition-transform ${statusDropdownAberto ? "rotate-180" : ""}`} />
                  </button>
                  {statusDropdownAberto && (
                    <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-full overflow-hidden">
                      {statusList?.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => { setForm({ ...form, statusId: s.id }); setStatusDropdownAberto(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2 ${String(form.statusId) === String(s.id) ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.corHex }} />
                          {s.descricao}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Assuntos */}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">Assuntos</label>
              <div className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2.5 max-h-36 overflow-y-auto">
                {assuntosList?.map((a) => {
                  const checked = form.assuntoIds.includes(a.id);
                  return (
                    <label key={a.id} className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAssunto(a.id)}
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 border transition-colors ${
                          checked ? "bg-purple-600 border-purple-600" : "bg-white border-gray-300"
                        }`}
                      >
                        {checked && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700">{a.descricao}</span>
                    </label>
                  );
                })}
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
