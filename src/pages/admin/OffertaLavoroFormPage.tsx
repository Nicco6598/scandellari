// src/pages/admin/OffertaLavoroFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logger } from '../../utils/logger';
import AdminLayout from './AdminLayout';
import { offerteService } from '../../supabase/services';
import { OffertaLavoroData } from '../../types/supabaseTypes';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { XMarkIcon } from '@heroicons/react/24/outline';

const OffertaLavoroFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined && id !== 'nuova';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const [formData, setFormData] = useState<Omit<OffertaLavoroData, 'id' | 'created_at' | 'updatedAt'>>({
    titolo: '',
    dipartimento: '',
    sede: '',
    tipo: 'Full-time',
    descrizione: '',
    requisiti: [''],
    responsabilita: ['']
  });

  useEffect(() => {
    if (!isEditing) return;

    const fetchOfferta = async () => {
      setLoading(true);
      try {
        const data = await offerteService.getOffertaById(id!);
        if (data) {
          setFormData({
            titolo: data.titolo || '',
            dipartimento: data.dipartimento || '',
            sede: data.sede || '',
            tipo: data.tipo || 'Full-time',
            descrizione: data.descrizione || '',
            requisiti: data.requisiti?.length ? data.requisiti : [''],
            responsabilita: data.responsabilita?.length ? data.responsabilita : ['']
          });
        }
      } catch (error) {
        logger.error("Offerta error", error);
        setError('Impossibile caricare l\'offerta.');
      } finally {
        setLoading(false);
        setFormChanged(false);
      }
    };

    fetchOfferta();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormChanged(true);
  };

  const handleArrayChange = (index: number, value: string, arrayName: 'requisiti' | 'responsabilita') => {
    setFormData(prev => {
      const array = [...prev[arrayName]];
      array[index] = value;
      return { ...prev, [arrayName]: array };
    });
    setFormChanged(true);
  };

  const handleAddArrayItem = (arrayName: 'requisiti' | 'responsabilita') => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], '']
    }));
    setFormChanged(true);
  };

  const handleRemoveArrayItem = (index: number, arrayName: 'requisiti' | 'responsabilita') => {
    setFormData(prev => {
      const array = [...prev[arrayName]];
      if (array.length <= 1) return prev;
      array.splice(index, 1);
      return { ...prev, [arrayName]: array };
    });
    setFormChanged(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const cleanedData = {
        ...formData,
        requisiti: formData.requisiti.filter(item => item.trim() !== ''),
        responsabilita: formData.responsabilita.filter(item => item.trim() !== '')
      };

      if (isEditing) {
        await offerteService.updateOfferta(id!, cleanedData);
      } else {
        await offerteService.createOfferta(cleanedData);
      }
      navigate('/admin/offerte-lavoro');
    } catch (error: any) {
      logger.error("Offerta error", error);
      setError('Errore durante il salvataggio.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = "w-full px-4 py-3 bg-transparent border border-black/10 dark:border-white/10 focus:border-teal-600 transition-all focus:outline-none text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 text-sm";
  const selectStyle = `${inputStyle} dark:bg-black`;
  const labelStyle = "block text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60 mb-2";

  if (loading) {
    return (
      <AdminLayout title="Offerta Lavoro">
        <div className="p-12 text-center uppercase tracking-widest text-xs font-black text-black/60 dark:text-white/60">Caricamento...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Modifica Offerta" : "Nuova Offerta"}>
      <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5">
            <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
              {isEditing ? 'Modifica Offerta' : 'Nuova Offerta'}
            </h1>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => formChanged ? setConfirmLeave(true) : navigate('/admin/offerte-lavoro')}
                className="px-6 py-3 border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-teal-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 border border-teal-600 hover:bg-teal-700 transition-all"
              >
                {saving ? 'Salvando...' : 'Salva'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-600 text-white text-xs font-black uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="border border-black/5 dark:border-white/5 p-8 space-y-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white mb-8">Dettagli Offerta</h2>

                <div>
                  <label className={labelStyle}>Titolo</label>
                  <input type="text" name="titolo" value={formData.titolo} onChange={handleChange} required className={inputStyle} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>Dipartimento</label>
                    <input type="text" name="dipartimento" value={formData.dipartimento} onChange={handleChange} required className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Sede</label>
                    <input type="text" name="sede" value={formData.sede} onChange={handleChange} required className={inputStyle} />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Tipo di Contratto</label>
                  <select name="tipo" value={formData.tipo} onChange={handleChange} required className={selectStyle}>
                    <option value="Full-time" className="bg-white text-black dark:bg-black dark:text-white">Full-time</option>
                    <option value="Part-time" className="bg-white text-black dark:bg-black dark:text-white">Part-time</option>
                    <option value="Contratto" className="bg-white text-black dark:bg-black dark:text-white">Contratto</option>
                    <option value="Stage" className="bg-white text-black dark:bg-black dark:text-white">Stage</option>
                  </select>
                </div>

                <div>
                  <label className={labelStyle}>Descrizione</label>
                  <textarea name="descrizione" value={formData.descrizione} onChange={handleChange} required className={`${inputStyle} h-48`} />
                </div>
              </div>
            </div>

            {/* Sidebar Columns - Arrays */}
            <div className="space-y-8">
              {[
                { label: 'Requisiti', key: 'requisiti' },
                { label: 'Responsabilità', key: 'responsabilita' }
              ].map((section) => (
                <div key={section.key} className="border border-black/5 dark:border-white/5 p-8">
                  <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white mb-8">{section.label}</h2>
                  <div className="space-y-3">
                    {formData[section.key as 'requisiti' | 'responsabilita'].map((val, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleArrayChange(idx, e.target.value, section.key as any)}
                          className={inputStyle}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveArrayItem(idx, section.key as any)}
                          className="p-3 border border-black/5 dark:border-white/5 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddArrayItem(section.key as any)}
                      className="text-[10px] font-black uppercase tracking-widest text-teal-600 hover:underline"
                    >
                      + Aggiungi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>

      <ConfirmDialog
        isOpen={confirmLeave}
        title="Modifiche non salvate"
        message="Sei sicuro di voler uscire? Le modifiche andranno perse."
        confirmLabel="Esci"
        cancelLabel="Resta"
        confirmColor="red"
        onConfirm={() => navigate('/admin/offerte-lavoro')}
        onCancel={() => setConfirmLeave(false)}
      />
    </AdminLayout>
  );
};

export default OffertaLavoroFormPage;
