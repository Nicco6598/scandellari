// src/pages/admin/OfferteLavoroPage.tsx
import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logger } from '../../utils/logger';
import AdminLayout from './AdminLayout';
import { offerteService } from '../../supabase/services';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { OffertaLavoroData } from '../../types/supabaseTypes';

const OfferteLavoroPage: React.FC = () => {
  const [offerte, setOfferte] = useState<OffertaLavoroData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeTipo, setActiveTipo] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfferte = async () => {
      try {
        const data = await offerteService.getAllOfferte();
        setOfferte(data);
      } catch (error) {
        logger.error('Errore nel recupero delle offerte di lavoro', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfferte();
  }, []);

  const tipiOfferta = useMemo(() => Array.from(new Set(offerte.map((offerta) => offerta.tipo))), [offerte]);
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredOfferte = useMemo(() => {
    return offerte.filter((offerta) => {
      const matchesSearch =
        normalizedSearchTerm === '' ||
        offerta.titolo.toLowerCase().includes(normalizedSearchTerm) ||
        offerta.dipartimento.toLowerCase().includes(normalizedSearchTerm) ||
        offerta.sede.toLowerCase().includes(normalizedSearchTerm) ||
        offerta.tipo.toLowerCase().includes(normalizedSearchTerm);

      const matchesType = activeTipo === null || offerta.tipo === activeTipo;
      return matchesSearch && matchesType;
    });
  }, [activeTipo, normalizedSearchTerm, offerte]);

  const filteredCount = useMemo(() => filteredOfferte.length, [filteredOfferte.length]);

  const handleDeleteOfferta = async (id: string) => {
    if (!id) return;

    try {
      await offerteService.deleteOfferta(id);
      setOfferte((currentOfferte) => currentOfferte.filter((offerta) => offerta.id !== id));
      setConfirmDelete(null);
    } catch (error) {
      logger.error('Errore eliminazione offerta', error);
    }
  };

  return (
    <AdminLayout title="Gestione Offerte">
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-stone-50 dark:bg-black min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-black/5 dark:border-white/5">
          <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">Gestione Offerte</h1>
          <Link
            to="/admin/offerte-lavoro/nuova"
            className="px-6 py-3 bg-teal-600 text-white hover:bg-white hover:text-teal-600 dark:bg-teal-600 dark:text-black dark:hover:bg-black/80 dark:hover:text-teal-600 text-xs font-black uppercase tracking-widest transition-all border border-teal-600 dark:border-teal-600/80"
          >
            + Nuova
          </Link>
        </div>

        {/* Filters */}
        <div className="border border-black/5 dark:border-white/5 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="inline-flex items-center px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-black text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70">
              Totali: {offerte.length}
            </div>
            <div className="inline-flex items-center px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-black text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70">
              Mostrate: {filteredCount}
            </div>
            <div className="inline-flex items-center px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-black text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Nessuna immagine prevista
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Cerca offerte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-black/10 dark:border-white/10 focus:border-teal-600 transition-all focus:outline-none text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 text-sm"
              />
            </div>
            {tipiOfferta.length > 0 && (
              <select
                value={activeTipo || ''}
                onChange={(e) => setActiveTipo(e.target.value || null)}
                className="w-full px-4 py-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 focus:border-teal-600 transition-all focus:outline-none text-black dark:text-white text-sm"
              >
                <option value="" className="bg-white text-black dark:bg-black dark:text-white">Tutti i tipi</option>
                {tipiOfferta.map(tipo => (
                  <option key={tipo} value={tipo} className="bg-white text-black dark:bg-black dark:text-white">{tipo}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="border border-black/5 dark:border-white/5 p-12 text-center">
            <div className="text-sm font-medium text-black/60 dark:text-white/60 uppercase tracking-widest">Caricamento...</div>
          </div>
        ) : filteredOfferte.length === 0 ? (
          <div className="border border-black/5 dark:border-white/5 p-12 text-center">
            <div className="text-sm font-medium text-black/60 dark:text-white/60 uppercase tracking-widest">Nessuna offerta trovata</div>
          </div>
        ) : (
          <div className="border border-black/5 dark:border-white/5">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-black/5 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-black dark:text-white">Titolo</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-black dark:text-white">Dipartimento</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-black dark:text-white">Sede</th>
                    <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-black dark:text-white">Tipo</th>
                    <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-widest text-black dark:text-white">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOfferte.map((offerta) => (
                    <tr key={offerta.id} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-sm font-medium text-black dark:text-white">{offerta.titolo}</td>
                      <td className="px-6 py-4 text-sm text-black/60 dark:text-white/60">{offerta.dipartimento}</td>
                      <td className="px-6 py-4 text-sm text-black/60 dark:text-white/60">{offerta.sede}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs font-black uppercase tracking-wider bg-teal-600/10 text-teal-600 border border-teal-600/20">
                          {offerta.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/offerte-lavoro/modifica/${offerta.id}`}
                            className="p-2 text-teal-600 hover:bg-teal-600 hover:text-white transition-all border border-teal-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => offerta.id && setConfirmDelete(offerta.id)}
                            className="p-2 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-black/5 dark:divide-white/5">
              {filteredOfferte.map((offerta) => (
                <div key={offerta.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-sm font-black uppercase text-black dark:text-white">{offerta.titolo}</h3>
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/offerte-lavoro/modifica/${offerta.id}`}
                        className="p-2 text-teal-600 hover:bg-teal-600 hover:text-white transition-all border border-teal-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => offerta.id && setConfirmDelete(offerta.id)}
                        className="p-2 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase tracking-wider text-black/60 dark:text-white/60">Dipartimento:</span>
                      <span className="text-black/70 dark:text-white/70">{offerta.dipartimento}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase tracking-wider text-black/60 dark:text-white/60">Sede:</span>
                      <span className="text-black/70 dark:text-white/70">{offerta.sede}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-black uppercase tracking-wider text-black/60 dark:text-white/60">Tipo:</span>
                      <span className="px-2 py-1 text-xs font-black uppercase bg-teal-600/10 text-teal-600 border border-teal-600/20">{offerta.tipo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ConfirmDialog
          isOpen={confirmDelete !== null}
          title="Conferma eliminazione"
          message="Sei sicuro di voler eliminare questa offerta di lavoro? Questa azione non può essere annullata."
          confirmLabel="Elimina"
          cancelLabel="Annulla"
          confirmColor="red"
          icon="delete"
          onConfirm={() => confirmDelete && handleDeleteOfferta(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      </div>
    </AdminLayout>
  );
};

export default OfferteLavoroPage;
