import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { MobileMenuProvider } from './context/MobileMenuContext';

import ScrollToTop from './components/utils/ScrollToTop';
import PageLoader from './components/utils/PageLoader';
import ErrorBoundary from './components/utils/ErrorBoundary';
import Analytics from './components/utils/Analytics';
import ScrollProgress from './components/utils/ScrollProgress';
import RouteLoadingFallback from './components/utils/RouteLoadingFallback';

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

const AdminLoginRoute = lazy(async () => {
  const [{ AuthProvider }, { default: LoginPage }] = await Promise.all([
    import('./context/AuthContext'),
    import('./pages/admin/LoginPage'),
  ]);

  function AdminLoginRouteComponent() {
    return (
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
  }

  return {
    default: AdminLoginRouteComponent,
  };
});

const AdminAppRoute = lazy(async () => {
  const [{ AuthProvider }, { default: AdminLayout }] = await Promise.all([
    import('./context/AuthContext'),
    import('./components/admin/AdminLayout'),
  ]);

  function AdminAppRouteComponent() {
    return (
      <AuthProvider>
        <AdminLayout />
      </AuthProvider>
    );
  }

  return {
    default: AdminAppRouteComponent,
  };
});

const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProgettiPage = lazy(() => import('./pages/admin/ProgettiPage'));
const ProgettoFormPage = lazy(() => import('./pages/admin/ProgettoFormPage'));
const AdminCompetenzePage = lazy(() => import('./pages/admin/CompetenzePage'));
const CompetenzaFormPage = lazy(() => import('./pages/admin/CompetenzaFormPage'));
const OfferteLavoroPage = lazy(() => import('./pages/admin/OfferteLavoroPage'));
const OffertaLavoroFormPage = lazy(() => import('./pages/admin/OffertaLavoroFormPage'));

type RuntimePreferences = {
  allowScrollProgress: boolean;
  allowDecorativeRuntime: boolean;
  allowSmoothScrolling: boolean;
};

const STATIC_ROUTES = [
  '/privacy-policy',
  '/cookie-policy',
  '/policy-aziendale',
];

const DECORATIVE_RUNTIME_DISABLED_PREFIXES = [
  '/progetti',
  '/competenze',
  '/certificazioni',
  '/lavora-con-noi',
] as const;

const SMOOTH_SCROLL_DISABLED_PREFIXES: readonly string[] = [];

function matchesRoutePrefix(pathname: string, prefixes: readonly string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function useRuntimePreferences(pathname: string, search: string): RuntimePreferences {
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
    const smoothOverride = new URLSearchParams(search).get('smooth');
    const forceSmoothScrolling = smoothOverride === '1' || smoothOverride === 'true';
    const disableSmoothScrolling = smoothOverride === '0' || smoothOverride === 'false';
    const isAdminRoute = pathname.startsWith('/admin');
    const isStaticRoute = STATIC_ROUTES.includes(pathname);
    const disableDecorativeRuntimeForRoute = matchesRoutePrefix(pathname, DECORATIVE_RUNTIME_DISABLED_PREFIXES);
    const disableSmoothScrollingForRoute = matchesRoutePrefix(pathname, SMOOTH_SCROLL_DISABLED_PREFIXES);
    const allowScrollProgress = !prefersReducedMotion && !isAdminRoute;
    const allowDecorativeRuntime = (
      !prefersReducedMotion &&
      !isAdminRoute &&
      !isStaticRoute &&
      !disableDecorativeRuntimeForRoute
    );
    const allowSmoothScrolling = disableSmoothScrolling
      ? false
      : forceSmoothScrolling
        ? true
        : !prefersReducedMotion && !disableSmoothScrollingForRoute;

    return {
      allowScrollProgress,
      allowDecorativeRuntime,
      allowSmoothScrolling,
    };
  }, [pathname, prefersReducedMotion, search]);
}

function AnimationController({ enabled }: { enabled: boolean }) {
  const location = useLocation();

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    let cancelled = false;
    let idleHandle: number | undefined;
    let rafId: number | undefined;
    let refreshTimeoutId: number | undefined;
    let cleanupAnimations: (() => void) | undefined;

    const initializeAnimations = async () => {
      const hasAnimatedElements = Boolean(
        document.querySelector('[data-animate], [data-animate-stagger], [data-parallax]')
      );
      if (!hasAnimatedElements) return;

      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ScrollTrigger.clearMatchMedia();

      refreshTimeoutId = window.setTimeout(() => ScrollTrigger.refresh(), 50);

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

      cleanupAnimations = () => {
        if (refreshTimeoutId !== undefined) window.clearTimeout(refreshTimeoutId);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        ScrollTrigger.clearMatchMedia();
      };
    };

    const scheduleInitialization = () => {
      void initializeAnimations();
    };

    if (typeof window.requestIdleCallback === 'function') {
      idleHandle = window.requestIdleCallback(scheduleInitialization, { timeout: 300 });
    } else {
      rafId = window.requestAnimationFrame(() => {
        rafId = window.requestAnimationFrame(scheduleInitialization);
      });
    }

    return () => {
      cancelled = true;
      if (idleHandle !== undefined) window.cancelIdleCallback(idleHandle);
      if (rafId !== undefined) window.cancelAnimationFrame(rafId);
      if (refreshTimeoutId !== undefined) window.clearTimeout(refreshTimeoutId);
      cleanupAnimations?.();
    };
  }, [enabled, location.pathname]);

  return null;
}

function AppShell() {
  const location = useLocation();
  const runtimePreferences = useRuntimePreferences(location.pathname, location.search);

  useEffect(() => {
    if (!runtimePreferences.allowSmoothScrolling || typeof window === 'undefined') {
      window.lenis?.destroy();
      delete window.lenis;
      return;
    }

    let cancelled = false;
    let lenisInstance: Window['lenis'];
    let removeTicker: (() => void) | undefined;

    const initializeSmoothScroll = async () => {
      const [{ default: Lenis }, gsapModule, scrollTriggerModule] = await Promise.all([
        import('lenis'),
        runtimePreferences.allowDecorativeRuntime ? import('gsap') : Promise.resolve(null),
        runtimePreferences.allowDecorativeRuntime ? import('gsap/ScrollTrigger') : Promise.resolve(null),
      ]);

      if (cancelled) return;

      const lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        syncTouch: true,
        syncTouchLerp: 0.08,
        touchInertiaExponent: 1.1,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        infinite: false,
      });

      lenisInstance = lenis;
      window.lenis = lenis;

      const gsap = gsapModule?.default;
      const ScrollTrigger = scrollTriggerModule?.ScrollTrigger;

      if (gsap && ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);

        const lenisTicker = (time: number) => {
          lenis.raf(time * 1000);
        };

        gsap.ticker.add(lenisTicker);
        gsap.ticker.lagSmoothing(0);

        removeTicker = () => {
          gsap.ticker.remove(lenisTicker);
        };

        return;
      }

      let frameId = 0;
      const tick = (time: number) => {
        lenis.raf(time);
        frameId = window.requestAnimationFrame(tick);
      };

      frameId = window.requestAnimationFrame(tick);
      removeTicker = () => {
        window.cancelAnimationFrame(frameId);
      };
    };

    void initializeSmoothScroll();

    return () => {
      cancelled = true;
      removeTicker?.();
      lenisInstance?.destroy();
      if (window.lenis === lenisInstance) {
        delete window.lenis;
      }
    };
  }, [runtimePreferences.allowSmoothScrolling]);

  return (
    <>
      <Analytics />
      <ScrollToTop />
      <AnimationController enabled={runtimePreferences.allowDecorativeRuntime} />
{runtimePreferences.allowScrollProgress ? <ScrollProgress /> : null}
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
            <Route
              path="/admin/login"
              element={<AdminLoginRoute />}
            />
            <Route
              path="/admin"
              element={<AdminAppRoute />}
            >
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
        <MobileMenuProvider>
          <Router>
            <AppShell />
          </Router>
        </MobileMenuProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
