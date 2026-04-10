// src/pages/admin/CompetenzaFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { competenzeService } from '../../supabase/services';
import { logger } from '../../utils/logger';
import { CompetenzaData, ImmagineInfo } from '../../types/supabaseTypes';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { PhotoIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DOMPurify from 'dompurify';

const MAX_IMAGES = 6;

const CompetenzaFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined && id !== 'nuova';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formChanged, setFormChanged] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const [formData, setFormData] = useState({
    titolo: '',
    categoria: '',
    descrizioneBreve: '',
    descrizioneLunga: '',
    icona: '',
    caratteristiche: [''],
    lineeUtilizzo: [''],
    applicazioni: [''],
  });

  const [existingImages, setExistingImages] = useState<ImmagineInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const categoryIcons: Record<string, string> = {
    oleodinamica: '<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
    segnalamento: '<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    realizzazione: '<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>',
    manutenzione: '<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
  };

  useEffect(() => {
    if (!isEditing || !id) return;

    const fetchCompetenza = async () => {
      setLoading(true);
      try {
        const data = await competenzeService.getCompetenzaById(id);
        if (data) {
          setFormData({
            titolo: data.titolo || '',
            categoria: data.categoria || '',
            descrizioneBreve: data.descrizioneBreve || '',
            descrizioneLunga: data.descrizioneLunga || '',
            icona: data.icona || '',
            caratteristiche: data.caratteristiche?.length ? data.caratteristiche : [''],
            lineeUtilizzo: data.lineeUtilizzo?.length ? data.lineeUtilizzo : [''],
            applicazioni: data.applicazioni?.length ? data.applicazioni : [''],
          });
          setExistingImages(data.immagini || (data.immagine ? [data.immagine] : []));
        }
      } catch (error) {
        logger.error("Form error", error);
        setError('Impossibile caricare la competenza.');
      } finally {
        setLoading(false);
        setFormChanged(false);
      }
    };

    fetchCompetenza();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'categoria' && value in categoryIcons) {
        newData.icona = categoryIcons[value];
      }
      return newData;
    });
    setFormChanged(true);
  };

  const handleArrayChange = (index: number, value: string, arrayName: keyof typeof formData) => {
    setFormData(prev => {
      const array = [...(prev[arrayName] as string[])];
      array[index] = value;
      return { ...prev, [arrayName]: array };
    });
    setFormChanged(true);
  };

  const handleAddArrayItem = (arrayName: keyof typeof formData) => {
    setFormData(prev => {
      const array = [...(prev[arrayName] as string[])];
      return { ...prev, [arrayName]: [...array, ''] };
    });
    setFormChanged(true);
  };

  const handleRemoveArrayItem = (index: number, arrayName: keyof typeof formData) => {
    setFormData(prev => {
      const array = [...(prev[arrayName] as string[])];
      if (array.length <= 1) return prev;
      array.splice(index, 1);
      return { ...prev, [arrayName]: array };
    });
    setFormChanged(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const currentTotal = existingImages.length + selectedFiles.length;
      const remainingSlots = MAX_IMAGES - currentTotal;
      const filesToAdd = files.slice(0, remainingSlots);

      const newSelectedFiles = [...selectedFiles, ...filesToAdd];
      setSelectedFiles(newSelectedFiles);

      const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setFormChanged(true);
      event.target.value = '';
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setFormChanged(true);
  };

  const removeSelectedFile = (indexToRemove: number) => {
    setImagePreviews(prev => {
      const urlToRemove = prev[indexToRemove];
      if (urlToRemove) URL.revokeObjectURL(urlToRemove);
      return prev.filter((_, index) => index !== indexToRemove);
    });
    setSelectedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    setFormChanged(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setIsUploading(true);
    setError(null);

    try {
      let uploadedImages: ImmagineInfo[] = [];
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(file => competenzeService.uploadImage(file));
        uploadedImages = await Promise.all(uploadPromises);
      }

      const cleanedData: CompetenzaData = {
        ...formData,
        immagini: [...existingImages, ...uploadedImages],
        caratteristiche: formData.caratteristiche.filter(c => c.trim() !== ''),
        applicazioni: formData.applicazioni.filter(a => a.trim() !== ''),
        lineeUtilizzo: formData.lineeUtilizzo.filter(l => l.trim() !== '')
      };

      if (isEditing && id) {
        await competenzeService.updateCompetenza(id, cleanedData);
      } else {
        await competenzeService.createCompetenza(cleanedData);
      }
      navigate('/admin/competenze');
    } catch (err: any) {
      logger.error("Form error", err);
      setError(err.message || 'Errore durante il salvataggio.');
    } finally {
      setSaving(false);
      setIsUploading(false);
    }
  };

  const inputStyle = "w-full px-4 py-3 bg-transparent border border-black/10 dark:border-white/10 focus:border-indigo-600 transition-all focus:outline-none text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 text-sm";
  const selectStyle = `${inputStyle} dark:bg-black`;
  const labelStyle = "block text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60 mb-2";

  if (loading) {
    return (
      <AdminLayout title="Competenza">
        <div className="p-12 text-center uppercase tracking-widest text-xs font-black text-black/60 dark:text-white/60">Caricamento...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Modifica Competenza" : "Nuova Competenza"}>
      <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5">
            <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
              {isEditing ? 'Modifica Competenza' : 'Nuova Competenza'}
            </h1>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => formChanged ? setConfirmLeave(true) : navigate('/admin/competenze')}
                className="px-6 py-3 border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saving || isUploading}
                className="px-6 py-3 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 border border-indigo-600 hover:bg-indigo-700 transition-all"
              >
                {isUploading ? 'Caricando...' : saving ? 'Salvando...' : 'Salva'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-600 text-white text-xs font-black uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="border border-black/5 dark:border-white/5 p-8 space-y-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white mb-8">Informazioni Generali</h2>

                <div>
                  <label className={labelStyle}>Titolo</label>
                  <input type="text" name="titolo" value={formData.titolo} onChange={handleChange} required className={inputStyle} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>Categoria</label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} required className={selectStyle}>
                      <option value="" className="bg-white text-black dark:bg-black dark:text-white">Seleziona</option>
                      <option value="oleodinamica" className="bg-white text-black dark:bg-black dark:text-white">Oleodinamica</option>
                      <option value="segnalamento" className="bg-white text-black dark:bg-black dark:text-white">Segnalamento</option>
                      <option value="realizzazione" className="bg-white text-black dark:bg-black dark:text-white">Realizzazione</option>
                      <option value="manutenzione" className="bg-white text-black dark:bg-black dark:text-white">Manutenzione</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1 overflow-hidden opacity-40">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(formData.icona) }} className="w-8 h-8" />
                    <span className="ml-3 text-[10px] font-black uppercase tracking-widest">Anteprima Icona</span>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Descrizione Breve</label>
                  <textarea name="descrizioneBreve" value={formData.descrizioneBreve} onChange={handleChange} className={`${inputStyle} h-24`} />
                </div>

                <div>
                  <label className={labelStyle}>Descrizione Completa</label>
                  <textarea name="descrizioneLunga" value={formData.descrizioneLunga} onChange={handleChange} className={`${inputStyle} h-48`} />
                </div>
              </div>

              {/* Dynamic Sections */}
              <div className="border border-black/5 dark:border-white/5 p-8 space-y-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white mb-8">Dettagli Tecnici</h2>

                {[
                  { label: 'Caratteristiche', addLabel: 'Caratteristica', key: 'caratteristiche' },
                  { label: 'Linee Utilizzo', addLabel: 'Linea Utilizzo', key: 'lineeUtilizzo' },
                  { label: 'Applicazioni', addLabel: 'Applicazione', key: 'applicazioni' }
                ].map((section) => (
                  <div key={section.key}>
                    <label className={labelStyle}>{section.label}</label>
                    <div className="space-y-3">
                      {(formData[section.key as keyof typeof formData] as string[]).map((val, idx) => (
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
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline"
                      >
                        + Aggiungi {section.addLabel}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Images */}
            <div className="space-y-8">
              <div className="border border-black/5 dark:border-white/5 p-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white mb-8">Galleria Immagini</h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {existingImages.map((img, idx) => (
                    <div key={`ex-${idx}`} className="relative aspect-square border border-black/5 dark:border-white/5 group">
                      <img src={img.url} className="w-full h-full object-cover" alt="" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute inset-0 bg-red-600 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all uppercase tracking-widest text-[10px] font-black"
                      >
                        Elimina
                      </button>
                    </div>
                  ))}
                  {imagePreviews.map((url, idx) => (
                    <div key={`pref-${idx}`} className="relative aspect-square border border-indigo-600/20 group">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(idx)}
                        className="absolute inset-0 bg-red-600 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all uppercase tracking-widest text-[10px] font-black"
                      >
                        Rimuovi
                      </button>
                    </div>
                  ))}
                  {(existingImages.length + selectedFiles.length) < MAX_IMAGES && (
                    <label className="aspect-square border border-black/10 dark:border-white/10 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600 transition-all">
                    <PhotoIcon className="w-8 h-8 text-black/30 dark:text-white/30" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60 mt-2">Upload</span>
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" multiple />
                    </label>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-black/60 dark:text-white/60">
                    Massimo {MAX_IMAGES} immagini
                  </span>
                  <span className="text-orange-600 dark:text-orange-500">
                    {MAX_IMAGES - (existingImages.length + selectedFiles.length)} rimanenti
                  </span>
                </div>
                <p className="mt-4 text-[11px] leading-relaxed text-black/55 dark:text-white/55">
                  Le nuove immagini vengono ottimizzate automaticamente prima dell&apos;upload per ridurre il peso sul frontend.
                </p>
              </div>
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
        onConfirm={() => navigate('/admin/competenze')}
        onCancel={() => setConfirmLeave(false)}
      />
    </AdminLayout>
  );
};

export default CompetenzaFormPage;
