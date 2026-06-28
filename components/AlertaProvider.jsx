"use client";
import { useState, useCallback } from "react";
import { useAlertaAgendamentos } from "@/hooks/useAlertaAgendamentos";
import AlertaModal from "@/components/AlertaModal";

export default function AlertaProvider({ children }) {
  const [agendamentoAtivo, setAgendamentoAtivo] = useState(null);

  const onAlertar = useCallback((ag) => {
    setAgendamentoAtivo(ag);
  }, []);

  useAlertaAgendamentos({ onAlertar });

  return (
    <>
      {children}
      <AlertaModal
        agendamento={agendamentoAtivo}
        onFechar={() => setAgendamentoAtivo(null)}
      />
    </>
  );
}
