import { Dialog, DialogPanel } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { XMarkIcon, SunIcon, MoonIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { metaTextClasses, primaryTextClasses } from '../utils/ColorStyles';
import logoBlu from '../../assets/images/LogoBlu.svg';
import logoBianco from '../../assets/images/LogoBianco.svg';
import { isMenuGroup, menuEntries, type MenuGroup } from './navigation';

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

type MobileGroupProps = {
  group: MenuGroup;
  index: number;
  isActivePath: (path: string) => boolean;
  onClose: () => void;
};

function MobilePrimaryLink({ active, index, label, onClick, to }: MobilePrimaryLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.35rem] px-4 py-4 transition-colors ${
        active
          ? 'bg-primary/[0.07] text-primary dark:bg-primary/[0.14] dark:text-primary-light'
          : 'hover:bg-black/[0.035] hover:text-primary dark:hover:bg-white/[0.05] dark:hover:text-white'
      }`}
    >
      <span className={`pb-1 text-[10px] font-black uppercase tracking-[0.3em] tabular-nums ${active ? 'text-primary/80 dark:text-primary-light/80' : metaTextClasses}`}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className={`text-[1.9rem] font-black leading-none tracking-[-0.04em] font-heading uppercase sm:text-4xl ${active ? '' : primaryTextClasses}`}>
        {label}
      </span>
      <ArrowRightIcon className={`h-4 w-4 shrink-0 transition-transform duration-300 ${active ? 'translate-x-0 text-primary dark:text-primary-light' : `${metaTextClasses} group-hover:translate-x-1 group-hover:text-primary dark:group-hover:text-primary-light`}`} />
    </Link>
  );
}

function MobileGroup({ group, index, isActivePath, onClose }: MobileGroupProps) {
  const hasActiveChild = group.items.some((item) => isActivePath(item.path));

  return (
    <div className="space-y-2">
      <div
        className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.35rem] px-4 py-4 ${
          hasActiveChild
            ? 'bg-primary/[0.05] dark:bg-primary/[0.1]'
            : 'bg-black/[0.02] dark:bg-white/[0.025]'
        }`}
      >
        <span className={`pb-1 text-[10px] font-black uppercase tracking-[0.3em] tabular-nums ${hasActiveChild ? 'text-primary/80 dark:text-primary-light/80' : metaTextClasses}`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={`text-[1.9rem] font-black leading-none tracking-[-0.04em] font-heading uppercase sm:text-4xl ${hasActiveChild ? 'text-primary dark:text-primary-light' : primaryTextClasses}`}>
          {group.name}
        </span>
        <span className={`text-[11px] font-black uppercase tracking-[0.28em] ${hasActiveChild ? 'text-primary/70 dark:text-primary-light/70' : metaTextClasses}`}>
          02
        </span>
      </div>

      <div className="relative ml-7 space-y-1.5 pl-6 before:absolute before:bottom-3 before:left-0 before:top-2 before:w-px before:bg-gradient-to-b before:from-primary/70 before:via-primary/25 before:to-transparent dark:before:from-primary-lighter/80 dark:before:via-primary-light/30">
        {group.items.map((item) => {
          const active = isActivePath(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`group relative grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
                active
                  ? 'bg-primary/[0.07] text-primary dark:bg-primary/[0.14] dark:text-primary-light'
                  : 'hover:bg-black/[0.03] hover:text-primary dark:hover:bg-white/[0.05] dark:hover:text-white'
              }`}
            >
              <span className="absolute -left-6 top-1/2 h-px w-3 -translate-y-1/2 bg-primary/45 dark:bg-primary-light/45" />
              <span className={`text-base font-black tracking-tight uppercase sm:text-lg ${active ? '' : primaryTextClasses}`}>
                {item.name}
              </span>
              <ArrowRightIcon className={`h-4 w-4 shrink-0 transition-transform duration-300 ${active ? 'translate-x-0 text-primary dark:text-primary-light' : `${metaTextClasses} group-hover:translate-x-1 group-hover:text-primary dark:group-hover:text-primary-light`}`} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ThemeSwitch({ theme, toggleTheme }: Pick<MobileMenuPanelProps, 'theme' | 'toggleTheme'>) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`min-w-[3rem] text-[9px] font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>
        Tema
      </span>
      <button
        onClick={toggleTheme}
        type="button"
        role="switch"
        aria-checked={theme === 'dark'}
        className="relative flex h-11 w-[9.5rem] shrink-0 items-center rounded-full border border-black/10 bg-black/[0.04] p-1 text-left transition-colors hover:bg-black/[0.06] focus:outline-none dark:border-white/8 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
      >
        <span className="sr-only">Cambia tema</span>
        <span
          className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full border will-change-transform transition-transform duration-300 ease-out transform-gpu motion-reduce:transition-none ${
            theme === 'dark'
              ? 'translate-x-full border-primary-light/35 bg-primary/18 shadow-[0_0_0_1px_rgba(96,165,250,0.12),0_10px_24px_rgba(37,99,235,0.18)]'
              : 'translate-x-0 border-amber-500/20 bg-amber-400/25 shadow-[0_0_0_1px_rgba(251,191,36,0.1)]'
          }`}
        />
        <span className="grid h-full w-full grid-cols-2 pointer-events-none">
          <span className="relative z-10 flex items-center justify-center gap-1.5 px-2">
            <SunIcon className={`h-3.5 w-3.5 transition-opacity ${theme === 'dark' ? 'opacity-45 text-amber-600' : 'opacity-100 text-amber-600'}`} />
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? metaTextClasses : 'text-black dark:text-white'}`}>
              Chiaro
            </span>
          </span>
          <span className="relative z-10 flex items-center justify-center gap-1.5 px-2">
            <MoonIcon className={`h-3.5 w-3.5 transition-opacity ${theme === 'dark' ? 'opacity-100 text-primary-lighter' : 'opacity-70 text-zinc-700'}`} />
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white' : metaTextClasses}`}>
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

                <div className="relative flex items-center justify-between border-b border-black/10 px-4 py-4 dark:border-white/6">
                  <div className="min-w-0">
                    <p className={`mb-1.5 text-[9px] font-black uppercase tracking-[0.34em] ${metaTextClasses}`}>
                      Menu
                    </p>
                    <img
                      src={theme === 'dark' ? logoBianco : logoBlu}
                      alt="Scandellari Giacinto s.n.c."
                      width="160"
                      height="44"
                      className="h-8 w-auto sm:h-10"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Chiudi menu"
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/90 transition-colors hover:border-primary hover:text-primary dark:border-white/5 dark:bg-white/[0.04] dark:hover:bg-primary/10 ${primaryTextClasses}`}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div
                  className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [touch-action:pan-y] [-webkit-overflow-scrolling:touch]"
                  data-lenis-prevent
                  data-lenis-prevent-touch
                  data-lenis-prevent-wheel
                >
                  <nav className="flex min-h-full flex-col px-4 pb-6 pt-4">
                    <div className="max-w-3xl">
                      <div className="space-y-2">
                        {menuEntries.map((item, index) =>
                          isMenuGroup(item) ? (
                            <MobileGroup
                              key={item.name}
                              group={item}
                              index={index}
                              isActivePath={isActivePath}
                              onClose={onClose}
                            />
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
                        <MobilePrimaryLink
                          active={isActivePath('/contatti')}
                          index={menuEntries.length}
                          label="Contatti"
                          onClick={onClose}
                          to="/contatti"
                        />
                      </div>
                    </div>
                  </nav>
                </div>

                <div className="relative border-t border-black/10 px-4 py-4 dark:border-white/6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <ThemeSwitch theme={theme} toggleTheme={toggleTheme} />
                    </div>

                    <span className={`shrink-0 text-[8px] font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>
                      © {new Date().getFullYear()}
                    </span>
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
