import React from 'react';
import Layout from '../components/layout/Layout';
import {
  ShieldCheckIcon,
  InformationCircleIcon,
  UserIcon,
  LockClosedIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-black min-h-screen pt-32 pb-20 font-sans">
        {/* Hero Section */}
        <section className="container mx-auto max-w-7xl px-6 mb-32">
          <div
            className="border-b border-black/5 dark:border-white/5 pb-20"
            data-animate="fade-up"
            data-animate-distance="20"
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-[1px] bg-primary shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                Legal & Privacy
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
              Privacy<br />Policy
            </h1>
            <p className="text-base md:text-xl text-black/70 dark:text-white/60 max-w-2xl font-medium leading-relaxed">
              Informativa sul trattamento dei dati personali ai sensi del Regolamento UE 2016/679 (GDPR).
            </p>
          </div>
        </section>

        <main className="container mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-24">
            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-12">
              <div className="p-8 bg-black/5 dark:bg-white/5 space-y-8">
                <div className="text-xs font-black uppercase tracking-widest text-primary">Dati del Titolare</div>
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase tracking-widest">Scandellari Giacinto s.n.c.</p>
                  <p className="text-xs text-black/40 dark:text-white/40 font-medium">Via Roggia Vignola, 9<br />24047 Treviglio (BG)</p>
                  <a href="mailto:privacy@scandellarigiacintosnc.it" className="block text-xs font-black text-primary underline lowercase">privacy@scandellarigiacintosnc.it</a>
                </div>
              </div>

              <div className="p-8 border border-black dark:border-white space-y-6">
                <h3 className="text-lg font-black font-heading">I Tuoi Diritti</h3>
                <p className="text-xs text-black/40 dark:text-white/40 font-medium leading-loose">Hai il diritto di accedere ai tuoi dati, richiederne la rettifica, la cancellazione o la limitazione del trattamento in qualsiasi momento.</p>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-8 flex flex-col gap-24">
              {[
                {
                  title: "1. Tipi di dati raccolti",
                  content: "Fra i Dati Personali raccolti da questa Applicazione, in modo autonomo o tramite terze parti, ci sono: Cookie, Dati di utilizzo, Nome, Cognome, Numero di telefono, Ragione sociale e Email."
                },
                {
                  title: "2. Modalità e luogo del trattamento",
                  content: "Il Titolare adotta le opportune misure di sicurezza volte ad impedire l'accesso, la divulgazione, la modifica o la distruzione non autorizzate dei Dati Personali."
                },
                {
                  title: "3. Finalità del Trattamento dei Dati raccolti",
                  content: "I Dati dell’Utente sono raccolti per consentire al Titolare di fornire i propri Servizi, così come per le seguenti finalità: Contattare l'Utente, Visualizzazione di contenuti da piattaforme esterne e Statistica."
                },
                {
                  title: "4. Tempi di conservazione",
                  content: "I Dati sono trattati e conservati per il tempo richiesto dalle finalità per le quali sono stati raccolti."
                }
              ].map((section, i) => (
                <section key={i} className="space-y-6">
                  <h2 className="text-2xl font-black font-heading tracking-tight uppercase border-l-4 border-primary pl-6">{section.title}</h2>
                  <p className="text-base text-black/50 dark:text-white/40 font-medium leading-relaxed max-w-2xl">{section.content}</p>
                </section>
              ))}

              <div className="pt-20 border-t border-black/5 dark:border-white/5 opacity-30">
                <p className="text-xs font-black uppercase tracking-[0.2em]">Ultimo aggiornamento: 13 Marzo 2024</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyPage;
