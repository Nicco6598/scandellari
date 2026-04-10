import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useMobileMenu } from '../../context/MobileMenuContext';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { createPortal } from 'react-dom';
import {
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useMagneticHover } from '../../hooks/useMagneticHover';
import {
  inverseMetaTextClasses,
  metaTextClasses,
} from '../utils/ColorStyles';

import logoBlu from '../../assets/images/LogoBlu.svg';
import logoBianco from '../../assets/images/LogoBianco.svg';

type MenuItem = {
  name: string;
  path: string;
};

type MenuGroup = {
  name: string;
  items: MenuItem[];
};

type MenuEntry = MenuItem | MenuGroup;

type MobileMenuPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  theme: string;
  toggleTheme: () => void;
  location: ReturnType<typeof useLocation>;
};

type MagneticLinkProps = {
  children: ReactNode;
  to: string;
  active: boolean;
  forceLightText: boolean;
};

const menuGroups = [
  { name: 'Competenze', path: '/competenze' },
  { name: 'Progetti', path: '/progetti' },
  { name: 'Certificazioni', path: '/certificazioni' },
  {
    name: 'Azienda',
    items: [
      { name: 'Chi Siamo', path: '/chi-siamo' },
      { name: 'Carriera', path: '/lavora-con-noi' },
    ]
  },
] satisfies MenuEntry[];

const isMenuGroup = (item: MenuEntry): item is MenuGroup => 'items' in item;

function MobileMenuPanel({ isOpen, onClose, theme, toggleTheme, location }: MobileMenuPanelProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const isActivePath = (path: string) => location.pathname === path;
  const isGroupActive = (group: MenuGroup) => group.items.some(s => isActivePath(s.path));

  useEffect(() => {
    document.documentElement.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const active = menuGroups.find(
      (item): item is MenuGroup => isMenuGroup(item) && isGroupActive(item)
    );
    if (active && isMenuGroup(active)) setExpandedGroup(active.name);
  }, [isOpen]);

  const mobileTopRowBase = 'w-full flex items-center justify-between gap-5 py-4 px-4 transition-colors duration-200';
  const mobileSubRowBase = 'w-full flex items-center justify-between gap-5 py-3 px-4 transition-colors duration-200';

  const mobileTopRowClass = (active: boolean) =>
    `${mobileTopRowBase} ${active ? 'text-primary dark:text-primary-light' : `${metaTextClasses} hover:bg-black/5 hover:text-primary dark:hover:bg-white/5 dark:hover:text-white`}`;

  const mobileSubRowClass = (active: boolean) =>
    `${mobileSubRowBase} ${active ? 'bg-black/5 dark:bg-white/5 text-primary dark:text-primary-light' : `${metaTextClasses} hover:bg-black/5 hover:text-primary dark:hover:bg-white/5 dark:hover:text-white`}`;

  const indicatorClass = (active: boolean) =>
    `h-6 w-[2px] shrink-0 ${active ? 'bg-primary' : 'bg-transparent'}`;

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200]"
      role="dialog"
      aria-modal="true"
      aria-label="Menu di navigazione"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
      />

      <div
        className="absolute inset-y-0 right-0 w-full sm:w-[460px] bg-white dark:bg-black shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-l border-black/10 dark:border-white/10 flex flex-col"
        style={{ transition: 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)' }}
      >
        <div className="p-6 flex items-center justify-between shrink-0">
          <img
            src={theme === 'dark' ? logoBianco : logoBlu}
            alt="Scandellari Giacinto s.n.c."
            width="160"
            height="44"
            className="h-10 sm:h-11 w-auto"
          />
          <button
            onClick={onClose}
            className={`p-2 hover:text-black dark:hover:text-white transition-colors ${metaTextClasses}`}
            aria-label="Chiudi menu"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>

        <nav className="flex flex-col flex-grow overflow-y-auto px-2 pb-6">
          {menuGroups.map((item) => (
            <div key={item.name} className="pt-1">
              {isMenuGroup(item) ? (
                <>
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(prev => prev === item.name ? null : item.name)}
                    aria-expanded={expandedGroup === item.name}
                    className={mobileTopRowClass(isGroupActive(item))}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={indicatorClass(isGroupActive(item))} />
                      <span className="text-3xl font-black tracking-tight font-heading uppercase truncate">
                        {item.name}
                      </span>
                    </div>
                    <ChevronDownIcon
                      className={`w-5 h-5 transition-transform duration-300 ${expandedGroup === item.name ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-[max-height,opacity] duration-300 ease-out"
                    style={{
                      maxHeight: expandedGroup === item.name ? '288px' : '0px',
                      opacity: expandedGroup === item.name ? 1 : 0,
                    }}
                  >
                    <div className="pt-2 pb-2 flex flex-col gap-1">
                      {item.items.map((sub) => {
                        const active = isActivePath(sub.path);
                        return (
                          <Link key={sub.path} to={sub.path} onClick={onClose} className={mobileSubRowClass(active)}>
                            <div className="flex items-center gap-4 min-w-0">
                              <span className={indicatorClass(active)} />
                              <span className="text-2xl font-black tracking-tight font-heading uppercase truncate">
                                {sub.name}
                              </span>
                            </div>
                            <span className="w-5 h-5" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <Link to={item.path} onClick={onClose} className={mobileTopRowClass(isActivePath(item.path))}>
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={indicatorClass(isActivePath(item.path))} />
                    <span className="text-3xl font-black tracking-tight font-heading uppercase truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="w-5 h-5" />
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-black/10 dark:border-white/10 flex flex-col gap-6 shrink-0">
          <div className="flex flex-col gap-3">
            <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${metaTextClasses}`}>
              Aspetto Sito
            </span>
            <button
              onClick={toggleTheme}
              type="button"
              role="switch"
              aria-checked={theme === 'dark'}
              className="relative h-11 w-full border overflow-hidden transition-colors focus:outline-none border-black/20 dark:border-white/20 bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15"
            >
              <span className="sr-only">Cambia tema</span>
              <span className={`absolute inset-y-0 left-0 w-1/2 transition-[transform,background-color] duration-300 ease-out ${theme === 'dark' ? 'translate-x-full bg-white/15' : 'translate-x-0 bg-amber-400/25'}`} />
              <span className="absolute inset-0 grid grid-cols-2 pointer-events-none">
                <span className="flex items-center justify-center gap-2 px-4">
                  <SunIcon className={`w-4 h-4 text-amber-600 transition-opacity ${theme === 'dark' ? 'opacity-45' : 'opacity-100'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${theme === 'dark' ? `opacity-60 ${metaTextClasses}` : 'opacity-100 text-black dark:text-white'}`}>Chiaro</span>
                </span>
                <span className="flex items-center justify-center gap-2 px-4">
                  <MoonIcon className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'text-zinc-200 opacity-100' : 'text-zinc-700 opacity-80'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${theme === 'dark' ? 'opacity-100 text-black dark:text-white' : `opacity-60 ${metaTextClasses}`}`}>Scuro</span>
                </span>
              </span>
            </button>
          </div>

          <Link
            to="/contatti"
            onClick={onClose}
            className="w-full py-5 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.35em] text-center hover:bg-primary transition-colors"
          >
            Contatti
          </Link>

          <span className={`text-[9px] font-black uppercase tracking-widest ${metaTextClasses}`}>
            © {new Date().getFullYear()} Scandellari
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

function MagneticLink({ children, to, active, forceLightText }: MagneticLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  useMagneticHover(linkRef, { xFactor: 0.15, yFactor: 0.15 });

  const baseClass = "relative text-[11px] font-black uppercase tracking-[0.2em] transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-current after:origin-left after:scale-x-0 after:transition-transform after:duration-300";
  const activeClass = active ? 'after:scale-x-100' : 'hover:after:scale-x-100';
  const colorClass = forceLightText
    ? active ? 'text-white' : `${inverseMetaTextClasses} hover:text-white`
    : active ? 'text-primary dark:text-primary-light' : `${metaTextClasses} hover:text-primary dark:hover:text-white`;

  return (
    <Link ref={linkRef} to={to} className={`${baseClass} ${activeClass} ${colorClass}`}>
      {children}
    </Link>
  );
}

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
      
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY.current) {
          setIsHidden(true);
        } else {
          setIsHidden(false);
        }
      } else {
        setIsHidden(false);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname, setIsMobileMenuOpen]);

  const isHomePage = location.pathname === '/';
  const forceLightText = isHomePage && !isScrolled;

  const isActivePath = (path: string) => location.pathname === path;
  const isGroupActive = (group: MenuGroup) => group.items.some(s => isActivePath(s.path));

  const desktopNavLinkBase =
    "relative text-[11px] font-black uppercase tracking-[0.2em] transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-current after:origin-left after:scale-x-0 after:transition-transform after:duration-300";

  const desktopNavLinkClass = (active: boolean) =>
    `${desktopNavLinkBase} ${active ? 'after:scale-x-100' : 'hover:after:scale-x-100'} ${forceLightText
      ? active ? 'text-white' : `${inverseMetaTextClasses} hover:text-white`
      : active ? 'text-primary dark:text-primary-light' : `${metaTextClasses} hover:text-primary dark:hover:text-white`
    }`;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isHidden ? '-translate-y-full' : 'translate-y-0'} ${isScrolled
        ? 'bg-stone-50/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 py-4 lg:py-5'
        : 'bg-transparent py-7 lg:py-9'
      }`}>
        <div className="container mx-auto max-w-7xl px-6 flex items-center justify-between">
          <Link to="/" aria-label="Home - Scandellari Giacinto s.n.c." className="flex items-center">
            <img
              src={(theme === 'dark' || forceLightText) ? logoBianco : logoBlu}
              alt="Scandellari Giacinto s.n.c."
              width="160"
              height="40"
              className="h-8 md:h-10 w-auto transition-all"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-10">
            {menuGroups.map((item) => (
              <div key={item.name} className="relative group">
                {isMenuGroup(item) ? (
                  <>
                    <button
                      className={`flex items-center gap-1 ${desktopNavLinkClass(isGroupActive(item))}`}
                      onMouseEnter={() => setActiveDropdown(item.name)}
                    >
                      {item.name}
                      <ChevronDownIcon className="w-2.5 h-2.5 opacity-50" />
                    </button>
                    {activeDropdown === item.name && (
                      <div
                        onMouseLeave={() => setActiveDropdown(null)}
                        className="absolute top-full left-0 pt-6 w-56"
                      >
                        <div className="bg-white dark:bg-black border border-black/5 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden p-2">
                          {item.items.map((sub) => (
                            <Link
                              key={sub.path}
                              to={sub.path}
                              className={`block px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${isActivePath(sub.path)
                                ? 'bg-primary text-white'
                                : `${metaTextClasses} hover:bg-black/5 hover:text-primary dark:hover:bg-white/10 dark:hover:text-primary-light`
                              }`}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <MagneticLink
                    to={item.path}
                    active={isActivePath(item.path)}
                    forceLightText={forceLightText}
                  >
                    {item.name}
                  </MagneticLink>
                )}
              </div>
            ))}

            {/* Theme & CTA */}
            <div className={`flex items-center gap-8 pl-8 border-l transition-colors ${forceLightText ? 'border-white/20' : 'border-black/10 dark:border-white/10'}`}>
              <button
                onClick={toggleTheme}
                type="button"
                role="switch"
                aria-checked={theme === 'dark'}
                className={`relative h-9 w-[72px] border overflow-hidden transition-colors focus:outline-none ${forceLightText
                  ? 'border-white/30 bg-white/15 hover:bg-white/20'
                  : 'border-black/20 dark:border-white/20 bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15'
                }`}
              >
                <span className="sr-only">Cambia tema</span>
                <span className={`absolute inset-y-0 left-0 w-1/2 transition-[transform,background-color] duration-300 ease-out ${theme === 'dark'
                  ? forceLightText ? 'translate-x-full bg-white/20' : 'translate-x-full bg-white/15'
                  : forceLightText ? 'translate-x-0 bg-amber-400/30' : 'translate-x-0 bg-amber-400/25'
                }`} />
                <span className="absolute inset-0 grid grid-cols-2 pointer-events-none">
                  <span className="flex items-center justify-center">
                    <SunIcon className={`w-4 h-4 text-amber-600 transition-opacity ${theme === 'dark' ? 'opacity-45' : 'opacity-100'}`} />
                  </span>
                  <span className="flex items-center justify-center">
                    <MoonIcon className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'text-zinc-200 opacity-100' : 'text-zinc-700 opacity-80'}`} />
                  </span>
                </span>
              </button>
              <Link
                to="/contatti"
                className={`px-8 py-3 text-[11px] font-black uppercase tracking-[0.3em] transition-all ${forceLightText
                  ? 'bg-white text-black hover:bg-primary hover:text-white'
                  : 'bg-black dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary hover:text-white'
                }`}
              >
                Contatti
              </Link>
            </div>
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`lg:hidden p-2 transition-colors ${forceLightText ? 'text-white' : 'text-black dark:text-white'}`}
            aria-label="Apri menu"
          >
            <Bars3Icon className="w-7 h-7" />
          </button>
        </div>
      </header>

      <MobileMenuPanel
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        location={location}
      />
    </>
  );
}

export default Header;
