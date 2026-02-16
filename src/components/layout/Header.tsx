import React, { useState, useEffect } from 'react';
import { useMobileMenu } from '../../context/MobileMenuContext';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
  XMarkIcon,
  Bars3Icon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

// Import logos
import logoBlu from '../../assets/images/LogoBlu.svg';
import logoBianco from '../../assets/images/LogoBianco.svg';

interface MenuItem {
  name: string;
  path: string;
}

interface MenuGroup {
  name: string;
  items: MenuItem[];
}

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const menuGroups: (MenuItem | MenuGroup)[] = [
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
  ];

  const isMenuGroup = (item: any): item is MenuGroup => 'items' in item;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    setMobileExpandedGroup(null);
  }, [location.pathname, setIsMobileMenuOpen]);

  const isHomePage = location.pathname === '/';
  const forceLightText = isHomePage && !isScrolled;

  const isActivePath = (path: string) => location.pathname === path;
  const isGroupActive = (group: MenuGroup) => group.items.some((sub) => isActivePath(sub.path));

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const activeGroup = menuGroups.find((item) => isMenuGroup(item) && isGroupActive(item));
    if (activeGroup && isMenuGroup(activeGroup)) {
      setMobileExpandedGroup(activeGroup.name);
    }
  }, [isMobileMenuOpen, location.pathname]);

  const desktopNavLinkBase =
    "relative text-[11px] font-black uppercase tracking-[0.2em] transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full after:bg-current after:origin-left after:scale-x-0 after:transition-transform after:duration-300";

  const desktopNavLinkClass = (isActive: boolean) =>
    `${desktopNavLinkBase} ${isActive ? 'after:scale-x-100' : 'hover:after:scale-x-100'} ${forceLightText
      ? isActive
        ? 'text-white'
        : 'text-white/75 hover:text-white'
      : isActive
        ? 'text-primary dark:text-primary-light'
        : 'text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white'
    }`;

  const mobileTopRowBase =
    'w-full flex items-center justify-between gap-5 py-4 px-4 transition-all duration-300';

  const mobileSubRowBase =
    'w-full flex items-center justify-between gap-5 py-3 px-4 transition-all duration-300';

  const mobileTopRowClass = (isActive: boolean) =>
    `${mobileTopRowBase} ${isActive
      ? 'text-primary dark:text-primary-light'
      : 'text-black/90 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
    }`;

  const mobileSubRowClass = (isActive: boolean) =>
    `${mobileSubRowBase} ${isActive
      ? 'bg-black/5 dark:bg-white/5 text-primary dark:text-primary-light'
      : 'text-black/80 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'
    }`;

  const mobileRowIndicatorClass = (isActive: boolean) =>
    `h-6 w-[2px] ${isActive ? 'bg-primary' : 'bg-transparent'}`;

  // Scroll Lock for Mobile Menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, [isMobileMenuOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isScrolled
      ? 'bg-gray-50/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 py-4 lg:py-5'
      : 'bg-transparent py-7 lg:py-9'
      }`}>
      <div className="container mx-auto max-w-7xl px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={(theme === 'dark' || forceLightText) ? logoBianco : logoBlu}
            alt="Scandellari"
            className="h-8 md:h-10 transition-all"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10">
          {menuGroups.map((item, index) => (
            <div key={index} className="relative group">
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
                        {item.items.map((sub, i) => (
                          <Link
                            key={i}
                            to={sub.path}
                            className={`block px-4 py-3 text-[11px] font-black uppercase tracking-widest transition-all ${isActivePath(sub.path)
                              ? 'bg-primary text-white dark:!text-black'
                              : 'text-black/80 dark:text-white/80 hover:bg-black/25 dark:hover:bg-white/15 hover:text-black dark:hover:text-white'
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
                <Link
                  to={item.path}
                  className={desktopNavLinkClass(isActivePath(item.path))}
                >
                  {item.name}
                </Link>
              )}
            </div>
          ))}

          {/* Theme & CTA */}
          <div className={`flex items-center gap-8 pl-8 border-l transition-colors ${forceLightText ? 'border-white/20' : 'border-black/10 dark:border-white/10'
            }`}>
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
              <span
                className={`absolute inset-y-0 left-0 w-1/2 transition-[transform,background-color] duration-300 ease-out ${theme === 'dark'
                  ? forceLightText
                    ? 'translate-x-full bg-white/20'
                    : 'translate-x-full bg-white/15'
                  : forceLightText
                    ? 'translate-x-0 bg-amber-400/30'
                    : 'translate-x-0 bg-amber-400/25'
                  }`}
              />
              <span className="absolute inset-0 grid grid-cols-2 pointer-events-none">
                <span className="flex items-center justify-center">
                  <SunIcon
                    className={`w-4 h-4 text-amber-600 transition-opacity ${theme === 'dark' ? 'opacity-45' : 'opacity-100'}`}
                  />
                </span>
                <span className="flex items-center justify-center">
                  <MoonIcon
                    className={`w-4 h-4 transition-opacity ${theme === 'dark'
                      ? 'text-zinc-200 opacity-100'
                      : 'text-zinc-700 opacity-80'
                      }`}
                  />
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

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden p-2 transition-all relative z-[70] ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${forceLightText ? 'text-white' : 'text-black dark:text-white'}`}
        >
          <Bars3Icon className="w-7 h-7" />
        </button>
      </div>

      {/* Mobile Menu (Full Screen Weaverly) */}
      <div className={`fixed inset-0 z-[60] ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        <div
          className={`absolute inset-y-0 right-0 w-full sm:w-[460px] bg-white dark:bg-black shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-l border-black/10 dark:border-white/10 flex flex-col transition-[transform,opacity] duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
        >
          <div className="p-6 flex items-center justify-between">
            <img
              src={theme === 'dark' ? logoBianco : logoBlu}
              alt="Scandellari"
              className="h-10 sm:h-11"
            />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
              aria-label="Chiudi menu"
            >
              <XMarkIcon className="w-7 h-7" />
            </button>
          </div>

          <nav className="flex flex-col flex-grow overflow-y-auto px-2 pb-6">
            {menuGroups.map((item, index) => (
              <div
                key={index}
                className="pt-1"
                style={{ transitionDelay: isMobileMenuOpen ? `${index * 30}ms` : '0ms' }}
              >
                {isMenuGroup(item) ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setMobileExpandedGroup((prev) => (prev === item.name ? null : item.name))
                      }
                      aria-expanded={mobileExpandedGroup === item.name}
                      aria-controls={`mobile-group-${item.name}`}
                      className={mobileTopRowClass(isGroupActive(item))}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className={mobileRowIndicatorClass(isGroupActive(item))} />
                        <span className="text-3xl font-black tracking-tight font-heading uppercase truncate">
                          {item.name}
                        </span>
                      </div>
                      <ChevronDownIcon
                        className={`w-5 h-5 transition-transform ${mobileExpandedGroup === item.name ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <div
                      id={`mobile-group-${item.name}`}
                      className={`overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out ${mobileExpandedGroup === item.name ? 'max-h-72 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-1 pointer-events-none'}`}
                    >
                      <div className="pt-2 pb-2 flex flex-col gap-1">
                        {item.items.map((sub, i) => {
                          const isActive = isActivePath(sub.path);
                          return (
                            <Link
                              key={i}
                              to={sub.path}
                              className={mobileSubRowClass(isActive)}
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <span className={mobileRowIndicatorClass(isActive)} />
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
                  (() => {
                    const isActive = isActivePath(item.path);
                    return (
                      <Link to={item.path} className={mobileTopRowClass(isActive)}>
                        <div className="flex items-center gap-4 min-w-0">
                          <span className={mobileRowIndicatorClass(isActive)} />
                          <span className="text-3xl font-black tracking-tight font-heading uppercase truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="w-5 h-5" />
                      </Link>
                    );
                  })()
                )}
              </div>
            ))}
          </nav>

          <div className="p-6 border-t border-black/10 dark:border-white/10 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/60 dark:text-white/60">
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
                <span
                  className={`absolute inset-y-0 left-0 w-1/2 transition-[transform,background-color] duration-300 ease-out ${theme === 'dark' ? 'translate-x-full bg-white/15' : 'translate-x-0 bg-amber-400/25'}`}
                />
                <span className="absolute inset-0 grid grid-cols-2 pointer-events-none">
                  <span className="flex items-center justify-center gap-2 px-4">
                    <SunIcon className={`w-4 h-4 text-amber-600 transition-opacity ${theme === 'dark' ? 'opacity-45' : 'opacity-100'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${theme === 'dark' ? 'opacity-60 text-black/70 dark:text-white/70' : 'opacity-100 text-black dark:text-white'}`}>
                      Chiaro
                    </span>
                  </span>
                  <span className="flex items-center justify-center gap-2 px-4">
                    <MoonIcon className={`w-4 h-4 transition-opacity ${theme === 'dark' ? 'text-zinc-200 opacity-100' : 'text-zinc-700 opacity-80'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest transition-opacity ${theme === 'dark' ? 'opacity-100 text-black dark:text-white' : 'opacity-60 text-black/70 dark:text-white/70'}`}>
                      Scuro
                    </span>
                  </span>
                </span>
              </button>
            </div>

            <Link
              to="/contatti"
              className="w-full py-5 bg-black dark:bg-white text-white dark:text-black text-xs font-black uppercase tracking-[0.35em] text-center border border-black/10 dark:border-white/10 hover:bg-primary transition-colors"
            >
              Contatti
            </Link>

            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-black/50 dark:text-white/50">
                © {new Date().getFullYear()} Scandellari
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
