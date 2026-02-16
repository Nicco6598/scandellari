// src/data/certificationsData.ts

export interface Certification {
    id: string;
    title: string;
    issuer: string;
    year: string;
    expiryDate: string;
    category: string;
    description: string;
    pdfUrl: string;
    thumbnailUrl: string;
  }
  
  export const certifications: Certification[] = [
    {
      id: 'iso9001',
      title: 'ISO 9001:2015',
      issuer: 'Q-AID INSPECTION S.r.l.',
      year: '2005',
      expiryDate: '27/07/2026',
      category: 'qualità',
      description: "Certificazione del Sistema di Gestione della Qualità per la posa in opera, manutenzione e ristrutturazione di impianti automatici per la segnaletica luminosa e la sicurezza del traffico ferroviario.",
      pdfUrl: '/certificazioni/9001-2024.pdf',
      thumbnailUrl: '/certificazioni/iso9001-thumb.jpg'
    },
    {
      id: 'iso14001',
      title: 'ISO 14001:2015',
      issuer: 'Q-Aid Assessment & Certification',
      year: '2017',
      expiryDate: '17/05/2026',
      category: 'ambiente',
      description: "Certificazione del Sistema di Gestione Ambientale per la posa in opera, manutenzione e ristrutturazione di impianti automatici per la segnaletica luminosa e la sicurezza del traffico ferroviario.",
      pdfUrl: '/certificazioni/iso14001.pdf',
      thumbnailUrl: '/certificazioni/iso14001-thumb.jpg'
    },
    {
      id: 'iso45001',
      title: 'ISO 45001:2018',
      issuer: 'Q-Aid Assessment & Certification',
      year: '2016',
      expiryDate: '22/12/2028',
      category: 'sicurezza',
      description: "Certificazione del Sistema di Gestione per la Salute e Sicurezza sul Lavoro per la posa in opera, manutenzione e ristrutturazione di impianti automatici per la segnaletica luminosa e la sicurezza del traffico ferroviario.",
      pdfUrl: '/certificazioni/iso45001_new.pdf',
      thumbnailUrl: '/certificazioni/iso45001-thumb.jpg'
    },
    {
      id: 'soa',
      title: 'Attestazione SOA',
      issuer: 'CQOP SOA',
      year: '2020',
      expiryDate: '04/08/2025',
      category: 'qualificazione',
      description: "Attestazione di qualificazione all'esecuzione di lavori pubblici per le categorie OS9 (V) e OS19 (II). Impianti per la segnaletica luminosa e la sicurezza del traffico e impianti di reti di telecomunicazione e di trasmissioni.",
      pdfUrl: '/certificazioni/soa.pdf',
      thumbnailUrl: '/certificazioni/soa-thumb.jpg'
    },
    {
      id: 'cciaaBG',
      title: 'C.C.I.A.A. Bergamo',
      issuer: 'Camera di Commercio di Bergamo',
      year: '1996',
      expiryDate: 'Illimitata',
      category: 'registro',
      description: "Certificato di iscrizione nella sezione ordinaria della Camera di Commercio Industria Artigianato e Agricoltura di Bergamo. Impresa artigiana specializzata in lavori elettrici e telefonici per le ferrovie.",
      pdfUrl: '/certificazioni/cciaa.pdf',
      thumbnailUrl: '/certificazioni/cciaa-thumb.jpg'
    },
    {
      id: 'rfi-lis-c',
      title: 'Qualificazione RFI LIS-C',
      issuer: 'Rete Ferroviaria Italiana',
      year: '2018',
      expiryDate: 'Illimitata',
      category: 'ferroviario',
      description: "Qualificazione per l'esecuzione di lavori di piazzale e di linea per impianti di segnalamento ferroviario. Classe di importo 4 (fino a Euro 2.500.000,00). Validità temporale illimitata a condizione che siano mantenuti nel tempo i requisiti che ne hanno consentito l'attestazione.",
      pdfUrl: '/certificazioni/rfi-lis-c.pdf',
      thumbnailUrl: '/certificazioni/rfi-thumb.jpg'
    }
  ];
