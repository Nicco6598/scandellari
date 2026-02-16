// Definizione dell'interfaccia per i progetti
export interface Progetto {
  id: number;
  titolo: string;
  descrizione: string;
  localita: string;
  anno: string;
  categoria: string;
  cliente?: string;
  coordinate?: {
    lat: number;
    lng: number;
  };
}
  
// Lista di tutti i progetti
export const progettiData: Progetto[] = [
  {
    id: 1,
    titolo: "Linea alta velocità Brescia-Verona",
    categoria: "oleodinamica",
    descrizione: "Installazione e messa in opera di sistemi oleodinamici avanzati per la linea alta velocità Brescia-Verona.",
    localita: "Brescia-Verona",
    anno: "2023",
    cliente: "Rete Ferroviaria Italiana (RFI)"
  },
  {
    id: 2,
    titolo: "Linea alta velocità Milano-Genova III Valico dei Giovi",
    categoria: "oleodinamica",
    descrizione: "Implementazione di sistemi oleodinamici di ultima generazione per il terzo valico dei Giovi sulla linea Milano-Genova.",
    localita: "Milano-Genova",
    anno: "2022",
    cliente: "Consorzio Collegamenti Italia"
  },
  {
    id: 3,
    titolo: "Linea Arona-Domodossola ACC Stresa-Belgirate",
    categoria: "realizzazione",
    descrizione: "Realizzazione dell'Apparato Centrale Computerizzato (ACC) per il tratto Stresa-Belgirate sulla linea Arona-Domodossola.",
    localita: "Stresa-Belgirate",
    anno: "2024",
    cliente: "Ferrovie Nord"
  },
  {
    id: 4,
    titolo: "Linea Colico-Sondrio-Tirano Adeguamento a PRG",
    categoria: "infrastrutture",
    descrizione: "Adeguamento della linea Colico-Sondrio-Tirano secondo il Piano Regolatore Generale ferroviario.",
    localita: "Colico-Sondrio-Tirano",
    anno: "2023",
    cliente: "Rete Ferroviaria Italiana (RFI)"
  },
  {
    id: 5,
    titolo: "Linea Colico-Sondrio-Tirano ACC Sondrio",
    categoria: "realizzazione",
    descrizione: "Installazione e configurazione dell'Apparato Centrale Computerizzato (ACC) presso la stazione di Sondrio sulla linea Colico-Sondrio-Tirano.",
    localita: "Sondrio",
    anno: "2022",
    cliente: "Rete Ferroviaria Italiana (RFI)"
  }
];
  
// Estrai categorie uniche dai progetti
export const categorieProgetti = ['tutti', ...Array.from(new Set(progettiData.map(progetto => progetto.categoria.toLowerCase())))];
