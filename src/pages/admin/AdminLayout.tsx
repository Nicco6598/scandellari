// src/pages/admin/AdminLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../supabase/auth';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { preventDoubleTapZoom } from '../../utils/mobileUtils';
import { logger } from '../../utils/logger';

// --- Icon Components ---
const DashboardIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ProjectIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const SkillIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const OfferIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const ExternalLinkIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>;
const LogoutIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const SunIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const MoonIcon = () => <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
const MenuIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>;

// Interface definitions
interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = "Admin Panel" }) => {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Previeni il double-tap zoom su mobile
  useEffect(() => {
    preventDoubleTapZoom();
  }, []);

  // Close sidebar and user menu on route change
  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Scroll lock for mobile sidebar
  useEffect(() => {
    if (sidebarOpen) {
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
  }, [sidebarOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuRef]);

  // Menu items definition
  const menuItems: MenuItem[] = [
    { icon: <DashboardIcon />, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: <ProjectIcon />, label: 'Progetti', path: '/admin/progetti' },
    { icon: <SkillIcon />, label: 'Competenze', path: '/admin/competenze' },
    { icon: <OfferIcon />, label: 'Offerte di Lavoro', path: '/admin/offerte-lavoro' }
  ];

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/admin/login');
    } catch (error) {
      logger.error('Errore durante il logout', error);
    }
  };

  // Check if a menu item is active
  const isActive = (path: string) => {
    if (path === '/admin/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Get user initials for avatar
  const getUserInitials = (): string => {
    const email = currentUser?.email;
    if (!email) return 'AD';

    const parts = email.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0].length >= 2) return parts[0].substring(0, 2).toUpperCase();
    if (parts.length === 1 && parts[0].length === 1) return parts[0].toUpperCase();

    return email[0].toUpperCase();
  };

  // --- Sidebar Content ---
  const SidebarContent = ({ isMobile = false }) => (
    <div className={`flex flex-col ${isMobile ? 'flex-1 min-h-0' : 'h-full'}`}>
      {/* Sidebar Header */}
      <div className="p-6 border-b border-black/5 dark:border-white/5">
        <Link to="/admin/dashboard" className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-black/60 dark:text-white/60 block mb-1">Admin</span>
            <span className="text-xl font-black uppercase tracking-tight text-black dark:text-white">Scandellari</span>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 transition-all text-xs font-black uppercase tracking-widest border ${isActive(item.path)
                ? 'bg-primary text-white dark:text-black border-primary dark:bg-primary-700 dark:border-primary-700'
                : 'text-black/80 dark:text-white/80 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black border-black/5 dark:border-white/5'
                }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Sidebar Footer with User Info */}
      <div className="p-4 border-t border-black/5 dark:border-white/5 mt-auto">
        <div className="border border-black/5 dark:border-white/5 p-4 mb-3">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 font-black text-xs mr-3">
              <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-fuchsia-700 dark:from-orange-400 dark:via-amber-300 dark:to-fuchsia-400 text-transparent bg-clip-text animate-hue">
                {getUserInitials()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-wider truncate bg-gradient-to-r from-orange-700 via-amber-600 to-fuchsia-700 dark:from-orange-400 dark:via-amber-300 dark:to-fuchsia-400 text-transparent bg-clip-text animate-hue">
                {currentUser?.email?.split('@')[0] || 'Admin'}
              </p>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/80 dark:text-white/80">
                Amministratore
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all border border-black/5 dark:border-white/5"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              <span className="ml-2">Tema: {theme === 'dark' ? 'Chiaro' : 'Scuro'}</span>
            </button>
            <Link
              to="/"
              target="_blank"
              className="flex w-full items-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all border border-black/5 dark:border-white/5"
            >
              <ExternalLinkIcon /> <span className="ml-2">Sito Pubblico</span>
            </Link>
            <button
              onClick={() => setConfirmLogout(true)}
              className="flex w-full items-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-600 dark:hover:text-black hover:text-white transition-all border border-red-600/20 dark:border-red-400/20"
            >
              <LogoutIcon /> <span className="ml-2">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30 bg-white dark:bg-black border-r border-black/5 dark:border-white/5">
        <SidebarContent isMobile={false} />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <MenuIcon />
            </button>
            <h1 className="text-xs font-black uppercase tracking-[0.3em] text-black dark:text-white">{title}</h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-9 h-9 flex items-center justify-center bg-black/5 dark:bg-white/5 font-black text-xs"
              >
                <span className="bg-gradient-to-r from-orange-700 via-amber-600 to-fuchsia-700 dark:from-orange-400 dark:via-amber-300 dark:to-fuchsia-400 text-transparent bg-clip-text animate-hue">
                  {getUserInitials()}
                </span>
              </button>

              <div
                className={`absolute right-0 mt-2 w-56 bg-white dark:bg-black border border-black/5 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 transition-all duration-150 origin-top-right ${
                  userMenuOpen
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                }`}
              >
                <div className="p-3 border-b border-black/5 dark:border-white/5">
                  <p className="text-xs font-black uppercase tracking-wider truncate bg-gradient-to-r from-orange-700 via-amber-600 to-fuchsia-700 dark:from-orange-400 dark:via-amber-300 dark:to-fuchsia-400 text-transparent bg-clip-text animate-hue">
                    {currentUser?.email || 'admin@example.com'}
                  </p>
                </div>
                <div className="p-2">
                  <Link
                    to="/"
                    target="_blank"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black/70 dark:text-white/70 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black transition-all"
                  >
                    <ExternalLinkIcon /> <span className="ml-2">Sito Pubblico</span>
                  </Link>
                </div>
                <div className="p-2 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={() => { setUserMenuOpen(false); setConfirmLogout(true); }}
                    className="flex w-full items-center px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <LogoutIcon /> <span className="ml-2">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-0 lg:p-0">
          {children}
        </main>

        {/* Footer */}
        <footer className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-black/50 dark:text-white/40 border-t border-black/5 dark:border-white/5 mt-auto">
          © {new Date().getFullYear()} Scandellari Admin
        </footer>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden bg-white dark:bg-black min-h-screen overflow-hidden transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-black/5 dark:border-white/5 flex-shrink-0">
            <span className="text-xl font-black uppercase tracking-tight text-black dark:text-white">Menu</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
          <SidebarContent isMobile={true} />
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmLogout}
        title="Conferma Logout"
        message="Sei sicuro di voler uscire dall'area amministrativa? Se hai modifiche non salvate andranno perse."
        confirmLabel="Logout"
        cancelLabel="Annulla"
        confirmColor="red"
        icon="logout"
        onConfirm={handleLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </div >
  );
};

export default AdminLayout;
