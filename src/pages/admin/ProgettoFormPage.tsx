// src/pages/admin/ProgettoFormPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import AdminLayout from './AdminLayout';
import { progettiService, categorieService } from '../../supabase/services';
import { CoordinateInfo, ImmagineInfo, ProgettoData } from '../../types/supabaseTypes';
import { geocodeLocalita } from '../../utils/projectLocationUtils';
import { logger } from '../../utils/logger';

const MAX_IMAGES = 6;

type ProjectFormData = {
  titolo: string;
  descrizione: string;
  descrizioneLunga: string;
  categoria: string;
  localita: string;
  anno: string;
  cliente: string;
  durata: string;
  tecnologie: string[];
  caratteristiche: string[];
  risultati: string[];
  sfide: string[];
};

type ProjectArrayField = 'tecnologie' | 'caratteristiche' | 'risultati' | 'sfide';

const createInitialFormData = (): ProjectFormData => ({
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

const sanitizeCoordinates = (value?: CoordinateInfo[] | null): CoordinateInfo[] => {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is CoordinateInfo => (
    typeof item?.lat === 'number' && typeof item?.lng === 'number'
  ));
};

const normalizeLocationKey = (value: string) => value.trim().toLowerCase();

const ProgettoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = id !== undefined && id !== 'nuovo';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ nome?: string | null }>>([]);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  const [formData, setFormData] = useState<ProjectFormData>(createInitialFormData);
  const [coordinatePunti, setCoordinatePunti] = useState<CoordinateInfo[]>([]);
  const [coordinatePercorso, setCoordinatePercorso] = useState<CoordinateInfo[]>([]);
  const [lastGeocodedLocalita, setLastGeocodedLocalita] = useState('');

  const [existingImages, setExistingImages] = useState<ImmagineInfo[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const coordinatesOutdated = (
    coordinatePunti.length > 0 &&
    normalizeLocationKey(lastGeocodedLocalita) !== normalizeLocationKey(formData.localita)
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categorieService.getAllCategorie();
        setCategories(data);
      } catch (fetchError) {
        logger.error('Error fetching categories', fetchError);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isEditing || !id) return;

    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      setGeoError(null);

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

          const persistedPoints = sanitizeCoordinates(data.coordinate_punti ?? data.coordinatePunti);
          const persistedRoute = sanitizeCoordinates(data.coordinate_percorso ?? data.coordinatePercorso);

          setCoordinatePunti(persistedPoints);
          setCoordinatePercorso(persistedRoute.length > 0 ? persistedRoute : persistedPoints);
          setLastGeocodedLocalita(persistedPoints.length > 0 ? (data.localita || '') : '');
        }
      } catch (fetchError) {
        logger.error('Error fetching project', fetchError);
        setError('Impossibile caricare il progetto.');
      } finally {
        setLoading(false);
        setFormChanged(false);
      }
    };

    fetchProject();
  }, [id, isEditing]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'localita') {
      setGeoError(null);
    }
    setFormChanged(true);
  };

  const handleArrayChange = (index: number, value: string, arrayName: ProjectArrayField) => {
    setFormData((prev) => {
      const array = [...prev[arrayName]];
      array[index] = value;
      return { ...prev, [arrayName]: array };
    });
    setFormChanged(true);
  };

  const handleAddArrayItem = (arrayName: ProjectArrayField) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], ''],
    }));
    setFormChanged(true);
  };

  const handleRemoveArrayItem = (index: number, arrayName: ProjectArrayField) => {
    setFormData((prev) => {
      if (prev[arrayName].length <= 1) return prev;

      const array = [...prev[arrayName]];
      array.splice(index, 1);
      return { ...prev, [arrayName]: array };
    });
    setFormChanged(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    const files = Array.from(event.target.files);
    const currentTotal = existingImages.length + selectedFiles.length;
    const remainingSlots = MAX_IMAGES - currentTotal;
    const filesToAdd = files.slice(0, remainingSlots);

    setSelectedFiles((prev) => [...prev, ...filesToAdd]);
    setImagePreviews((prev) => [...prev, ...filesToAdd.map((file) => URL.createObjectURL(file))]);
    setFormChanged(true);
    event.target.value = '';
  };

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setFormChanged(true);
  };

  const removeSelectedFile = (indexToRemove: number) => {
    setImagePreviews((prev) => {
      const urlToRemove = prev[indexToRemove];
      if (urlToRemove) URL.revokeObjectURL(urlToRemove);
      return prev.filter((_, index) => index !== indexToRemove);
    });
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setFormChanged(true);
  };

  const handleGenerateCoordinates = async () => {
    if (!formData.localita.trim()) {
      setGeoError('Inserisci una località prima di generare le coordinate.');
      return;
    }

    setIsGeocoding(true);
    setGeoError(null);

    try {
      const coordinates = await geocodeLocalita(formData.localita);

      if (coordinates.points.length === 0) {
        setCoordinatePunti([]);
        setCoordinatePercorso([]);
        setLastGeocodedLocalita('');
        setGeoError('Nessuna coordinata trovata. Correggi la località e riprova.');
        return;
      }

      setCoordinatePunti(coordinates.points);
      setCoordinatePercorso(coordinates.route?.length ? coordinates.route : coordinates.points);
      setLastGeocodedLocalita(formData.localita);
      setFormChanged(true);
    } catch (geocodingError) {
      logger.error('Errore generazione coordinate progetto', geocodingError);
      setGeoError('Errore durante la generazione delle coordinate. Riprova tra poco.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleClearCoordinates = () => {
    setCoordinatePunti([]);
    setCoordinatePercorso([]);
    setLastGeocodedLocalita('');
    setGeoError(null);
    setFormChanged(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setIsUploading(true);
    setError(null);
    setGeoError(null);

    try {
      let uploadedImages: ImmagineInfo[] = [...existingImages];

      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map((file) => progettiService.uploadImage(file, 'progetti'));
        const newUploadedImages = await Promise.all(uploadPromises);
        uploadedImages = [...uploadedImages, ...newUploadedImages];
      }

      let resolvedCoordinatePunti = coordinatePunti;
      let resolvedCoordinatePercorso = coordinatePercorso.length > 0 ? coordinatePercorso : coordinatePunti;

      if (formData.localita.trim()) {
        const requiresFreshCoordinates = resolvedCoordinatePunti.length === 0 || coordinatesOutdated;

        if (requiresFreshCoordinates) {
          setIsGeocoding(true);

          const generatedCoordinates = await geocodeLocalita(formData.localita);
          if (generatedCoordinates.points.length === 0) {
            throw new Error('Impossibile salvare senza coordinate valide. Correggi la località e rigenera i dati geografici.');
          }

          resolvedCoordinatePunti = generatedCoordinates.points;
          resolvedCoordinatePercorso = generatedCoordinates.route?.length
            ? generatedCoordinates.route
            : generatedCoordinates.points;

          setCoordinatePunti(resolvedCoordinatePunti);
          setCoordinatePercorso(resolvedCoordinatePercorso);
          setLastGeocodedLocalita(formData.localita);
        }
      } else {
        resolvedCoordinatePunti = [];
        resolvedCoordinatePercorso = [];
      }

      const cleanedData: Partial<ProgettoData> = {
        ...formData,
        descrizioneLunga: formData.descrizioneLunga || formData.descrizione,
        tecnologie: formData.tecnologie.filter((item) => item.trim() !== ''),
        caratteristiche: formData.caratteristiche.filter((item) => item.trim() !== ''),
        risultati: formData.risultati.filter((item) => item.trim() !== ''),
        sfide: formData.sfide.filter((item) => item.trim() !== ''),
        coordinate_punti: resolvedCoordinatePunti,
        coordinate_percorso: resolvedCoordinatePercorso,
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
          coordinate_punti: cleanedData.coordinate_punti,
          coordinate_percorso: cleanedData.coordinate_percorso,
          immagini: cleanedData.immagini,
        };

        await progettiService.createProject(createPayload);
      }

      navigate('/admin/progetti');
    } catch (submitError: any) {
      logger.error('Form error', submitError);
      setError(submitError.message || 'Errore durante il salvataggio.');
    } finally {
      setSaving(false);
      setIsUploading(false);
      setIsGeocoding(false);
    }
  };

  const inputStyle = 'w-full px-4 py-3 bg-transparent border border-black/10 dark:border-white/10 focus:border-primary transition-all focus:outline-none text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 text-sm';
  const selectStyle = `${inputStyle} dark:bg-black`;
  const labelStyle = 'block text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60 mb-2';

  if (loading) {
    return (
      <AdminLayout title="Progetto">
        <div className="p-12 text-center uppercase tracking-widest text-xs font-black text-black/60 dark:text-white/60">
          Caricamento...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEditing ? 'Modifica Progetto' : 'Nuovo Progetto'}>
      <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5">
            <h1 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">
              {isEditing ? 'Modifica Progetto' : 'Nuovo Progetto'}
            </h1>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => (formChanged ? setConfirmLeave(true) : navigate('/admin/progetti'))}
                className="px-6 py-3 border border-black/10 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={saving || isUploading || isGeocoding}
                className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 border border-primary hover:bg-primary-dark transition-all"
              >
                {isGeocoding
                  ? 'Calcolo coordinate...'
                  : isUploading
                    ? 'Caricando...'
                    : saving
                      ? 'Salvando...'
                      : 'Salva'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-600 text-white text-xs font-black uppercase tracking-widest">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="border border-black/5 dark:border-white/5 p-8 space-y-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white mb-8">
                  Informazioni Generali
                </h2>

                <div>
                  <label className={labelStyle}>Titolo</label>
                  <input
                    type="text"
                    name="titolo"
                    value={formData.titolo}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>Categoria</label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                      required
                      className={selectStyle}
                    >
                      <option value="" className="bg-white text-black dark:bg-black dark:text-white">
                        Seleziona
                      </option>
                      {categories.map((cat) => (
                        <option
                          key={cat.nome}
                          value={cat.nome ?? ''}
                          className="bg-white text-black dark:bg-black dark:text-white"
                        >
                          {cat.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Anno</label>
                    <input
                      type="text"
                      name="anno"
                      value={formData.anno}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={labelStyle}>Località</label>
                    <input
                      type="text"
                      name="localita"
                      value={formData.localita}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Cliente</label>
                    <input
                      type="text"
                      name="cliente"
                      value={formData.cliente}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Descrizione Breve</label>
                  <textarea
                    name="descrizione"
                    value={formData.descrizione}
                    onChange={handleChange}
                    className={`${inputStyle} h-24`}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Descrizione Completa</label>
                  <textarea
                    name="descrizioneLunga"
                    value={formData.descrizioneLunga}
                    onChange={handleChange}
                    className={`${inputStyle} h-48`}
                  />
                </div>
              </div>

              <div className="border border-black/5 dark:border-white/5 p-8 space-y-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white mb-8">
                  Dettagli Tecnici
                </h2>

                {[
                  { label: 'Tecnologie', addLabel: 'Tecnologia', key: 'tecnologie' },
                  { label: 'Caratteristiche', addLabel: 'Caratteristica', key: 'caratteristiche' },
                  { label: 'Risultati', addLabel: 'Risultato', key: 'risultati' },
                  { label: 'Sfide', addLabel: 'Sfida', key: 'sfide' },
                ].map((section) => (
                  <div key={section.key}>
                    <label className={labelStyle}>{section.label}</label>
                    <div className="space-y-3">
                      {formData[section.key as ProjectArrayField].map((value, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={value}
                            onChange={(event) => (
                              handleArrayChange(idx, event.target.value, section.key as ProjectArrayField)
                            )}
                            className={inputStyle}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveArrayItem(idx, section.key as ProjectArrayField)}
                            className="p-3 border border-black/5 dark:border-white/5 text-red-600 hover:bg-red-600 hover:text-white transition-all"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddArrayItem(section.key as ProjectArrayField)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                      >
                        + Aggiungi {section.addLabel}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="border border-black/5 dark:border-white/5 p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">
                      Dati Geografici
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-black/60 dark:text-white/60">
                      Le coordinate vengono persistite nel progetto e riusate dal frontend senza dover geocodare ogni volta.
                    </p>
                  </div>
                  {coordinatePunti.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCoordinates}
                      className="text-[10px] font-black uppercase tracking-widest text-red-600 hover:underline"
                    >
                      Svuota
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateCoordinates}
                    disabled={isGeocoding}
                    className="px-4 py-3 border border-primary text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white disabled:opacity-50 transition-all"
                  >
                    {coordinatePunti.length > 0 ? 'Rigenera coordinate' : 'Genera coordinate'}
                  </button>
                  {coordinatesOutdated && (
                    <span className="px-3 py-3 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest">
                      Da aggiornare
                    </span>
                  )}
                </div>

                {geoError && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 text-orange-700 dark:text-orange-300 text-[11px] font-bold tracking-wide">
                    {geoError}
                  </div>
                )}

                {coordinatePunti.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-black/5 dark:border-white/5 p-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/50">
                          Punti trovati
                        </div>
                        <div className="mt-2 text-2xl font-black text-black dark:text-white">
                          {coordinatePunti.length}
                        </div>
                      </div>
                      <div className="border border-black/5 dark:border-white/5 p-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/50">
                          Vertici percorso
                        </div>
                        <div className="mt-2 text-2xl font-black text-black dark:text-white">
                          {coordinatePercorso.length}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {coordinatePunti.slice(0, 3).map((point, index) => (
                        <div
                          key={`${point.lat}-${point.lng}-${index}`}
                          className="border border-black/5 dark:border-white/5 px-4 py-3"
                        >
                          <div className="text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/50">
                            Punto {index + 1}
                          </div>
                          <div className="mt-1 text-xs text-black dark:text-white">
                            lat {point.lat.toFixed(5)} / lng {point.lng.toFixed(5)}
                          </div>
                        </div>
                      ))}
                      {coordinatePunti.length > 3 && (
                        <div className="text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/50">
                          + {coordinatePunti.length - 3} punti aggiuntivi salvati nel progetto
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/50">
                      Ultima località geocodata: {lastGeocodedLocalita || 'non disponibile'}
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-black/10 dark:border-white/10 p-4 text-[11px] leading-relaxed text-black/60 dark:text-white/60">
                    Nessuna coordinata persistita. Dopo la generazione, il progetto salverà punti e percorso direttamente nel record.
                  </div>
                )}
              </div>

              <div className="border border-black/5 dark:border-white/5 p-8">
                <h2 className="text-sm font-black uppercase tracking-widest text-black dark:text-white mb-8">
                  Galleria Immagini
                </h2>

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
                      <span className="text-[10px] font-black uppercase tracking-widest text-black/60 dark:text-white/60 mt-2">
                        Upload
                      </span>
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" multiple />
                    </label>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-black/60 dark:text-white/60">Massimo {MAX_IMAGES} immagini</span>
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
