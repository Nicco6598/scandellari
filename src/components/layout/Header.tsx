import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useMobileMenu } from '../../context/MobileMenuContext';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
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
import MobileMenuPanel from './MobileMenuPanel';
import { isMenuGroup, menuEntries, type MenuGroup } from './navigation';

import logoBlu from '../../assets/images/LogoBlu.svg';
import logoBianco from '../../assets/images/LogoBianco.svg';

type MagneticLinkProps = {
  children: ReactNode;
  to: string;
  active: boolean;
  forceLightText: boolean;
};

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
            {menuEntries.map((item) => (
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
                className={`relative flex h-10 w-[88px] items-center rounded-full border p-1 transition-colors focus:outline-none ${forceLightText
                  ? 'border-white/30 bg-white/15 hover:bg-white/20'
                  : 'border-black/20 dark:border-white/20 bg-black/10 dark:bg-white/10 hover:bg-black/15 dark:hover:bg-white/15'
                }`}
              >
                <span className="sr-only">Cambia tema</span>
                <span className={`pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full will-change-transform transition-transform duration-300 ease-out transform-gpu motion-reduce:transition-none ${theme === 'dark'
                  ? forceLightText ? 'translate-x-full bg-white/20 shadow-[0_8px_20px_rgba(255,255,255,0.08)]' : 'translate-x-full bg-white/15 shadow-[0_8px_20px_rgba(255,255,255,0.06)]'
                  : forceLightText ? 'translate-x-0 bg-amber-400/30 shadow-[0_8px_20px_rgba(251,191,36,0.18)]' : 'translate-x-0 bg-amber-400/25 shadow-[0_8px_20px_rgba(251,191,36,0.16)]'
                }`} />
                <span className="grid h-full w-full grid-cols-2 pointer-events-none">
                  <span className="relative z-10 flex items-center justify-center">
                    <SunIcon className={`h-4 w-4 text-amber-600 transition-opacity ${theme === 'dark' ? 'opacity-45' : 'opacity-100'}`} />
                  </span>
                  <span className="relative z-10 flex items-center justify-center">
                    <MoonIcon className={`h-4 w-4 transition-opacity ${theme === 'dark' ? 'text-zinc-200 opacity-100' : 'text-zinc-700 opacity-80'}`} />
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
        pathname={location.pathname}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </>
  );
}

export default Header;
