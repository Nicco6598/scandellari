// src/components/admin/ArrayField.tsx
import React from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline'; // Importa icone se non già presenti

// Definisci l'interfaccia per le props del componente
interface ArrayFieldProps {
  label: string;
  items: string[];
  placeholder?: string;
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  required?: boolean;
  disabled?: boolean; // <-- Aggiunta prop 'disabled', opzionale
}

// Componente funzionale ArrayField
const ArrayField: React.FC<ArrayFieldProps> = ({
  label,
  items,
  placeholder,
  onChange,
  onAdd,
  onRemove,
  required = false,
  disabled = false // <-- Ricevi la prop 'disabled', con default a false
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {/* Etichetta del campo */}
        <label className={`block text-sm font-medium ${disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {/* Pulsante per aggiungere un nuovo elemento */}
        <button
          type="button"
          onClick={onAdd}
          // Applica 'disabled' al pulsante Aggiungi
          disabled={disabled}
          className={`text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary-lighter text-sm flex items-center transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <PlusIcon className="w-4 h-4 mr-1" /> {/* Usa icona PlusIcon */}
          Aggiungi
        </button>
      </div>

      {/* Mappa gli elementi dell'array per creare input e pulsanti di rimozione */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* Input per modificare l'elemento */}
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              // Applica 'disabled' all'input
              disabled={disabled}
              className={`flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-light bg-white dark:bg-dark text-gray-900 dark:text-white ${disabled ? 'opacity-50 bg-gray-50 dark:bg-gray-800 cursor-not-allowed' : ''}`}
              placeholder={placeholder}
            />
            {/* Pulsante per rimuovere l'elemento */}
            <button
              type="button"
              onClick={() => onRemove(index)}
              // Applica 'disabled' al pulsante Rimuovi, mantenendo la logica per l'ultimo elemento
              disabled={disabled || items.length <= 1}
              title={items.length <= 1 ? "È necessario almeno un elemento" : "Rimuovi elemento"}
              className={`p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${items.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <TrashIcon className="w-5 h-5" /> {/* Usa icona TrashIcon */}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArrayField;
