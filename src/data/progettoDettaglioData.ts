// Informazioni dettagliate per ogni singolo progetto
export interface ProgettoDettaglio {
  id: number;
  titolo: string;
  categoria: string;
  descrizione: string;
  descrizioneLunga: string;
  localita: string;
  anno: string;
  caratteristiche: string[];
  risultati: string[];
  // Campi aggiuntivi per la pagina di dettaglio
  cliente?: string;
  durata?: string;
  tecnologie?: string[];
  sfide?: string[];
  immaginiGalleria?: string[];
}

export const progettiDettagliatiData: ProgettoDettaglio[] = [
{
  id: 1,
  titolo: "Linea alta velocità Brescia-Verona",
  categoria: "oleodinamica",
  descrizione: "Installazione e messa in opera di sistemi oleodinamici avanzati per la linea alta velocità Brescia-Verona.",
  descrizioneLunga: "Questo progetto strategico ha comportato la progettazione, installazione e collaudo di sistemi oleodinamici all'avanguardia lungo la tratta Brescia-Verona della linea alta velocità. I sistemi implementati garantiscono la movimentazione precisa e affidabile degli scambi ferroviari, delle barriere di sicurezza e altri componenti critici dell'infrastruttura. Particolare attenzione è stata dedicata alla resistenza agli agenti atmosferici e alla durabilità dei componenti, con soluzioni innovative per la gestione delle temperature estreme e delle condizioni di carico eccezionali.",
  localita: "Brescia-Verona",
  anno: "2023",
  cliente: "Rete Ferroviaria Italiana (RFI)",
  durata: "16 mesi",
  tecnologie: [
    "Centrali oleodinamiche ad alta pressione",
    "Attuatori a doppio effetto con sensori integrati",
    "Sistemi di monitoraggio in tempo reale",
    "Valvole proporzionali elettroniche",
    "Tecnologia anti-congelamento per fluidi idraulici"
  ],
  sfide: [
    "Installazione in condizioni di traffico attivo",
    "Gestione delle condizioni climatiche estreme della pianura padana",
    "Integrazione con i sistemi di segnalamento esistenti",
    "Rispetto dei rigidi vincoli temporali del progetto generale AV",
    "Minimizzazione dell'impatto ambientale dei fluidi idraulici"
  ],
  caratteristiche: [
    "Sistemi oleodinamici ridondanti per massima affidabilità",
    "Pressioni operative fino a 350 bar",
    "Attuatori con corsa calibrata per scambi ad alta velocità",
    "Sistema di diagnostica remota avanzata",
    "Soluzioni ecologiche con fluidi biodegradabili"
  ],
  risultati: [
    "Tempo di risposta degli attuatori ridotto del 40%",
    "Affidabilità del sistema superiore al 99.98%",
    "Riduzione del 30% dei costi di manutenzione rispetto ai sistemi tradizionali",
    "Zero incidenti di sicurezza dall'attivazione",
    "Implementazione completata con 2 mesi di anticipo sul cronoprogramma"
  ],
  immaginiGalleria: [
    "brescia-verona-1",
    "brescia-verona-2",
    "brescia-verona-3"
  ]
},
{
  id: 2,
  titolo: "Linea alta velocità Milano-Genova III Valico dei Giovi",
  categoria: "oleodinamica",
  descrizione: "Implementazione di sistemi oleodinamici di ultima generazione per il terzo valico dei Giovi sulla linea Milano-Genova.",
  descrizioneLunga: "Il progetto ha previsto la realizzazione di un sistema oleodinamico complesso per la linea AV/AC Milano-Genova nel tratto del Terzo Valico dei Giovi, caratterizzato da una morfologia particolarmente impegnativa. L'intervento ha incluso la progettazione e installazione di sistemi per il controllo degli scambi, dei dispositivi di sicurezza in galleria e dei meccanismi di compensazione delle dilatazioni termiche dei binari. La soluzione implementata è stata specificamente sviluppata per operare in modo affidabile nelle lunghe gallerie del tracciato, con particolare attenzione ai requisiti di sicurezza antincendio e alla facilità di manutenzione in spazi confinati.",
  localita: "Milano-Genova",
  anno: "2022",
  cliente: "Consorzio Collegamenti Italia",
  durata: "24 mesi",
  tecnologie: [
    "Sistemi oleodinamici certificati per ambienti confinati",
    "Fluidi idraulici resistenti al fuoco (HFD-U)",
    "Sensori di pressione e temperatura con trasmissione wireless",
    "Accumulatori idropneumatici ad alta capacità",
    "Sistemi di filtrazione multistadio"
  ],
  sfide: [
    "Operatività in spazi ristretti delle gallerie ferroviarie",
    "Gestione dei requisiti di sicurezza antincendio",
    "Installazione in pendenze significative (fino al 35‰)",
    "Coordinamento con molteplici appaltatori internazionali",
    "Minimizzazione dell'impatto acustico dei sistemi di pompaggio"
  ],
  caratteristiche: [
    "Centrale oleodinamica modulare distribuita",
    "Sistema di backup energetico integrato",
    "Monitoraggio remoto con allarmi predittivi",
    "Cablaggio e tubazioni ignifughe certificate",
    "Capacità operativa continuativa 24/7 con manutenzione programmata"
  ],
  risultati: [
    "Completamento del progetto entro i termini contrattuali",
    "Superamento di tutti i test di sicurezza al primo collaudo",
    "Riduzione del 25% del consumo energetico rispetto ai sistemi convenzionali",
    "Tempo medio di intervento manutentivo ridotto del 60%",
    "Sistema operativo al 100% anche durante eventi meteorologici estremi"
  ],
  immaginiGalleria: [
    "milano-genova-1",
    "milano-genova-2",
    "milano-genova-3"
  ]
},
{
  id: 3,
  titolo: "Linea Arona-Domodossola ACC Stresa-Belgirate",
  categoria: "realizzazione",
  descrizione: "Realizzazione dell'Apparato Centrale Computerizzato (ACC) per il tratto Stresa-Belgirate sulla linea Arona-Domodossola.",
  descrizioneLunga: "Il progetto ha previsto l'implementazione di un moderno Apparato Centrale Computerizzato (ACC) per il controllo della circolazione ferroviaria nel tratto Stresa-Belgirate della linea Arona-Domodossola. L'intervento ha sostituito i precedenti sistemi elettromeccanici con una soluzione digitale integrata, migliorando significativamente l'affidabilità e la capacità di gestione del traffico. Il sistema implementa logiche avanzate per l'ottimizzazione della circolazione ferroviaria in un'area caratterizzata da elevati flussi turistici stagionali e dalla vicinanza con il Lago Maggiore, con conseguenti sfide ambientali specifiche.",
  localita: "Stresa-Belgirate",
  anno: "2024",
  cliente: "Ferrovie Nord",
  durata: "14 mesi",
  tecnologie: [
    "Architettura ACC 2+ con ridondanza quadrupla",
    "Interfacce interlocking di nuova generazione",
    "Sistema di elaborazione fail-safe SIL4",
    "Postazioni operatore ergonomiche con display 4K",
    "Rete di comunicazione in fibra ottica dedicata"
  ],
  sfide: [
    "Migrazione da sistemi legacy senza interruzione del servizio",
    "Protezione degli impianti da condizioni lacustri (umidità e nebbia)",
    "Gestione dei picchi di traffico stagionali",
    "Integrazione con i sistemi delle stazioni turistiche",
    "Rispetto dei vincoli paesaggistici per le installazioni esterne"
  ],
  caratteristiche: [
    "Controllo centralizzato di 28 enti di piazzale",
    "Diagnostica avanzata con rilevamento predittivo dei guasti",
    "Interfaccia operatore personalizzata con macro operative",
    "Gestione automatizzata delle precedenze in caso di ritardi",
    "Sistemi di protezione ambientale IP67 per apparati esterni"
  ],
  risultati: [
    "Aumento della capacità di linea del 35%",
    "Riduzione dei ritardi sistematici dell'85%",
    "Tempi di ripristino dopo anomalie ridotti del 70%",
    "Miglioramento della puntualità dei treni (+22%)",
    "Significativa riduzione dei costi operativi annuali (-40%)"
  ],
  immaginiGalleria: [
    "stresa-belgirate-1",
    "stresa-belgirate-2",
    "stresa-belgirate-3"
  ]
},
{
  id: 4,
  titolo: "Linea Colico-Sondrio-Tirano Adeguamento a PRG",
  categoria: "infrastrutture",
  descrizione: "Adeguamento della linea Colico-Sondrio-Tirano secondo il Piano Regolatore Generale ferroviario.",
  descrizioneLunga: "Questo progetto strategico ha comportato l'adeguamento completo della linea Colico-Sondrio-Tirano agli standard previsti dal Piano Regolatore Generale ferroviario, con particolare focus sulla modernizzazione dell'infrastruttura, miglioramento della capacità e adeguamento agli standard europei di interoperabilità. L'intervento ha incluso la modifica dei piani di stazione, l'adeguamento dei marciapiedi, il rinnovamento del binario e della massicciata, e l'implementazione di nuovi sistemi di drenaggio lungo l'intera tratta. Il progetto riveste particolare importanza per il collegamento con la Svizzera e per il supporto allo sviluppo turistico della Valtellina.",
  localita: "Colico-Sondrio-Tirano",
  anno: "2023",
  cliente: "Rete Ferroviaria Italiana (RFI)",
  durata: "30 mesi",
  tecnologie: [
    "Tecnologie di rilievo laser scanner 3D",
    "Sistemi di progettazione BIM 6D",
    "Macchinari per rinnovamento binari ad alta produttività",
    "Materiali compositi per opere civili",
    "Tecniche di consolidamento terreni ecocompatibili"
  ],
  sfide: [
    "Operatività in un contesto alpino con condizioni climatiche variabili",
    "Mantenimento del servizio ferroviario durante i lavori",
    "Coordinamento con numerosi stakeholder locali e transfrontalieri",
    "Gestione dei vincoli idrogeologici lungo il percorso fluviale",
    "Adeguamento alle normative di due paesi (Italia e Svizzera)"
  ],
  caratteristiche: [
    "Rinnovamento di 130 km di binario",
    "Adeguamento di 12 stazioni e 8 fermate",
    "Implementazione di un nuovo sistema di drenaggio sostenibile",
    "Risanamento di 5 viadotti storici",
    "Potenziamento della capacità elettrica della linea"
  ],
  risultati: [
    "Incremento della velocità commerciale del 25%",
    "Aumento della capacità di traffico del 40%",
    "Riduzione dei tempi di percorrenza di 15 minuti sull'intera tratta",
    "Miglioramento dell'accessibilità per persone a mobilità ridotta in tutte le stazioni",
    "Significativa riduzione delle interruzioni dovute a eventi meteorologici"
  ],
  immaginiGalleria: [
    "colico-tirano-prg-1",
    "colico-tirano-prg-2",
    "colico-tirano-prg-3"
  ]
},
{
  id: 5,
  titolo: "Linea Colico-Sondrio-Tirano ACC Sondrio",
  categoria: "realizzazione",
  descrizione: "Installazione e configurazione dell'Apparato Centrale Computerizzato (ACC) presso la stazione di Sondrio sulla linea Colico-Sondrio-Tirano.",
  descrizioneLunga: "Il progetto ha previsto la realizzazione di un moderno Apparato Centrale Computerizzato (ACC) presso il nodo strategico di Sondrio, sulla linea Colico-Sondrio-Tirano. L'intervento ha incluso la completa sostituzione dell'apparato di controllo della circolazione preesistente con un sistema digitale avanzato, l'implementazione di nuove logiche di gestione del traffico e l'integrazione con i sistemi di informazione al pubblico. La stazione di Sondrio rappresenta un importante hub per il traffico passeggeri e merci della Valtellina, con collegamenti sia verso Milano che verso la Svizzera.",
  localita: "Sondrio",
  anno: "2022",
  cliente: "Rete Ferroviaria Italiana (RFI)",
  durata: "12 mesi",
  tecnologie: [
    "Sistema ACC multiprocessore con ridondanza 2oo3",
    "Tecnologia a oggetti per la modellazione degli enti di piazzale",
    "Interfacce operatore di ultima generazione",
    "Reti di comunicazione MPLS ridondate",
    "Interlocking computer-based con certificazione SIL4"
  ],
  sfide: [
    "Migrazione dal vecchio apparato senza interruzioni prolungate del servizio",
    "Integrazione con i sistemi di supervisione della linea",
    "Adeguamento degli impianti esistenti alle nuove logiche di controllo",
    "Implementazione in un edificio storico con vincoli architettonici",
    "Formazione del personale locale su tecnologie completamente nuove"
  ],
  caratteristiche: [
    "Controllo centralizzato di tutti gli enti di stazione",
    "Postazione operatore ergonomica con visione d'insieme",
    "Sistema diagnostico integrato con allarmi proattivi",
    "Capacità di gestione automatizzata degli itinerari",
    "Interfacciamento con i sistemi di informazione al pubblico"
  ],
  risultati: [
    "Riduzione del 90% dei guasti operativi",
    "Aumento della capacità di gestione contemporanea dei treni del 50%",
    "Diminuzione dei tempi di formazione degli itinerari dell'80%",
    "Miglioramento significativo dell'informazione ai passeggeri",
    "Ottimizzazione dell'utilizzo dei binari di stazione con riduzione dei ritardi"
  ],
  immaginiGalleria: [
    "acc-sondrio-1",
    "acc-sondrio-2",
    "acc-sondrio-3"
  ]
}
];
