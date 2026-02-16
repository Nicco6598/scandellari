// src/components/admin/ConfirmDialog.tsx
import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmColor?: 'blue' | 'red' | 'green' | 'gray';
  onConfirm: () => void;
  onCancel: () => void;
  icon?: 'warning' | 'delete' | 'info' | 'logout' | 'save';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  confirmColor = 'blue',
  onConfirm,
  onCancel,
  icon: propIcon
}) => {
  // Determine button color
  let buttonClasses = '';
  let iconComponent = null;
  let iconBgColor = '';

  // Use derived icon if not provided but can be inferred from confirmColor
  const icon = propIcon || (confirmColor === 'red' ? 'delete' : undefined);

  switch (confirmColor) {
    case 'red':
      buttonClasses = 'bg-red-600 hover:bg-red-700 text-white border-red-600';
      iconBgColor = 'bg-red-600';
      break;
    case 'green':
      buttonClasses = 'bg-green-600 hover:bg-green-700 text-white border-green-600';
      iconBgColor = 'bg-green-600';
      break;
    case 'gray':
      buttonClasses = 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
      iconBgColor = 'bg-gray-600';
      break;
    default:
      buttonClasses = 'bg-primary hover:bg-primary-dark text-white border-primary';
      iconBgColor = 'bg-primary';
  }

  // Determine icon
  switch (icon) {
    case 'warning':
      iconComponent = <ExclamationTriangleIcon className="h-8 w-8 text-white" />;
      iconBgColor = 'bg-amber-500';
      break;
    case 'delete':
      iconComponent = <TrashIcon className="h-8 w-8 text-white" />;
      iconBgColor = 'bg-red-600';
      break;
    case 'info':
      iconComponent = <InformationCircleIcon className="h-8 w-8 text-white" />;
      iconBgColor = 'bg-blue-600';
      break;
    case 'logout':
      iconComponent = <ArrowRightOnRectangleIcon className="h-8 w-8 text-white" />;
      iconBgColor = 'bg-gray-600';
      break;
    case 'save':
      iconComponent = <DocumentCheckIcon className="h-8 w-8 text-white" />;
      iconBgColor = 'bg-green-600';
      break;
    default:
      iconComponent = null;
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative overflow-hidden bg-white dark:bg-black transform px-6 pb-6 pt-6 text-left shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all w-full max-w-md border border-black/10 dark:border-white/10">
                <div className="relative">
                  {/* Icon */}
                  {iconComponent && (
                    <div className={`mx-auto flex h-16 w-16 items-center justify-center mb-6 ${iconBgColor}`}>
                      {iconComponent}
                    </div>
                  )}

                  <Dialog.Title
                    as="h3"
                    className="text-xl font-black uppercase tracking-tight text-black dark:text-white text-center mb-3"
                  >
                    {title}
                  </Dialog.Title>

                  <div className="mt-3 mb-8">
                    <p className="text-sm font-medium text-black/60 dark:text-white/60 text-center leading-relaxed">
                      {message}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="flex-1 px-6 py-3 text-xs font-black uppercase tracking-widest text-black/60 dark:text-white/60 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all border border-black/10 dark:border-white/10"
                      onClick={onCancel}
                    >
                      {cancelLabel}
                    </button>
                    <button
                      type="button"
                      className={`flex-1 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border ${buttonClasses}`}
                      onClick={onConfirm}
                    >
                      {confirmLabel}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ConfirmDialog;
