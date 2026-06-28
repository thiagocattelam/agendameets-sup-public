"use client";
import { useEffect } from "react";
import { Bell, X } from "lucide-react";

function formatarHora(isoString) {
  return new Date(isoString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calcularMinutosRestantes(isoString) {
  const diff = Math.round((new Date(isoString) - Date.now()) / 60000);
  if (diff <= 0) return "agora";
  if (diff === 1) return "1 minuto";
  return `${diff} minutos`;
}

export default function AlertaModal({ agendamento, onFechar }) {
  useEffect(() => {
    if (!agendamento) return;
    const timer = setTimeout(onFechar, 30000);
    return () => clearTimeout(timer);
  }, [agendamento, onFechar]);

  if (!agendamento) return null;

  const minutos = agendamento.alertaMinutos ?? agendamento.atendente?.alertaMinutos ?? 30;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right-4 fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 w-80 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3" style={{ backgroundColor: "#8b47ff" }}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Bell size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold text-sm flex-1">Lembrete de Agendamento</span>
          <button
            onClick={onFechar}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-2">
          <p className="text-gray-900 font-semibold text-sm">{agendamento.cliente}</p>
          <div className="flex items-center gap-2 text-gray-500 text-xs">
            <span>Início às {formatarHora(agendamento.dataHoraInicio)}</span>
            <span>·</span>
            <span>faltam {calcularMinutosRestantes(agendamento.dataHoraInicio)}</span>
          </div>
          {agendamento.assuntos?.length > 0 && (
            <p className="text-xs text-gray-400 truncate">
              {agendamento.assuntos.map((a) => a.descricao).join(", ")}
            </p>
          )}
        </div>

        <div className="px-4 pb-3 flex justify-between items-center">
          <span className="text-xs text-gray-400">Alerta configurado para {minutos} min antes</span>
          <button
            onClick={onFechar}
            className="text-xs font-medium px-3 py-1.5 rounded-lg text-white"
            style={{ backgroundColor: "#8b47ff" }}
          >
            Dispensar
          </button>
        </div>

        <div className="h-1 bg-purple-100">
          <div
            className="h-1 bg-purple-500"
            style={{ animation: "shrink 30s linear forwards" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
