"use client";

import { Home, Tag, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

// Links de navegação para o Header
const navLinks = [
  { href: "/", label: "Início", icon: Home },
  { href: "/atendentes", label: "Atendentes", icon: Users },
  { href: "/assuntos", label: "Assuntos", icon: Tag },
];

// Componente de Header (Sidebar)
export default function Header() {
  const currentPath = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Fecha o menu quando clicar fora do drawer
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

  return (
    <aside
      ref={ref}
      className={`${isOpen ? "w-[280px]" : "w-[60px]"} flex-shrink-0 sticky top-0 h-screen overflow-y-auto bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}
      style={{ fontFamily: "Barlow, sans-serif" }}
    >
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
      {/* Nav */}
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
    </aside>
  );
}
