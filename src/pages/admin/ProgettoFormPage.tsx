// src/pages/admin/ProgettoFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { logger } from '../../utils/logger';
import AdminLayout from './AdminLayout';
import { progettiService, categorieService } from '../../supabase/services';
import { ProgettoData, ImmagineInfo } from '../../types/supabaseTypes';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { PhotoIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MAX_IMAGES = 6;

const ProgettoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined && id !== 'nuovo';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    descrizioneLunga: '',
    categoria: '',
    localita: '',
    anno: new Date().getFullYear().toString(),
    cliente: '',
    durata: '',
    tecnologie: [''],
    caratteristiche: [''],
    risultati: [''],
    sfide: [''],
  });

  const [existingImages, setExistingImages] = useState<ImmagineInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categorieService.getAllCategorie();
        setCategories(data);
      } catch (error) {
        logger.error('Error fetching categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isEditing || !id) return;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await progettiService.getProjectById(id);
        if (data) {
          setFormData({
            titolo: data.titolo || '',
            descrizione: data.descrizione || '',
            descrizioneLunga: data.descrizioneLunga || '',
            categoria: data.categoria || '',
            localita: data.localita || '',
            anno: data.anno || new Date().getFullYear().toString(),
            cliente: data.cliente || '',
            durata: data.durata || '',
            tecnologie: data.tecnologie?.length ? data.tecnologie : [''],
            caratteristiche: data.caratteristiche?.length ? data.caratteristiche : [''],
            risultati: data.risultati?.length ? data.risultati : [''],
            sfide: data.sfide?.length ? data.sfide : [''],
          });
          setExistingImages(data.immagini || []);
        }
      } catch (error) {
        logger.error('Error fetching project', error);
        setError('Impossibile caricare il progetto.');
      } finally {
        setLoading(false);
        setFormChanged(false);
      }
    };

    fetchProject();

    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      let uploadedImages: ImmagineInfo[] = [...existingImages];
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(file => progettiService.uploadImage(file, 'progetti'));
        const newUploadedImages = await Promise.all(uploadPromises);
        uploadedImages = [...uploadedImages, ...newUploadedImages];
      }

      const cleanedData: Partial<ProgettoData> = {
        ...formData,
        descrizioneLunga: formData.descrizioneLunga || formData.descrizione,
        tecnologie: formData.tecnologie.filter(item => item.trim() !== ''),
        caratteristiche: formData.caratteristiche.filter(item => item.trim() !== ''),
        risultati: formData.risultati.filter(item => item.trim() !== ''),
        sfide: formData.sfide.filter(item => item.trim() !== ''),
        immagini: uploadedImages,
      };

      if (isEditing && id) {
        await progettiService.updateProject(id, cleanedData);
      } else {
        const createPayload: Omit<ProgettoData, 'id' | 'created_at' | 'updated_at' | 'id_numerico'> = {
          titolo: cleanedData.titolo!,
          descrizione: cleanedData.descrizione!,
          descrizioneLunga: cleanedData.descrizioneLunga,
          categoria: cleanedData.categoria!,
          localita: cleanedData.localita!,
          anno: cleanedData.anno!,
          cliente: cleanedData.cliente,
          durata: cleanedData.durata,
          tecnologie: cleanedData.tecnologie,
          caratteristiche: cleanedData.caratteristiche,
          risultati: cleanedData.risultati,
          sfide: cleanedData.sfide,
          immagini: cleanedData.immagini,
        };
        await progettiService.createProject(createPayload);
      }
      navigate('/admin/progetti');
    } catch (err: any) {
      logger.error("Form error", err);
      setError(err.message || 'Errore durante il salvataggio.');
    } finally {
      setSaving(false);
      setIsUploading(false);
    }
  };

  const inputStyle = "w-full px-4 py-3 bg-transparent border border-black/10 dark:border-white/10 focus:border-primary transition-all focus:outline-none text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 text-sm";
  const selectStyle = `${inputStyle} dark:bg-black`;
  const labelStyle = "block text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60 mb-2";

  if (loading) {
    return (
      <AdminLayout title="Progetto">
        <div className="p-12 text-center uppercase tracking-widest text-xs font-black text-black/60 dark:text-white/60">Caricamento...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? "Modifica Progetto" : "Nuovo Progetto"}>
      <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5">
            <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
              {isEditing ? 'Modifica Progetto' : 'Nuovo Progetto'}
            </h1>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => formChanged ? setConfirmLeave(true) : navigate('/admin/progetti')}
                className="px-6 py-3 border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saving || isUploading}
                className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 border border-primary hover:bg-primary-dark transition-all"
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
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.nome} className="bg-white text-black dark:bg-black dark:text-white">
                          {cat.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Anno</label>
                    <input type="text" name="anno" value={formData.anno} onChange={handleChange} className={inputStyle} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>Località</label>
                    <input type="text" name="localita" value={formData.localita} onChange={handleChange} className={inputStyle} />
                  </div>
                  <div>
                    <label className={labelStyle}>Cliente</label>
                    <input type="text" name="cliente" value={formData.cliente} onChange={handleChange} className={inputStyle} />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Descrizione Breve</label>
                  <textarea name="descrizione" value={formData.descrizione} onChange={handleChange} className={`${inputStyle} h-24`} />
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
                  { label: 'Tecnologie', addLabel: 'Tecnologia', key: 'tecnologie' },
                  { label: 'Caratteristiche', addLabel: 'Caratteristica', key: 'caratteristiche' },
                  { label: 'Risultati', addLabel: 'Risultato', key: 'risultati' },
                  { label: 'Sfide', addLabel: 'Sfida', key: 'sfide' }
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
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
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
                    <div key={`pref-${idx}`} className="relative aspect-square border border-primary/20 group">
                      <img src={url} className="w-full h-full object-cover" alt="" />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(idx)}
                        className="absolute inset-0 bg-red-600 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all uppercase tracking-widest text-[10px] font-black"
                      >
                        Rimuovi
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-primary h-1 animate-pulse" />
                    </div>
                  ))}
                  {(existingImages.length + selectedFiles.length) < MAX_IMAGES && (
                    <label className="aspect-square border border-black/10 dark:border-white/10 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all">
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
        onConfirm={() => navigate('/admin/progetti')}
        onCancel={() => setConfirmLeave(false)}
      />
    </AdminLayout>
  );
};

export default ProgettoFormPage;
