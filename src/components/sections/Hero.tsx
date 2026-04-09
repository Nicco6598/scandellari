import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  inverseMetaTextClasses,
  inversePrimaryTextClasses,
  inverseSecondaryTextClasses,
} from '../utils/ColorStyles';

// Import photos for the background slideshow
import heroImg2 from '../../assets/images/Prima-pagina-foto-2.webp';
import heroImg2Mobile from '../../assets/images/Prima-pagina-foto-2-mobile.webp';
import heroImg3 from '../../assets/images/Prima-pagina-foto-3.webp';
import heroImg3Mobile from '../../assets/images/Prima-pagina-foto-3-mobile.webp';
import heroImg4 from '../../assets/images/Prima-pagina-foto-4.webp';
import heroImg4Mobile from '../../assets/images/Prima-pagina-foto-4-mobile.webp';
import heroImg5 from '../../assets/images/Prima-pagina-foto-5.webp';
import heroImg5Mobile from '../../assets/images/Prima-pagina-foto-5-mobile.webp';
import heroImg6 from '../../assets/images/Prima-pagina-foto-6.webp';
import heroImg6Mobile from '../../assets/images/Prima-pagina-foto-6-mobile.webp';

// Import logos for the bottom section
import logoAccredia from '../../assets/images/accredia.webp';
import logoIso14001 from '../../assets/images/aid-iso-14001.webp';
import logoIso9001 from '../../assets/images/aid-iso-9001.webp';
import logoIso45001 from '../../assets/images/aid-iso-45001.webp';

const heroImages = [
  { src: heroImg2, mobileSrc: heroImg2Mobile },
  { src: heroImg3, mobileSrc: heroImg3Mobile },
  { src: heroImg4, mobileSrc: heroImg4Mobile },
  { src: heroImg5, mobileSrc: heroImg5Mobile },
  { src: heroImg6, mobileSrc: heroImg6Mobile },
];

const tabs = [
  { id: 'signals', label: 'Segnalamento', path: '/competenze/segnalamento' },
  { id: 'oleo', label: 'Oleodinamica', path: '/competenze/oleodinamica' },
  { id: 'infra', label: 'Infrastrutture', path: '/competenze/infrastrutture' },
];

// ─── Magnetic CTA Button ────────────────────────────────────────────────────
const MagneticCTA: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = cta.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(cta, {
        x: x * 0.2,
        y: y * 0.2,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(cta, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.5)'
      });
    };

    cta.addEventListener('mousemove', handleMouseMove);
    cta.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cta.removeEventListener('mousemove', handleMouseMove);
      cta.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Link
      ref={ctaRef}
      to={to}
      className={`text-xs font-black uppercase tracking-[0.3em] hover:text-primary dark:hover:text-primary-light transition-colors flex items-center gap-4 group cursor-pointer ${inversePrimaryTextClasses}`}
    >
      {children}
    </Link>
  );
};

const Hero: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // Background breath animation
  useEffect(() => {
    if (!bgRef.current) return;
    
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(bgRef.current, {
      scale: 1.05,
      duration: 8,
      ease: 'sine.inOut'
    });
    
    return () => { tl.kill(); };
  }, []);

  // Preload first hero image for faster LCP (mobile-aware)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.type = 'image/webp';
    link.href = isMobile ? heroImg2Mobile : heroImg2;
    document.head.prepend(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!titleRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    tl.to(titleRef.current.querySelectorAll('.char'), {
      opacity: 1,
      y: 0,
      duration: 1.0,
      stagger: 0.02,
      delay: 0.3
    });

    return () => {
      tl.kill();
    };
  }, []);

  const titleLines = ["Ingegneria", "Ferroviaria"];

  return (
    <section className="relative w-full h-[100vh] flex flex-col items-center bg-stone-50 dark:bg-dark font-sans overflow-hidden">
      {/* Background Slideshow - Full Screen for impact */}
      <div ref={bgRef} className="absolute inset-0 z-0 bg-black scale-100">
        <div className="absolute inset-0">
          {heroImages.map(({ src, mobileSrc }, i) => (
            <img
              key={i}
              src={src}
              srcSet={`${mobileSrc} 640w, ${src} 1280w`}
              sizes="(max-width: 767px) 100vw, 100vw"
              alt=""
              aria-hidden="true"
              width="1280"
              height="854"
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding={i === 0 ? 'sync' : 'async'}
              className={`absolute inset-0 w-full h-full object-cover grayscale brightness-[0.4] transition-opacity duration-[2000ms] ease-linear ${i === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
        </div>

        {/* Protection Overlays for Text & Header with subtle accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-primary/5" /> {/* Subtle primary tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90" /> {/* Top and bottom protection */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" /> {/* Left side protection for text */}
      </div>

      <div className="container relative z-10 mx-auto h-full max-w-7xl px-6 flex flex-col justify-between py-24 md:py-32">
        {/* Top Tagline */}
        <div className="flex items-center gap-4" data-animate="fade-right" data-animate-distance="20">
          <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
          <span className={`text-xs font-bold uppercase tracking-[0.5em] ${inverseMetaTextClasses}`}>
            FondatA nel 1945
          </span>
        </div>

        {/* Hero Main Content */}
        <div className="max-w-4xl">
          <h1
            ref={titleRef}
            className={`text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter leading-[0.8] mb-12 font-heading ${inversePrimaryTextClasses}`}
          >
            {titleLines.map((line, i) => (
              <div key={i} className="line-container overflow-hidden">
                {line.split('').map((char, j) => (
                  <span key={j} className="char inline-block opacity-0 translate-y-20">
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </div>
            ))}
          </h1>

          <div
            data-animate="fade-up"
            data-animate-delay="0.15"
            className="grid md:grid-cols-2 gap-12 items-start"
          >
            <p className={`text-base md:text-lg leading-relaxed font-medium tracking-tight max-w-sm ${inverseSecondaryTextClasses}`}>
              Sviluppiamo tecnologie all'avanguardia per l'infrastruttura ferroviaria nazionale. Eccellenza tecnica e innovazione costante al servizio della mobilità.
            </p>

            <div className="flex flex-col gap-6">
              <div className="flex gap-4">
                {heroImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    aria-label={`Immagine ${i + 1}`}
                    className={`h-[2px] transition-all duration-700 ${i === currentImageIndex ? 'w-12 bg-primary shadow-[0_0_6px_rgba(37,99,235,0.6)]' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>
              <MagneticCTA to="/progetti">
                Esplora i Progetti
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-primary transition-colors">
                  <div className="w-1.5 h-1.5 bg-white group-hover:bg-primary rounded-full" />
                </div>
              </MagneticCTA>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Certifications and Minimal Info */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-t border-white/10 pt-12">
          <div className="flex flex-wrap gap-8 md:gap-16 opacity-30 grayscale invert">
            <img src={logoAccredia} alt="Accredia" width="80" height="20" className="h-4 md:h-5 object-contain" loading="lazy" decoding="async" />
            <img src={logoIso9001} alt="ISO 9001" width="80" height="30" className="h-6 md:h-8 object-contain" loading="lazy" decoding="async" />
            <img src={logoIso14001} alt="ISO 14001" width="80" height="30" className="h-6 md:h-8 object-contain" loading="lazy" decoding="async" />
            <img src={logoIso45001} alt="ISO 45001" width="80" height="30" className="h-6 md:h-8 object-contain" loading="lazy" decoding="async" />
          </div>

          <div className={`hidden lg:flex gap-16 text-xs font-bold uppercase tracking-[0.3em] ${inverseMetaTextClasses}`}>
            <div className="space-y-2">
              <p className={inverseMetaTextClasses}>Settore</p>
              <p>Infrastruttura / Segnalamento</p>
            </div>
            <div className="space-y-2">
              <p className={inverseMetaTextClasses}>Sede</p>
              <p>Treviglio, Italia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
