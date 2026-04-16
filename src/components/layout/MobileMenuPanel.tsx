import { Dialog, DialogPanel } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { XMarkIcon, SunIcon, MoonIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { metaTextClasses, primaryTextClasses } from '../utils/ColorStyles';
import logoBlu from '../../assets/images/LogoBlu.svg';
import logoBianco from '../../assets/images/LogoBianco.svg';
import { isMenuGroup, menuEntries } from './navigation';

const MENU_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type MobileMenuPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

type MobilePrimaryLinkProps = {
  active: boolean;
  index: number;
  label: string;
  onClick: () => void;
  to: string;
};

type MobileSecondaryLinkProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  to: string;
};

function MobilePrimaryLink({ active, index, label, onClick, to }: MobilePrimaryLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group grid grid-cols-[auto_1fr_auto] items-end gap-4 border-b border-black/8 py-5 transition-colors dark:border-white/5 ${
        active
          ? 'text-primary dark:text-primary-light'
          : 'hover:text-primary dark:hover:text-white'
      }`}
    >
      <span className={`pb-1 text-[10px] font-black uppercase tracking-[0.3em] tabular-nums ${active ? 'text-primary/80 dark:text-primary-light/80' : metaTextClasses}`}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className={`text-4xl font-black tracking-[-0.04em] font-heading uppercase sm:text-5xl ${active ? '' : primaryTextClasses}`}>
        {label}
      </span>
      <ArrowRightIcon className={`h-5 w-5 shrink-0 transition-transform duration-300 ${active ? 'translate-x-0 text-primary dark:text-primary-light' : `${metaTextClasses} group-hover:translate-x-1 group-hover:text-primary dark:group-hover:text-primary-light`}`} />
    </Link>
  );
}

function MobileSecondaryLink({ active, label, onClick, to }: MobileSecondaryLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group grid grid-cols-[1fr_auto] items-center gap-4 border-b px-5 py-4 transition-colors ${
        active
          ? 'border-primary/15 bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary-light'
          : 'border-black/8 hover:bg-black/[0.03] hover:text-primary dark:border-white/5 dark:hover:bg-white/5 dark:hover:text-white'
      }`}
    >
      <span className={`text-xl font-black tracking-tight uppercase sm:text-2xl ${active ? '' : primaryTextClasses}`}>
        {label}
      </span>
      <ArrowRightIcon className={`h-4 w-4 shrink-0 transition-transform duration-300 ${active ? 'text-primary dark:text-primary-light' : `${metaTextClasses} group-hover:translate-x-1 group-hover:text-primary dark:group-hover:text-primary-light`}`} />
    </Link>
  );
}

function ThemeSwitch({ theme, toggleTheme }: Pick<MobileMenuPanelProps, 'theme' | 'toggleTheme'>) {
  return (
    <div className="flex flex-col gap-3">
      <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>
        Aspetto Sito
      </span>
      <button
        onClick={toggleTheme}
        type="button"
        role="switch"
        aria-checked={theme === 'dark'}
        className="relative h-12 w-full overflow-hidden border border-black/10 bg-black/[0.04] transition-colors hover:bg-black/[0.06] focus:outline-none dark:border-white/8 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
      >
        <span className="sr-only">Cambia tema</span>
        <span
          className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] border transition-transform duration-300 ease-out ${
            theme === 'dark'
              ? 'translate-x-full border-primary-light/35 bg-primary/18 shadow-[0_0_0_1px_rgba(96,165,250,0.12),0_10px_24px_rgba(37,99,235,0.18)]'
              : 'translate-x-0 border-amber-500/20 bg-amber-400/25 shadow-[0_0_0_1px_rgba(251,191,36,0.1)]'
          }`}
        />
        <span className="absolute inset-0 grid grid-cols-2">
          <span className="flex items-center justify-center gap-2 px-4">
            <SunIcon className={`h-4 w-4 transition-opacity ${theme === 'dark' ? 'opacity-45 text-amber-600' : 'opacity-100 text-amber-600'}`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.24em] ${theme === 'dark' ? metaTextClasses : 'text-black dark:text-white'}`}>
              Chiaro
            </span>
          </span>
          <span className="flex items-center justify-center gap-2 px-4">
            <MoonIcon className={`h-4 w-4 transition-opacity ${theme === 'dark' ? 'opacity-100 text-primary-lighter' : 'opacity-70 text-zinc-700'}`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-white' : metaTextClasses}`}>
              Scuro
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}

function MobileMenuPanel({ isOpen, onClose, pathname, theme, toggleTheme }: MobileMenuPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  useBodyScrollLock(isOpen);

  const overlayTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: MENU_EASE };

  const panelTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.34, ease: MENU_EASE };

  const isActivePath = (path: string) => pathname === path;

  return (
    <AnimatePresence>
      {isOpen ? (
        <Dialog static open={isOpen} onClose={onClose} className="fixed inset-0 z-[200] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
          />

          <div className="absolute inset-0 flex justify-end">
            <motion.div
              initial={shouldReduceMotion ? false : { x: '100%' }}
              animate={{ x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
              transition={panelTransition}
              className="h-full w-full"
            >
              <DialogPanel className="relative flex h-full flex-col overflow-hidden bg-stone-50 shadow-[0_24px_80px_rgba(0,0,0,0.28)] dark:bg-[#04070d]">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.04),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(96,165,250,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.025),transparent_18%)]" />

                <div className="relative flex items-center justify-between border-b border-black/10 px-5 py-5 dark:border-white/6">
                  <div className="min-w-0">
                    <p className={`mb-2 text-[10px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                      Menu
                    </p>
                    <img
                      src={theme === 'dark' ? logoBianco : logoBlu}
                      alt="Scandellari Giacinto s.n.c."
                      width="160"
                      height="44"
                      className="h-9 w-auto sm:h-10"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Chiudi menu"
                    className={`flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white/90 transition-colors hover:border-primary hover:text-primary dark:border-white/5 dark:bg-white/[0.04] dark:hover:bg-primary/10 ${primaryTextClasses}`}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div
                  className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [touch-action:pan-y] [-webkit-overflow-scrolling:touch]"
                  data-lenis-prevent
                  data-lenis-prevent-touch
                  data-lenis-prevent-wheel
                >
                  <nav className="flex min-h-full flex-col px-5 pb-8 pt-6">
                    <div className="max-w-3xl">
                      <div className="mb-5">
                        <span className={`text-[10px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                          Navigazione principale
                        </span>
                      </div>

                      <div>
                        {menuEntries.map((item, index) =>
                          isMenuGroup(item) ? (
                            <div key={item.name} className="border-b border-black/8 py-5 dark:border-white/5">
                              <div className="mb-4 flex items-end gap-4">
                                <span className={`pb-1 text-[10px] font-black uppercase tracking-[0.3em] tabular-nums ${metaTextClasses}`}>
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <span className={`text-4xl font-black tracking-[-0.04em] font-heading uppercase sm:text-5xl ${primaryTextClasses}`}>
                                  {item.name}
                                </span>
                              </div>

                              <div className="space-y-1 pl-8 sm:pl-10">
                                {item.items.map((sub) => (
                                  <MobileSecondaryLink
                                    key={sub.path}
                                    active={isActivePath(sub.path)}
                                    label={sub.name}
                                    onClick={onClose}
                                    to={sub.path}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <MobilePrimaryLink
                              key={item.path}
                              active={isActivePath(item.path)}
                              index={index}
                              label={item.name}
                              onClick={onClose}
                              to={item.path}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </nav>
                </div>

                <div className="relative border-t border-black/10 px-5 py-5 dark:border-white/6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="w-full max-w-sm">
                      <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
                    </div>

                    <div className="flex flex-col gap-4 md:items-end">
                      <Link
                        to="/contatti"
                        onClick={onClose}
                        className="group inline-flex items-center justify-between gap-4 bg-black px-5 py-4 text-[11px] font-black uppercase tracking-[0.32em] text-white transition-colors hover:bg-primary dark:bg-primary/90 dark:text-white dark:hover:bg-primary-light"
                      >
                        <span>Contatti</span>
                        <ArrowRightIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>

                      <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>
                        © {new Date().getFullYear()} Scandellari
                      </span>
                    </div>
                  </div>
                </div>
              </DialogPanel>
            </motion.div>
          </div>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
}

export default MobileMenuPanel;
