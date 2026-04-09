import React from 'react';
import Layout from '../components/layout/Layout';
import {
  ShieldCheckIcon,
  ArrowRightIcon,
  Cog6ToothIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { metaTextClasses, secondaryTextClasses } from '../components/utils/ColorStyles';

const CookiePolicyPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-stone-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans">
        {/* Hero Section */}
        <section className="container mx-auto max-w-7xl px-6 mb-32">
          <div
            className="border-b border-black/5 dark:border-white/5 pb-20"
            data-animate="fade-up"
            data-animate-distance="20"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${metaTextClasses}`}>
                Legal & Cookies
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
              Cookie<br />Policy
            </h1>
            <p className={`text-base md:text-xl max-w-2xl font-medium leading-relaxed ${secondaryTextClasses}`}>
              Informazioni estese sull'utilizzo dei cookie in questo sito web.
            </p>
          </div>
        </section>

        <main className="container mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-24">
            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-12">
              <div className="p-8 bg-black/5 dark:bg-white/5 space-y-8">
                <div className="text-xs font-black uppercase tracking-widest text-primary">Gestione</div>
                <div className="space-y-4">
                  <p className={`text-xs font-medium leading-loose ${secondaryTextClasses}`}>
                    Puoi verificare e gestire le tue preferenze riguardanti i cookie direttamente dalle impostazioni del tuo browser o tramite il banner iniziale.
                  </p>
                </div>
              </div>

              <div className="p-8 border border-black dark:border-white space-y-6">
                <h3 className="text-lg font-black font-heading">Cos'è un Cookie?</h3>
                <p className={`text-xs font-medium leading-loose ${secondaryTextClasses}`}>
                  I cookie sono piccoli file di testo che i siti visitati dall'utente inviano al suo terminale, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla successiva visita.
                </p>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-8 flex flex-col gap-24">
              {[
                {
                  title: "1. Cookie Tecnici",
                  content: "Questi cookie sono necessari per il corretto funzionamento del sito. Includono, ad esempio, i cookie che consentono di accedere ad aree protette del sito o di gestire la sessione."
                },
                {
                  title: "2. Cookie Analitici",
                  content: "Utilizziamo cookie di terze parti (come Google Analytics 4) per raccogliere informazioni in forma aggregata sul numero di utenti e su come questi visitano il sito."
                },
                {
                  title: "3. Cookie di Profilazione",
                  content: "Il sito NON utilizza internamente cookie di profilazione volti a creare profili relativi all'utente al fine di inviare messaggi pubblicitari in linea con le preferenze manifestate."
                },
                {
                  title: "4. Disabilitazione dei Cookie",
                  content: "L'utente può scegliere di disabilitare i cookie configurando le impostazioni del proprio browser (Chrome, Firefox, Safari, Edge, etc.). La disabilitazione dei cookie tecnici potrebbe tuttavia compromettere la navigazione."
                }
              ].map((section, i) => (
                <section key={i} className="space-y-6">
                  <h2 className="text-3xl font-black font-heading tracking-tight uppercase border-l-4 border-primary pl-6">{section.title}</h2>
                  <p className={`text-base font-medium leading-relaxed max-w-2xl ${secondaryTextClasses}`}>{section.content}</p>
                </section>
              ))}

              <div className="pt-20 border-t border-black/5 dark:border-white/5 opacity-30">
                <p className="text-sm font-black uppercase tracking-[0.2em]">Ultimo aggiornamento: 13 Marzo 2024</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default CookiePolicyPage;
