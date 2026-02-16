import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

// Importa loghi azienda
import logoBlu from '../../assets/images/LogoBlu.svg';
import logoBianco from '../../assets/images/LogoBianco.svg';

// Importa loghi certificazione
import logoAccredia from '../../assets/images/accredia.png';
import logoIso14001 from '../../assets/images/aid-iso-14001.png';
import logoIso9001 from '../../assets/images/aid-iso-9001.png';
import logoIso45001 from '../../assets/images/aid-iso-45001.png';

// Importa Icone Heroicons necessarie
import { MapPinIcon, EnvelopeIcon, PhoneIcon, ArrowRightIcon, MapIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

// Rimossa importazione react-icons: import { FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer: React.FC = () => {
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
                        <Link to="/">
                            <img
                                src={theme === 'dark' ? logoBianco : logoBlu}
                                alt="Scandellari"
                                className="h-10 md:h-12"
                            />
                        </Link>
                        <p className="text-sm md:text-base text-black/70 dark:text-white/60 max-w-sm leading-relaxed font-medium">
                            Progettiamo l'eccellenza per il futuro del trasporto ferroviario. Segnalamento e infrastrutture ad alte prestazioni dal 1945.
                        </p>
                        <div className="pt-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Qualità Certificata</span>
                            <div className="flex flex-wrap gap-8 mt-6 grayscale opacity-30">
                                {certificationLogos.map((logo, i) => (
                                    <img key={i} src={logo.src} alt={logo.alt} className="h-6 object-contain" />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Column */}
                    <div className="lg:col-span-3 space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/50 dark:text-white/40">Navigazione</h4>
                        <ul className="space-y-4" data-animate-stagger>
                            {footerLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        className="text-xl font-bold text-black dark:text-white hover:text-primary transition-colors font-heading tracking-tight group inline-flex items-center gap-2"
                                    >
                                        {link.name}
                                        <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="lg:col-span-4 space-y-10">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-black/50 dark:text-white/40">Contatti</h4>
                            <p className="text-xl font-bold text-black dark:text-white font-heading tracking-tight">
                                Via Roggia Vignola, 9<br />
                                24047 Treviglio (BG), Italia
                            </p>
                            <a
                                href="mailto:info@scandellarigiacintosnc.it"
                                className="block text-sm font-bold text-primary hover:underline underline-offset-4"
                            >
                                info@scandellarigiacintosnc.it
                            </a>
                        </div>

                        <div className="flex items-center gap-12 pt-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-black/60 dark:text-white/50">Telefono</p>
                                <p className="text-sm font-black text-black dark:text-white">+39 0363303506</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-black/60 dark:text-white/50">Dati Fiscali</p>
                                <p className="text-sm font-black text-black dark:text-white">P.IVA IT01803170164</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-bold text-black/50 dark:text-white/40 uppercase tracking-widest">
                        © {currentYear} Scandellari Giacinto s.n.c. Tutti i diritti riservati.
                    </p>
                    <div className="flex gap-8">
                        {legalLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-[10px] font-bold text-black/70 dark:text-white/60 uppercase tracking-widest hover:text-primary transition-colors group inline-flex items-center gap-1.5"
                            >
                                {link.name}
                                <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
