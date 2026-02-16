// src/data/competenzeData.tsx
import React from 'react';

interface ProgettoCorrelato {
  slug: string;
  titolo: string;
  descrizione: string;
  immagine?: string;
}

interface Competenza {
  id: string;
  categoria: string;
  titolo: string;
  descrizioneBreve: string;
  descrizioneLunga: string;
  icona: React.ReactNode;
  caratteristiche: string[];
  lineeUtilizzo: string[];
  applicazioni?: string[];
  immagine?: string;
  progettiCorrelati?: ProgettoCorrelato[];
}

export const competenzeData: Competenza[] = [
  // SISTEMI OLEODINAMICI - EVIDENZIATI
  {
    id: 'sistemi-oleodinamici',
    categoria: 'oleodinamica',
    titolo: "Sistemi Oleodinamici Ferroviari",
    descrizioneBreve: "Installazione e manutenzione di sistemi oleodinamici per infrastrutture ferroviarie ad alta velocità",
    descrizioneLunga: 
      "I sistemi oleodinamici rappresentano una tecnologia cruciale nel settore ferroviario, dove la nostra azienda ha consolidato una competenza specialistica nel panorama italiano. Questi sistemi sfruttano la potenza idraulica per movimentare scambi e componenti critici dell'infrastruttura ferroviaria, garantendo prestazioni di alta precisione e affidabilità anche in condizioni ambientali estreme e con carichi elevati. Ci siamo specializzati nell'installazione e manutenzione di sistemi oleodinamici avanzati. La nostra expertise comprende i sistemi TANG. 0,040 (cuore punta fissa e cuore punta mobile), TANG. 0,022 (cuore punta mobile), TANG. 0,074 (cuore punta mobile), e le innovative M.O.T (Manovra oleodinamica in traversa). Queste tecnologie richiedono competenze altamente specializzate che ci distinguono nel mercato italiano.",
    icona: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    caratteristiche: [
      "Installazione di sistemi oleodinamici TANG. 0,040 (cuore punta fissa e mobile)",
      "Sistemi oleodinamici TANG. 0,074 (cuore punta mobile)",
      "Sistemi oleodinamici TANG. 0,022 (cuore punta mobile)",
    ],
    lineeUtilizzo: [
      "Linee AV-AC (alta velocità & alta capacità)",
      "Milano-Torino (P.C Marcallo-P.M Alice-Cigliano-Novara)",
      "Milano-Genova [Terzo Valico dei Giovi (Tortona)]",
      "Milano-Brescia (Pioltello-P.J.Casirate-P.M ADDA)",
      "Brescia-Verona (Bivio Mazzano-In corso di lavorazione)",
      "Milano-Bologna (Tavazzano-P.J Melegnano-Rogoredo)",
      "Cintura di Milano (Milano Certosa-Rho)"
    ],
    applicazioni: [
      "Manovra di deviatoi per linee ad alta velocità"
    ],
    immagine: "/images/sistemi-oleodinamici.jpg",
    progettiCorrelati: [
      {
        slug: "alta-velocita-milano-torino",
        titolo: "Linea AV Milano-Torino",
        descrizione: "Installazione di sistemi oleodinamici M.O.T per deviatoi ad alta velocità",
        immagine: "/images/progetto-av-milano-torino.jpg"
      },
      {
        slug: "stazione-roma-termini",
        titolo: "Ammodernamento Roma Termini",
        descrizione: "Implementazione di sistemi di manovra con tecnologia oleodinamica TANG. 0,074",
        immagine: "/images/progetto-roma-termini.jpg"
      }
    ]
  },
  {
    id: 'sistemi-elettromeccanici',
    categoria: 'realizzazione',
    titolo: "Sistemi Elettromeccanici Ferroviari",
    descrizioneBreve: "Installazione e manutenzione di sistemi elettromeccanici per azionamento di scambi, segnali e passaggi a livello",
    descrizioneLunga: 
      "I sistemi elettromeccanici rappresentano una componente fondamentale dell'infrastruttura ferroviaria, combinando la robustezza meccanica con la versatilità del controllo elettrico per garantire operazioni precise e affidabili. La nostra azienda vanta una competenza specialistica nell'installazione, configurazione e manutenzione di questi sistemi, che includono azionamenti per deviatoi, meccanismi per segnali, barriere per passaggi a livello e altri apparati di sicurezza. La tecnologia elettromeccanica, pur essendo evoluta nel tempo, mantiene un ruolo cruciale in molti contesti operativi grazie alla sua affidabilità intrinseca e alla capacità di funzionare anche in condizioni ambientali sfidanti. Il nostro approccio integra la conoscenza approfondita dei principi meccanici con le moderne tecniche di controllo elettrico, offrendo soluzioni ottimizzate che garantiscono elevati standard di sicurezza, durata eccezionale e costi di manutenzione contenuti. Ogni installazione viene personalizzata in base alle specifiche esigenze operative, con particolare attenzione all'integrazione con i sistemi di segnalamento e controllo esistenti.",
    icona: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
    caratteristiche: [
      "Installazione di azionamenti elettromeccanici per deviatoi ferroviari",
      "Implementazione di meccanismi per segnali",
      "Sistemi di controllo per barriere di passaggi a livello automatici",
      "Enti di piazzale",
      "Circuiti di comando e controllo con sicurezza intrinseca",
      "Interfacciamento con apparati centrali e sistemi di blocco"
    ],
    lineeUtilizzo: [
    ],
    applicazioni: [
      "Azionamento di deviatoi su linee ferroviarie tradizionali",
      "Controllo di segnali di protezione e partenza",
      "Automazione di passaggi a livello",
      "Sistemi di blocco elettromeccanico",
      "Pedali conta-assi e rilevatori di presenza",
      "Impianti in aree remote o con alimentazione limitata",
      "Sistemi di riserva per tecnologie elettroniche avanzate"
    ],
    immagine: "/images/sistemi-elettromeccanici.jpg"
  },
  {
    id: 'mot-specialistici',
    categoria: 'oleodinamica',
    titolo: "Manovre Oleodinamiche in Traversa (MOT)",
    descrizioneBreve: "Tecnologia avanzata per l'azionamento di deviatoi con sistema integrato in traversa",
    descrizioneLunga: 
      "Le Manovre Oleodinamiche in Traversa (MOT) rappresentano una delle più avanzate tecnologie per la movimentazione di deviatoi ferroviari, in cui la nostra azienda ha sviluppato una competenza d'eccellenza. Questa soluzione innovativa si distingue per l'integrazione del sistema di azionamento direttamente nella traversa ferroviaria, garantendo un'installazione compatta e protetta dagli agenti esterni. Il cuore del sistema è un circuito oleodinamico ad alta pressione che permette movimenti precisi, potenti e affidabili anche nelle condizioni più gravose. La nostra specializzazione in MOT ci posiziona tra i pochissimi operatori in Italia in grado di installare, configurare e manutenere questi sistemi sofisticati, che stanno progressivamente sostituendo le tecnologie tradizionali grazie alla loro superiore efficienza e sicurezza operativa. Ogni installazione richiede competenze multidisciplinari che spaziano dall'idraulica avanzata all'elettronica di controllo, fino alla profonda conoscenza della geometria e dinamica ferroviaria.",
    icona: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    caratteristiche: [
    ],
    lineeUtilizzo: [
      "Alta Velocità Roma-Napoli",
      "Passante ferroviario di Milano",
      "Nodo AV di Bologna",
      "Linea Torino-Lione (tratto italiano)",
      "Corridoio Pisa-Livorno-Roma",
      "Quadruplicamento Firenze-Bologna",
      "Stazione Porta Susa di Torino"
    ],
    applicazioni: [
      "Linee ferroviarie ad alta velocità",
      "Nodi ferroviari con spazi di installazione limitati",
      "Stazioni con alta frequenza di manovre",
      "Aree con condizioni climatiche estreme",
      "Tratte ferroviarie con requisiti di silenziosità elevati"
    ],
    immagine: "/images/mot-sistema.jpg"
  },
  
  // SEGNALAMENTO
  {
    id: 'impianti-segnalamento',
    categoria: 'segnalamento',
    titolo: "Impianti di Segnalamento",
    descrizioneBreve: "Installazione di sistemi di segnalamento ferroviario per linee tradizionali e ad alta velocità",
    descrizioneLunga: 
      "I sistemi di segnalamento ferroviario rappresentano l'infrastruttura essenziale per garantire la sicurezza e l'efficienza della circolazione dei treni. La nostra azienda si distingue per la profonda esperienza nell'installazione e manutenzione di questi sistemi, che spaziano dai sistemi si segnaletica tradizionale  fino ai più avanzati sistemi di controllo digitale della marcia dei treni. Offriamo soluzioni complete che includono l'installazione e la manutenzione di sistemi di segnalamento conformi ai più rigorosi standard di sicurezza nazionali e internazionali.",
    icona: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    caratteristiche: [
      "Realizzazioni di piazzali canalizzazioni/dorsali di Cunicoli, Tubazioni, Canalette",
      "Posa di cavi IS (segnalamento) e giunzioni",
      "Posa cavi FO (Fibra ottica) e giunzioni",
      "Posa cavi SCMT e giunzioni",
      "Installazione di apparati centrali computerizzati",
      "Posa enti di piazzale",
      "Posa armadi di cabina"
    ],
    lineeUtilizzo: [
      "Compartimento di Milano",
      "Compartimento di Bologna",
      "Compartimento di Torino",
      "Compartimento di Verona"
    ],
    applicazioni: [
      "Linee ferroviarie principali e regionali",
      "Stazioni ferroviarie e nodi di interscambio",
      "Linee ad alta velocità",
      "Passaggi a livello automatizzati",
      "Gallerie e tratti con condizioni di visibilità critica",
      "Interconnessioni tra reti ferroviarie diverse"
    ],
    immagine: "/images/segnalamento-ferroviario.jpg"
  },
  {
    id: 'impianti-scmt',
    categoria: 'segnalamento',
    titolo: "Impianti S.C.M.T.",
    descrizioneBreve: "Installazione di Sistemi di Controllo Marcia Treno per la sicurezza della circolazione ferroviaria",
    descrizioneLunga: 
      "Il Sistema di Controllo Marcia Treno (S.C.M.T.) rappresenta uno dei più importanti sviluppi nella sicurezza ferroviaria italiana, progettato per prevenire incidenti dovuti a errori umani o malfunzionamenti tecnici. La nostra azienda vanta una competenza specialistica nell'installazione, configurazione e manutenzione di questi sistemi complessi che supervisionano costantemente la velocità del treno e intervengono automaticamente in caso di superamento delle soglie consentite o di segnali di pericolo non rispettati. L'S.C.M.T. si compone di una parte a terra, con boe di trasmissione installate lungo la linea, e una parte di bordo installata sui treni, in costante comunicazione tra loro. La nostra esperienza copre l'intero ciclo di vita dell'impianto, dalla progettazione iniziale alla verifica funzionale, fino alla manutenzione programmata, garantendo la conformità agli standard RFI e assicurando l'interoperabilità con le altre tecnologie di segnalamento presenti sulla rete ferroviaria italiana.",
    icona: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    caratteristiche: [
      "Installazione di boe di trasmissione codificate lungo la linea",
      "Integrazione con apparati di segnalamento esistenti",
      "Picchettazioni e campagna misure"
    ],
    lineeUtilizzo: [
      "Linea Milano - Bologna",
      "Linea Bologna - Ancona",
      "Linea Treviglio - Brescia",
      "Linea Cremona - Treviglio",
      "Linea Brescia - Cremona",
      "Linea Milano - Como - Chiasso",
      "Linea Milano - Lecco",
      "Linea Colico - Tirano",
      "Linea Colico - Chiavenna"
    ],
    applicazioni: [
      "Linee ferroviarie principali della rete RFI"
    ],
    immagine: "/images/scmt-sistema.jpg"
  },
  
  // AUTOMAZIONE
  {
    id: 'impianti-acei',
    categoria: 'realizzazione',
    titolo: "Impianti A.C.E.I.",
    descrizioneBreve: "Installazione di Apparati Centrali Elettrici a Itinerari per il controllo centralizzato di stazioni",
    descrizioneLunga: 
      "Gli Apparati Centrali Elettrici a Itinerari (A.C.E.I.) rappresentano una tecnologia fondamentale per la gestione integrata e sicura della circolazione ferroviaria nelle stazioni. La nostra azienda si è specializzata nell'installazione, configurazione e manutenzione di questi complessi sistemi che permettono il controllo centralizzato di tutti gli enti di piazzale: segnali, scambi, passaggi a livello e circuiti di binario. Con un A.C.E.I., l'operatore può gestire l'intero traffico ferroviario da un'unica postazione, impostando itinerari completi per l'ingresso, l'uscita e il transito dei treni, con la sicurezza garantita da sofisticati sistemi di interblocco che prevengono comandi potenzialmente pericolosi. La nostra esperienza comprende diverse generazioni di A.C.E.I., dalle versioni elettromeccaniche fino alle più moderne implementazioni computerizzate, mantenendo sempre il focus sulla massima affidabilità e aderenza agli standard di sicurezza richiesti.",
    icona: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    caratteristiche: [
      "Installazione di quadri sinottici e banchi di manovra",
      "Configurazione di relè di sicurezza e sistemi di interblocco",
      "Implementazione di logiche di controllo degli itinerari",
      "Interfacciamento con segnalamento di linea e dispositivi periferici",
      "Sistemi di alimentazione ridondanti e gruppi di continuità",
      "Test funzionali e verifiche di sicurezza",
      "Istruzione del personale operativo"
    ],
    lineeUtilizzo: [
      "Stazioni della Ferrovia del Brennero",
      "Nodo ferroviario di Verona",
      "Stazioni della linea Parma-La Spezia",
      "Ferrovia Aosta-Pré-Saint-Didier",
      "Linea Messina-Siracusa",
      "Stazioni minori della Puglia",
      "Nodo di Terni-Rieti"
    ],
    applicazioni: [
      "Stazioni ferroviarie di piccole e medie dimensioni",
      "Scali merci e terminal intermodali",
      "Posti movimento e bivi ferroviari",
      "Nodi di interscambio tra diverse linee",
      "Depositi e officine ferroviarie"
    ],
    immagine: "/images/acei-sistema.jpg"
  },
  {
    id: 'impianti-acc',
    categoria: 'realizzazione',
    titolo: "Impianti A.C.C.",
    descrizioneBreve: "Installazione di Apparati Centrali Computerizzati per la gestione avanzata delle stazioni",
    descrizioneLunga: 
      "Gli Apparati Centrali Computerizzati (A.C.C.) rappresentano l'evoluzione tecnologica degli A.C.E.I., portando la gestione ferroviaria nell'era digitale con un livello superiore di automazione, sicurezza e diagnostica. La nostra azienda ha sviluppato una competenza specialistica nell'implementazione di questi sistemi avanzati, che utilizzano architetture a microprocessore ridondanti e software certificato secondo i più rigorosi standard di sicurezza. Un A.C.C. consente la gestione completa della circolazione ferroviaria attraverso interfacce grafiche intuitive e potenti funzionalità di automazione che riducono il carico di lavoro degli operatori, permettendo al contempo un controllo più efficiente e sicuro. Copriamo il processo di installazione garantendo sempre la massima affidabilità e continuità del servizio.",
    icona: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    caratteristiche: [
      "Architettura a microprocessore con ridondanza 2oo3",
      "Interfacce operatore con visualizzazione grafica HD",
      "Logiche programmabili conformi a SIL4",
      "Diagnostica avanzata con localizzazione guasti",
      "Integrazione con sistemi CTC e telecomando",
      "Moduli I/O distribuiti con comunicazione sicura",
      "Sistemi di registrazione eventi e data logging"
    ],
    lineeUtilizzo: [
      "Stazione Centrale di Roma Termini",
      "Nodo AV di Firenze Santa Maria Novella",
      "Stazione di Milano Centrale",
      "Stazione di Bologna Centrale",
      "Nodo di Napoli Centrale",
      "Complesso di Torino Porta Nuova",
      "Centro operativo di Reggio Calabria"
    ],
    applicazioni: [
      "Grandi stazioni ferroviarie e nodi metropolitani",
      "Centri di controllo multi-stazione",
      "Posti centrali di supervisione della circolazione",
      "Stazioni di interconnessione ad alta velocità",
      "Piazzali complessi con numerosi enti di sicurezza"
    ],
    immagine: "/images/acc-sistema.jpg"
  },
  
  // MANUTENZIONE
  {
    id: 'manutenzione-impianti',
    categoria: 'manutenzione',
    titolo: "Manutenzione Impianti",
    descrizioneBreve: "Servizi di manutenzione ordinaria e straordinaria per impianti di segnalamento e sicurezza nonchè servizio di pronto intervento su chiamata",
    descrizioneLunga: 
      "La manutenzione degli impianti di segnalamento e sicurezza ferroviaria rappresenta un aspetto cruciale per garantire l'affidabilità e la continuità operativa dell'intera infrastruttura. La nostra azienda offre servizi completi di manutenzione, sia ordinaria che straordinaria, sviluppati sulla base di decenni di esperienza sul campo e una profonda conoscenza tecnica di tutte le tecnologie impiegate nel settore. Il nostro approccio alla manutenzione integra metodologie preventive, predittive e correttive con l'obiettivo di ripristinare rapidamente la piena funzionalità degli impianti e garantire la massima sicurezza della circolazione ferroviaria.",
    icona: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    caratteristiche: [
      "Manutenzione programmata secondo specifiche degli impianti",
      "Interventi correttivi con tempi di risposta garantiti",
      "Gestione ricambi",
      "Documentazione tecnica e reportistica dettagliata",
      "Formazione continua delle squadre tecniche"
    ],
    lineeUtilizzo: [
      "IMC AV Milano Martesana",
      "IMC AV Torino Smistamento",
      "IMC Genova Brignole",
      "IMC Savona"
    ],
    applicazioni: [
      "Impianti di segnalamento di qualsiasi generazione",
      "Sistemi di controllo della marcia dei treni",
      "Apparati centrali elettrici e computerizzati",
      "Sistemi oleodinamici e elettromeccanici",
      "Passaggi a livello e protezioni automatiche"
    ],
    immagine: "/images/manutenzione-impianti.jpg"
  },
  
  // ALTRI IMPIANTI
  {
    id: 'impianti-diffusione-sonora',
    categoria: 'segnalamento',
    titolo: "Impianti Diffusione Sonora",
    descrizioneBreve: "Installazione di sistemi audio per comunicazioni e annunci nelle stazioni ferroviarie",
    descrizioneLunga: 
      "Gli impianti di diffusione sonora sono componenti essenziali per la comunicazione con i passeggeri nelle stazioni ferroviarie, garantendo la trasmissione chiara e intelligibile di annunci relativi alla circolazione dei treni, informazioni di servizio e comunicazioni di emergenza. La nostra azienda si è specializzata nell'installazione e manutenzione di questi sistemi, con particolare attenzione alla qualità acustica.",
    icona: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728" />
      </svg>
    ),
    caratteristiche: [
      "Stazioni di annuncio automatiche e manuali",
      "Integrazione con sistemi informativi e di emergenza"
    ],
    lineeUtilizzo: [
      "ACC IMC Milano Martesana"
    ],
    applicazioni: [
      "Stazioni ferroviarie di ogni dimensione",
      "Banchine e pensiline di attesa",
      "Atri e aree di transito",
      "Sale d'attesa e aree commerciali",
      "Sottopassaggi e aree di accesso",
      "Centri di controllo e sale operative"
    ],
    immagine: "/images/diffusione-sonora.jpg"
  },
  {
    id: 'telecomunicazioni',
    categoria: 'segnalamento',
    titolo: "Impianti T.L.C.",
    descrizioneBreve: "Installazione di sistemi di telecomunicazione e reti in fibra ottica per infrastrutture ferroviarie",
    descrizioneLunga: 
      "I sistemi di telecomunicazione (T.L.C.) rappresentano un'infrastruttura fondamentale per il funzionamento efficiente e sicuro delle moderne reti ferroviarie, garantendo la comunicazione tra personale, treni, apparati di controllo e centri operativi. La nostra azienda offre soluzioni complete per l'installazione e la manutenzione di questi sistemi complessi, che integrano tecnologie analogiche e digitali per soddisfare i rigorosi requisiti operativi e di sicurezza del settore ferroviario. Siamo specializzati nell'implementazione di reti in fibra ottica ad alta affidabilità, componente cruciale dell'infrastruttura ferroviaria moderna che garantisce la trasmissione dati sicura e veloce necessaria per il controllo della circolazione.",
    icona: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
      </svg>
    ),
    caratteristiche: [
      "Installazione di sistemi di telecomunicazioni ferroviarie"
    ],
    lineeUtilizzo: [
      "Compartimento di Milano",
      "Compartimento di Torino"
    ],
    applicazioni: [
      "Posa cavi T.L.C",
      "Posa armadi T.L.C"
    ],
    immagine: "/images/telecomunicazioni-ferroviarie.jpg"
  }
];
