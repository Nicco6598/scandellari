import React from 'react';
import Layout from '../components/layout/Layout';
import SEO from '../components/utils/SEO';
import Hero from '../components/sections/Hero';
import Services from '../components/sections/Services';
import Projects from '../components/sections/Projects';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <SEO
        title="Scandellari Giacinto s.n.c. - Segnalamento e Sicurezza Ferroviaria dal 1945"
        description="Leader nell'installazione di sistemi di segnalamento e sicurezza ferroviaria in Italia. Oltre 75 anni di esperienza al servizio dell'infrastruttura ferroviaria nazionale con RFI, Trenitalia e ITALFERR."
        keywords="segnalamento ferroviario, sicurezza ferroviaria, impianti ferroviari, RFI, Trenitalia, SCMT, ACEI, alta velocità, manutenzione ferroviaria, Scandellari, Treviglio"
        url="/"
      />
      <div className="relative min-h-screen bg-stone-50 dark:bg-dark">
        <div className="relative z-10">
          <Hero />
          <Services />
          <Projects />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
