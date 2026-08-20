"use client";
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X } from 'lucide-react';
import AssuntoModal from '../../../components/AssuntoModal';
import Skeleton from '../../../components/Skeleton';

export default function AssuntosClient() {
  const [assuntos, setAssuntos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [assuntoSelecionado, setAssuntoSelecionado] = useState(null);
  const [modalDeleteAberto, setModalDeleteAberto] = useState(false);
  const [assuntoDeletar, setAssuntoDeletar] = useState(null);
  const [menuAberto, setMenuAberto] = useState(null);
  const menuRef = useRef(null);
  const [busca, setBusca] = useState('');

  async function carregarAssuntos() {
    const res = await fetch('/api/assuntos');
    const data = res.ok ? await res.json() : [];
    setAssuntos(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => {
    carregarAssuntos();
  }, []);

  useEffect(() => {
    function handleClickFora(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(null);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  function handleAdicionar() {
    setAssuntoSelecionado(null);
    setModalAberto(true);
  }

  function handleEditar(assunto) {
    setAssuntoSelecionado(assunto);
    setModalAberto(true);
    setMenuAberto(null);
  }

  function handleConfirmarExcluir(assunto) {
    setAssuntoDeletar(assunto);
    setModalDeleteAberto(true);
    setMenuAberto(null);
  }

  async function handleExcluir() {
    await fetch(`/api/assuntos/${assuntoDeletar.id}`, {
      method: 'DELETE',
    });
    setModalDeleteAberto(false);
    setAssuntoDeletar(null);
    carregarAssuntos();
  }

  function handleSalvar() {
    carregarAssuntos();
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Assuntos</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {loading ? (
              <Skeleton as="span" className="h-4 w-20 inline-block align-middle" />
            ) : (
              <>{assuntos.length} registros</>
            )}
          </p>
        </div>
        <button
          onClick={handleAdicionar}
          className="text-white px-4 py-2 rounded-xl text-sm font-medium transition hover:opacity-90"
          style={{ backgroundColor: '#8b47ff' }}
        >
          + Adicionar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left px-8 py-3 text-sm font-semibold text-gray-600">
                Descrição
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
            {loading && Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </td>
                <td className="px-6 py-4" />
              </tr>
            ))}
            {!loading && assuntos
              .filter((a) => a.descricao.toLowerCase().includes(busca.toLowerCase()))
              .map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#ede9fe', color: '#6d28d9' }}
                      >
                        <MessageSquare size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-800">
                        {a.descricao}
                      </span>
                    </div>
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

      <AssuntoModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        assunto={assuntoSelecionado}
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
                Deseja excluir o Assunto?
              </h2>
              <p className="text-sm text-gray-500">
                Você deseja mesmo excluir o Assunto{' '}
                <strong className="text-gray-700">{assuntoDeletar?.descricao}</strong>?
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
