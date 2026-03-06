// src/App.tsx modificato
import React, { Suspense, lazy, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MobileMenuProvider } from './context/MobileMenuContext';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Componenti utili - SPOSTATI IN ALTO PER ESLINT
import ScrollToTop from './components/utils/ScrollToTop';
import PageLoader from './components/utils/PageLoader';
import ErrorBoundary from './components/utils/ErrorBoundary';
import Analytics from './components/utils/Analytics';
import ScrollProgress from './components/utils/ScrollProgress';
import CustomCursor from './components/utils/CustomCursor';
import PageTransition from './components/utils/PageTransition';

// Rimuovo l'import di ProtectedRoute qui, verrà usato in AdminLayout
// import ProtectedRoute from './components/admin/ProtectedRoute'; 

// Importa il nuovo layout admin
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

// Pagine pubbliche - Lazy load
const HomePage = lazy(() => import('./pages/HomePage'));
const CompetenzePage = lazy(() => import('./pages/CompetenzePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CertificationsPage = lazy(() => import('./pages/CertificationsPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const CompanyPolicyPage = lazy(() => import('./pages/CompanyPolicyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Pagine admin - Lazy load
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProgettiPage = lazy(() => import('./pages/admin/ProgettiPage'));
const ProgettoFormPage = lazy(() => import('./pages/admin/ProgettoFormPage'));
const AdminCompetenzePage = lazy(() => import('./pages/admin/CompetenzePage'));
const CompetenzaFormPage = lazy(() => import('./pages/admin/CompetenzaFormPage'));
const OfferteLavoroPage = lazy(() => import('./pages/admin/OfferteLavoroPage'));
const OffertaLavoroFormPage = lazy(() => import('./pages/admin/OffertaLavoroFormPage'));

const AnimationController: React.FC = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    // Pulizia immediata (sincrona) dei trigger della route precedente
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    ScrollTrigger.clearMatchMedia();

    let idleHandle: number | undefined;

    const setupAnimations = () => {
      ScrollTrigger.refresh();

      const elements = gsap.utils.toArray<HTMLElement>('[data-animate]');
      elements.forEach((element) => {
        const type = element.dataset.animate ?? 'fade-up';
        const delay = Number(element.dataset.animateDelay ?? 0);
        const distance = Number(element.dataset.animateDistance ?? 24);
        const fromVars: gsap.TweenVars = { opacity: 0, x: 0, y: 0, scale: 1 };

        if (type === 'fade-left') fromVars.x = -distance;
        if (type === 'fade-right') fromVars.x = distance;
        if (type === 'fade-up') fromVars.y = distance;
        if (type === 'fade-down') fromVars.y = -distance;
        if (type === 'scale') fromVars.scale = 0.95;

        gsap.fromTo(
          element,
          fromVars,
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            delay,
            scrollTrigger: {
              trigger: element,
              start: 'top 92%',
              toggleActions: 'play none none none',
              once: true,
            },
          }
        );
      });

      // Stagger animation for children of [data-animate-stagger]
      const staggerContainers = gsap.utils.toArray<HTMLElement>('[data-animate-stagger]');
      staggerContainers.forEach((container) => {
        const children = container.children;
        if (children.length === 0) return;

        gsap.fromTo(
          children,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.08,
            scrollTrigger: {
              trigger: container,
              start: 'top 90%',
              once: true,
            },
          }
        );
      });

      // Parallax effect for [data-parallax]
      const parallaxElements = gsap.utils.toArray<HTMLElement>('[data-parallax]');
      parallaxElements.forEach((el) => {
        const speed = Number(el.dataset.parallax ?? 0.1);
        gsap.to(el, {
          yPercent: speed * 50,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    };

    // Defer heavy GSAP setup to idle time so it doesn't block the main thread (TBT)
    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(setupAnimations, { timeout: 300 });
    } else {
      // Fallback: defer by one frame to allow paint first
      const raf = requestAnimationFrame(() => { requestAnimationFrame(setupAnimations); });
      return () => {
        cancelAnimationFrame(raf);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }

    return () => {
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [location.pathname]);

  return null;
};

const App: React.FC = () => {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
    });

    // Rendi lenis accessibile globalmente per ScrollToTop
    (window as Window & { lenis?: typeof lenis }).lenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <MobileMenuProvider>
            <Router>
              <Analytics />
              <ScrollToTop />
              <AnimationController />
              <ScrollProgress />
              <CustomCursor />
              <PageTransition />
              {/* 
                Opzione 1: Modifica PageLoader per rendere 'children' opzionale.
                Opzione 2: Usa un fallback più semplice se PageLoader richiede 'children'.
                Ad esempio: fallback={<div>Caricamento...</div>} 
              */}
              <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark/80 backdrop-blur-md"><div className="w-12 h-12 border-4 border-solid border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
                <Routes>
                  {/* Rotte pubbliche */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/competenze" element={<CompetenzePage />} />
                  <Route path="/competenze/:categoria" element={<CompetenzePage />} />
                  <Route path="/progetti" element={<ProjectsPage />} />
                  <Route path="/progetti/:id" element={<ProjectDetailPage />} />
                  <Route path="/chi-siamo" element={<AboutPage />} />
                  <Route path="/contatti" element={<ContactPage />} />
                  <Route path="/certificazioni" element={<CertificationsPage />} />
                  <Route path="/lavora-con-noi" element={<CareersPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/cookie-policy" element={<CookiePolicyPage />} />
                  <Route path="/policy-aziendale" element={<CompanyPolicyPage />} />

                  {/* Rotta login admin (non protetta) */}
                  <Route path="/admin/login" element={<LoginPage />} />

                  {/* Rotte admin protette raggruppate sotto AdminLayout */}
                  <Route path="/admin" element={<AdminLayout />}>
                    {/* Il path "/admin" può reindirizzare a dashboard o mostrare dashboard di default */}
                    {/* Se vuoi dashboard come index: */}
                    <Route index element={<DashboardPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="progetti" element={<ProgettiPage />} />
                    <Route path="progetti/nuovo" element={<ProgettoFormPage />} />
                    <Route path="progetti/modifica/:id" element={<ProgettoFormPage />} />
                    <Route path="competenze" element={<AdminCompetenzePage />} />
                    <Route path="competenze/nuova" element={<CompetenzaFormPage />} />
                    <Route path="competenze/modifica/:id" element={<CompetenzaFormPage />} />
                    <Route path="offerte-lavoro" element={<OfferteLavoroPage />} />
                    <Route path="offerte-lavoro/nuova" element={<OffertaLavoroFormPage />} />
                    <Route path="offerte-lavoro/modifica/:id" element={<OffertaLavoroFormPage />} />
                    {/* Nota: ho aggiunto una rotta index per /admin che punta alla dashboard */}
                    {/* Puoi rimuoverla se /admin non deve mostrare nulla di default */}
                  </Route>

                  {/* 404 Not Found - Must be last */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </Router>
          </MobileMenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
