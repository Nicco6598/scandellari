import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MobileMenuProvider } from './context/MobileMenuContext';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import ScrollToTop from './components/utils/ScrollToTop';
import PageLoader from './components/utils/PageLoader';
import ErrorBoundary from './components/utils/ErrorBoundary';
import Analytics from './components/utils/Analytics';
import ScrollProgress from './components/utils/ScrollProgress';
import PageTransition from './components/utils/PageTransition';
import LoadingState from './components/utils/LoadingState';
import RouteLoadingFallback from './components/utils/RouteLoadingFallback';

const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

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

const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProgettiPage = lazy(() => import('./pages/admin/ProgettiPage'));
const ProgettoFormPage = lazy(() => import('./pages/admin/ProgettoFormPage'));
const AdminCompetenzePage = lazy(() => import('./pages/admin/CompetenzePage'));
const CompetenzaFormPage = lazy(() => import('./pages/admin/CompetenzaFormPage'));
const OfferteLavoroPage = lazy(() => import('./pages/admin/OfferteLavoroPage'));
const OffertaLavoroFormPage = lazy(() => import('./pages/admin/OffertaLavoroFormPage'));

type LenisWindow = Window & { lenis?: Lenis };
type RuntimePreferences = {
  allowDecorativeRuntime: boolean;
  allowSmoothScrolling: boolean;
};

const STATIC_ROUTES = [
  '/privacy-policy',
  '/cookie-policy',
  '/policy-aziendale',
];

function useRuntimePreferences(pathname: string): RuntimePreferences {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updatePreferences = () => {
      setPrefersReducedMotion(motionQuery.matches);
    };

    updatePreferences();
    motionQuery.addEventListener('change', updatePreferences);

    return () => {
      motionQuery.removeEventListener('change', updatePreferences);
    };
  }, []);

  return useMemo(() => {
    const isAdminRoute = pathname.startsWith('/admin');
    const isStaticRoute = STATIC_ROUTES.includes(pathname);
    const allowDecorativeRuntime = !prefersReducedMotion && !isAdminRoute && !isStaticRoute;

    return {
      allowDecorativeRuntime,
      allowSmoothScrolling: !prefersReducedMotion && !isAdminRoute && !isStaticRoute,
    };
  }, [pathname, prefersReducedMotion]);
}

function AnimationController({ enabled }: { enabled: boolean }) {
  const location = useLocation();

  useLayoutEffect(() => {
    if (!enabled) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ScrollTrigger.clearMatchMedia();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    let idleHandle: number | undefined;
    let refreshTimeoutId: ReturnType<typeof setTimeout> | undefined;

    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    ScrollTrigger.clearMatchMedia();

    const setupAnimations = () => {
      refreshTimeoutId = setTimeout(() => ScrollTrigger.refresh(), 50);
      
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

    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(setupAnimations, { timeout: 300 });
    } else {
      const raf = requestAnimationFrame(() => { requestAnimationFrame(setupAnimations); });
      return () => {
        cancelAnimationFrame(raf);
        if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }

    return () => {
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [enabled, location.pathname]);

  return null;
}

function AppShell() {
  const location = useLocation();
  const runtimePreferences = useRuntimePreferences(location.pathname);

  useEffect(() => {
    if (!runtimePreferences.allowSmoothScrolling) {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      delete (window as LenisWindow).lenis;
      return;
    }

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    (window as LenisWindow).lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const lenisTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(lenisTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(lenisTicker);
      lenis.destroy();
      delete (window as LenisWindow).lenis;
    };
  }, [runtimePreferences.allowSmoothScrolling]);

  return (
    <>
      <Analytics />
      <ScrollToTop />
      <AnimationController enabled={runtimePreferences.allowDecorativeRuntime} />
      {runtimePreferences.allowDecorativeRuntime ? <ScrollProgress /> : null}
      {runtimePreferences.allowDecorativeRuntime ? <PageTransition /> : null}
      <Suspense
        fallback={<RouteLoadingFallback />}
      >
        <PageLoader>
          <Routes>
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
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
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
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageLoader>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <MobileMenuProvider>
            <Router>
              <AppShell />
            </Router>
          </MobileMenuProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
