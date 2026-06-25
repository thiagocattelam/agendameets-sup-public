"use client";

import { Home, Tag, Users, LogOut, CalendarDays } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Início", icon: Home },
  { href: "/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { href: "/atendentes", label: "Atendentes", icon: Users },
  { href: "/assuntos", label: "Assuntos", icon: Tag },
];

export default function Header() {
  // Rota atual para destacar o link ativo no menu
  const currentPath = usePathname();

  // Controla se a sidebar está expandida ou recolhida
  const [isOpen, setIsOpen] = useState(false);

  // Controla se o popover de informações do usuário está visível
  const [popoverAberto, setPopoverAberto] = useState(false);

  // Ref da sidebar inteira — usado para fechar ao clicar fora
  const ref = useRef(null);

  // Ref do botão do usuário — usado para posicionar o popover
  const userButtonRef = useRef(null);

  // Ref do popover — usado para fechar ao clicar fora dele
  const popoverRef = useRef(null);

  // Dados do usuário logado via NextAuth
  const { data: session } = useSession();

  // Fecha a sidebar ao clicar fora dela
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Fecha o popover do usuário ao clicar fora dele
  useEffect(() => {
    if (!popoverAberto) return;
    function handleClickOutside(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setPopoverAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverAberto]);

  return (
    <aside
      ref={ref}
      className={`${isOpen ? "w-[280px]" : "w-[60px]"} flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}
      style={{ fontFamily: "Barlow, sans-serif" }}
    >
      {/* Botão de abrir/fechar a sidebar */}
      <div className="px-3 py-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center py-[10px] rounded-lg w-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors duration-150 ${isOpen ? "gap-3 px-3" : "justify-center"}`}
        >
          {isOpen ? (
            <X size={20} className="shrink-0" />
          ) : (
            <Menu size={20} className="shrink-0" />
          )}
        </button>
      </div>

      {/* Links de navegação */}
      <nav className="flex flex-col gap-1 px-3 py-3 flex-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = currentPath === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center py-[10px] rounded-lg text-sm font-semibold no-underline transition-colors duration-150 ${isOpen ? "gap-3 px-3" : "justify-center"} ${
                active
                  ? "bg-[#8b47ff] text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <Icon size={20} className="shrink-0" />
              {isOpen && label}
            </Link>
          );
        })}
      </nav>

      {/* Área do usuário logado — só renderiza se houver sessão ativa */}
      {session?.user && (
        <div className="relative px-3 py-4 border-t border-gray-200">
          {/* Botão que exibe foto e nome do usuário e abre o popover ao clicar */}
          <button
            ref={userButtonRef}
            onClick={() => setPopoverAberto(!popoverAberto)}
            className={`flex items-center w-full ${isOpen ? "gap-3" : "justify-center"}`}
          >
            <img
              src={session.user.image}
              alt={session.user.name}
              className="w-8 h-8 rounded-full shrink-0"
            />
            {isOpen && (
              <div className="overflow-hidden text-left">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </p>
              </div>
            )}
          </button>

          {/* Popover com detalhes do usuário — posicionado com fixed para sair da sidebar */}
          {popoverAberto &&
            (() => {
              // Calcula a posição do botão na tela para ancorar o popover acima dele
              const rect = userButtonRef.current?.getBoundingClientRect();
              return (
                <div
                  style={{
                    position: "fixed",
                    bottom: rect ? window.innerHeight - rect.top + 8 : 80,
                    left: rect ? rect.left : 8,
                    width: 220,
                    zIndex: 50,
                  }}
                  className="bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                  ref={popoverRef}
                >
                  <img
                    src={session.user.image}
                    className="w-10 h-10 rounded-full mb-2"
                  />
                  <p className="text-sm font-semibold text-gray-800">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    {session.user.email}
                  </p>
                  <hr className="mb-2" />
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-[8px] rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors duration-150 w-full"
                  >
                    <LogOut size={16} className="shrink-0" />
                    Sair
                  </button>
                </div>
              );
            })()}
        </div>
      )}
    </aside>
  );
}
