import React from 'react';
import Layout from '../components/layout/Layout';
import {
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  SparklesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const CompanyPolicyPage: React.FC = () => {
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
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/70 dark:text-white/60">
                Governance & Standards
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-black dark:text-white tracking-tighter leading-[0.8] font-heading mb-12">
              Policy<br />Aziendale
            </h1>
            <p className="text-base md:text-xl text-black/70 dark:text-white/60 max-w-2xl font-medium leading-relaxed">
              I nostri parametri di eccellenza operativa, responsabilità ambientale e tutela della sicurezza sul lavoro.
            </p>
          </div>
        </section>

        <main className="container mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-12 gap-24">
            {/* Summary Sidebar */}
            <aside className="lg:col-span-4 space-y-12">
              <div className="p-8 bg-black/5 dark:bg-white/5 space-y-8">
                <div className="text-xs font-black uppercase tracking-widest text-primary">Certificazioni Attive</div>
                <ul className="space-y-6">
                  {[
                    { code: 'ISO 9001:2015', label: 'Qualità' },
                    { code: 'ISO 14001:2015', label: 'Ambiente' },
                    { code: 'ISO 45001:2018', label: 'Sicurezza' }
                  ].map((cert, i) => (
                    <li key={i} className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                      <span className="text-black/30 dark:text-white/20">{cert.label}</span>
                      <span className="text-black dark:text-white">{cert.code}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 border border-black dark:border-white space-y-6">
                <h3 className="text-lg font-black font-heading">Documentazione</h3>
                <p className="text-xs text-black/40 dark:text-white/40 font-medium">Scarica la politica integrale del sistema di gestione integrato.</p>
                <a
                  href="/certificazioni/Politica_Sistema_Integrato_Qualita_Ambiente_Sicurezza.pdf"
                  target="_blank"
                  className="inline-flex items-center gap-4 text-xs font-black uppercase tracking-widest text-primary group"
                >
                  Download PDF
                  <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                </a>
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-8 flex flex-col gap-24">
              {[
                {
                  icon: CheckBadgeIcon,
                  title: "Politica della Qualità",
                  content: "Scandellari Giacinto s.n.c. pone al centro della propria strategia il soddisfacimento delle esigenze del Cliente e il miglioramento continuo delle prestazioni aziendali.",
                  points: ["Eccellenza operativa", "Monitoraggio KPI", "Formazione del personale"]
                },
                {
                  icon: SparklesIcon,
                  title: "Politica Ambientale",
                  content: "Impegno costante nella riduzione dell'impatto ambientale delle attività di cantiere e monitoraggio delle risorse energetiche.",
                  points: ["Riduzione rifiuti", "Efficienza energetica", "Sostenibilità dei materiali"]
                },
                {
                  icon: ShieldCheckIcon,
                  title: "Salute e Sicurezza",
                  content: "La tutela dei lavoratori è una priorità assoluta. Applichiamo protocolli rigorosi per azzerare i rischi professionali in ogni contesto operativo.",
                  points: ["Zero infortuni goal", "DPI certificati", "Addestramento costante"]
                }
              ].map((section, i) => (
                <section key={i} className="space-y-12">
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
                      <section.icon className="w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black font-heading tracking-tight uppercase">{section.title}</h2>
                  </div>
                  <div className="max-w-2xl space-y-8">
                    <p className="text-base text-black/50 dark:text-white/40 font-medium leading-relaxed">{section.content}</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {section.points.map((point, j) => (
                        <div key={j} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest py-4 border-b border-black/5 dark:border-white/5">
                          <span className="w-1.5 h-1.5 bg-primary" />
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default CompanyPolicyPage;
