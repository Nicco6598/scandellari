// src/data/careersData.ts
export interface OffertaLavoro {
  id: string;
  titolo: string;
  dipartimento: string;
  sede: string;
  tipo: 'Full-time' | 'Part-time' | 'Contratto';
  descrizione: string;
  requisiti: string[];
  responsabilita: string[];
}

export const offerteDisponibili: OffertaLavoro[] = [
  {
    id: 'elettricista-esperto',
    titolo: 'Elettricista Esperto',
    dipartimento: 'Installazione e Manutenzione',
    sede: 'Milano, Italia',
    tipo: 'Full-time',
    descrizione: 'Cerchiamo elettricisti con esperienza per l\'installazione, manutenzione e riparazione di impianti elettrici industriali e civili. Il candidato ideale ha familiarità con quadri elettrici, cablaggi e sistemi di automazione.',
    requisiti: [
      "Diploma tecnico o attestato professionale in ambito elettrico",
      'Esperienza pregressa come elettricista (minimo 2 anni)',
      'Capacità di lettura di schemi elettrici',
      'Conoscenza delle normative di sicurezza elettrica',
      'Patente B'
    ],
    responsabilita: [
      'Installazione e manutenzione di impianti elettrici',
      'Individuazione e risoluzione guasti',
      'Cablaggi di quadri elettrici',
      'Collaudo degli impianti realizzati',
      'Collaborazione con il team tecnico'
    ]
  },
  {
    id: 'elettricista-junior',
    titolo: 'Elettricista Junior',
    dipartimento: 'Installazione e Manutenzione',
    sede: 'Milano, Italia',
    tipo: 'Full-time',
    descrizione: 'Siamo alla ricerca di elettricisti junior da inserire nel nostro team per supportare le attività di installazione e manutenzione di impianti elettrici. Offriamo formazione sul campo con affiancamento a personale esperto.',
    requisiti: [
      "Diploma o attestato in ambito elettrico/elettrotecnico",
      'Anche prima esperienza lavorativa',
      'Motivazione ad apprendere',
      'Predisposizione al lavoro in team',
      'Patente B'
    ],
    responsabilita: [
      'Supporto nell\'installazione di impianti elettrici',
      'Affiancamento al personale senior nelle attività di cantiere',
      'Posa cavi e componenti elettrici',
      'Manutenzione ordinaria di impianti',
      'Partecipazione alle attività di formazione aziendale'
    ]
  },
  {
    id: 'manovale-esperto',
    titolo: 'Manovale Esperto',
    dipartimento: 'Operativo',
    sede: 'Milano, Italia',
    tipo: 'Full-time',
    descrizione: 'Ricerchiamo manovali con esperienza per attività di supporto nei cantieri. Il candidato si occuperà di movimentazione materiali, preparazione delle aree di lavoro e assistenza alle squadre specializzate.',
    requisiti: [
      "Esperienza pregressa in cantieri edili o impiantistici",
      'Conoscenza delle principali attrezzature di cantiere',
      'Capacità di lavorare in team',
      'Resistenza fisica',
      'Disponibilità a lavorare anche in condizioni climatiche variabili'
    ],
    responsabilita: [
      'Movimentazione e preparazione materiali',
      'Supporto alle squadre specializzate',
      'Manutenzione base delle attrezzature',
      'Pulizia e organizzazione delle aree di lavoro',
      'Assistenza generale alle attività di cantiere'
    ]
  },
  {
    id: 'manovale-junior',
    titolo: 'Manovale Junior',
    dipartimento: 'Operativo',
    sede: 'Milano, Italia',
    tipo: 'Full-time',
    descrizione: 'Cerchiamo manovali anche senza esperienza da inserire nei nostri cantieri. Offriamo formazione sul campo per acquisire competenze pratiche nel settore.',
    requisiti: [
      "Disponibilità immediata",
      'Predisposizione al lavoro manuale',
      'Buona volontà e capacità di apprendimento',
      'Attitudine al lavoro in team',
      'Flessibilità oraria'
    ],
    responsabilita: [
      'Supporto generale alle attività di cantiere',
      'Carico e scarico materiali',
      'Preparazione degli spazi di lavoro',
      'Pulizia delle aree di intervento',
      'Assistenza alle squadre operative'
    ]
  },
  {
    id: 'operaio-patente-c',
    titolo: 'Operaio con Patente C',
    dipartimento: 'Logistica e Trasporti',
    sede: 'Milano, Italia',
    tipo: 'Full-time',
    descrizione: 'Ricerchiamo un operaio in possesso di patente C per attività di trasporto materiali e attrezzature verso i cantieri, oltre che per supportare le attività operative sul campo.',
    requisiti: [
      "Patente C in corso di validità",
      'CQC preferibile ma non obbligatorio',
      'Esperienza nella guida di mezzi pesanti',
      'Capacità di utilizzo di attrezzature da cantiere',
      'Disponibilità a trasferte giornaliere'
    ],
    responsabilita: [
      'Trasporto di materiali e attrezzature ai cantieri',
      'Carico e scarico dei mezzi',
      'Manutenzione ordinaria dei veicoli',
      'Supporto alle attività operative in cantiere',
      'Gestione della documentazione di trasporto'
    ]
  }
];
