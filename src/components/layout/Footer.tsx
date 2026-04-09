import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import gsap from 'gsap';

import logoBlu from '../../assets/images/LogoBlu.svg';
import logoBianco from '../../assets/images/LogoBianco.svg';

import logoAccredia from '../../assets/images/accredia.webp';
import logoIso14001 from '../../assets/images/aid-iso-14001.webp';
import logoIso9001 from '../../assets/images/aid-iso-9001.webp';
import logoIso45001 from '../../assets/images/aid-iso-45001.webp';
import { metaTextClasses, secondaryTextClasses } from '../utils/ColorStyles';

import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

type MagneticLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
};

function MagneticLink({ to, children, className = '' }: MagneticLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const link = linkRef.current;
    if (!link) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(link, {
        x: x * 0.1,
        y: y * 0.1,
        duration: 0.2,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(link, {
        x: 0,
        y: 0,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)'
      });
    };

    link.addEventListener('mousemove', handleMouseMove);
    link.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      link.removeEventListener('mousemove', handleMouseMove);
      link.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Link ref={linkRef} to={to} className={className}>
      {children}
    </Link>
  );
}

function Footer() {
    const currentYear = new Date().getFullYear();
    const { theme } = useTheme();

    const footerLinks = [
        { name: 'Home', path: '/' },
        { name: 'Soluzioni', path: '/competenze' },
        { name: 'Progetti', path: '/progetti' },
        { name: 'Azienda', path: '/chi-siamo' },
        { name: 'Contatti', path: '/contatti' },
    ];

    const legalLinks = [
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Cookie Policy', path: '/cookie-policy' },
        { name: 'Policy Aziendale', path: '/policy-aziendale' },
    ];

    const certificationLogos = [
        { src: logoAccredia, alt: 'ACCREDIA' },
        { src: logoIso9001, alt: 'ISO 9001' },
        { src: logoIso14001, alt: 'ISO 14001' },
        { src: logoIso45001, alt: 'ISO 45001' },
    ];

    return (
        <footer className="bg-gray-100 dark:bg-black border-t border-gray-200 dark:border-gray-900 pt-32 pb-12 font-sans">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32">

                    {/* Brand Column */}
                    <div className="lg:col-span-5 space-y-12" data-animate="fade-up">
                        <Link to="/" aria-label="Torna alla home - Scandellari Giacinto s.n.c.">
                            <img
                                src={theme === 'dark' ? logoBianco : logoBlu}
                                alt="Scandellari Giacinto s.n.c."
                                width="200"
                                height="48"
                                className="h-10 md:h-12 w-auto"
                                loading="lazy"
                                decoding="async"
                            />
                        </Link>
                        <p className={`text-sm md:text-base max-w-sm leading-relaxed font-medium ${secondaryTextClasses}`}>
                            Progettiamo l'eccellenza per il futuro del trasporto ferroviario. Segnalamento e infrastrutture ad alte prestazioni dal 1945.
                        </p>
                        <div className="pt-4">
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary-dark dark:text-primary-medium">Qualità Certificata</span>
                            <div className="flex flex-wrap gap-8 mt-6 grayscale opacity-30">
                                {certificationLogos.map((logo) => (
                                    <img key={logo.alt} src={logo.src} alt={logo.alt} width="80" height="24" className="h-6 w-auto object-contain" loading="lazy" decoding="async" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Column */}
                    <div className="lg:col-span-3 space-y-8">
                        <h4 className={`text-xs font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>Navigazione</h4>
                        <ul className="space-y-4" data-animate-stagger>
                            {footerLinks.map((link) => (
                                <li key={link.name}>
                                    <MagneticLink
                                        to={link.path}
                                        className="text-xl font-bold text-black dark:text-white hover:text-primary transition-colors font-heading tracking-tight group inline-flex items-center gap-2"
                                    >
                                        {link.name}
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </MagneticLink>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="space-y-4">
                            <h4 className={`text-xs font-black uppercase tracking-[0.3em] ${metaTextClasses}`}>Contatti</h4>
                            <p className="text-xl font-bold text-black dark:text-white font-heading tracking-tight">
                                Via Roggia Vignola, 9<br />
                                24047 Treviglio (BG), Italia
                            </p>
                            <a
                                href="mailto:info@scandellarigiacintosnc.it"
                                className="block text-sm font-bold text-primary-dark dark:text-primary-medium hover:underline underline-offset-4"
                            >
                                info@scandellarigiacintosnc.it
                            </a>
                        </div>

                        <div className="flex items-center gap-12 pt-4">
                            <div className="space-y-1">
                                <p className={`text-xs font-black uppercase tracking-widest ${metaTextClasses}`}>Telefono</p>
                                <p className="text-sm font-black text-black dark:text-white">+39 0363303506</p>
                            </div>
                            <div className="space-y-1">
                                <p className={`text-xs font-black uppercase tracking-widest ${metaTextClasses}`}>Dati Fiscali</p>
                                <p className="text-sm font-black text-black dark:text-white">P.IVA IT01803170164</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-gray-300 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className={`text-xs font-bold uppercase tracking-widest ${metaTextClasses}`}>
                        © {currentYear} Scandellari Giacinto s.n.c. Tutti i diritti riservati.
                    </p>
                    <div className="flex gap-8">
                        {legalLinks.map((link) => (
                            <MagneticLink
                                key={link.name}
                                to={link.path}
                                className={`text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors group inline-flex items-center gap-1.5 ${metaTextClasses}`}
                            >
                                {link.name}
                                <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </MagneticLink>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
