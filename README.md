# Scandellari — Sito aziendale con area Admin

Single Page Application sviluppata in React + TypeScript per presentazione aziendale (sezione pubblica) e gestione contenuti (area Admin protetta).

## Cosa dimostra (per recruiter)

- Struttura di un progetto moderno Vite/React con routing e lazy-loading
- Pattern di separazione tra UI (pages/components) e data layer (services Supabase)
- Gestione stato globale (tema + auth) via Context
- Integrazione di mappe, PDF viewer e tracciamento Analytics in una SPA

## Funzionalità principali

- Sezione pubblica: home, competenze, progetti + dettaglio, chi siamo, contatti, certificazioni, carriere, pagine policy
- Area Admin: login e CRUD per progetti/competenze/offerte, dashboard con attività recenti
- UI: tema chiaro/scuro, animazioni on-scroll, lightbox gallerie
- Mappe: mappa interattiva su pagine progetto
- PDF: visualizzazione documenti/certificazioni e worker dedicato

## Stack

- Frontend: React 19, TypeScript, Vite
- Routing: react-router-dom v7 (rotte pubbliche + /admin con rotte annidate)
- Styling: Tailwind CSS (tema chiaro/scuro tramite classi su root)
- Forms/validazione: react-hook-form + zod
- Backend/DB/Auth: Supabase (@supabase/supabase-js)
- Animazioni/scroll: GSAP (ScrollTrigger) + Lenis
- Mappe: react-map-gl (MapLibre) + maplibre-gl
- PDF: react-pdf + pdfjs-dist
- Media: yet-another-react-lightbox

## Struttura repository

```
public/                 # asset statici (PDF, worker PDF, favicon, sitemap, ecc.)
src/
  assets/               # immagini e asset importati da React
  components/           # componenti riutilizzabili (layout, sezioni, utils, admin)
  context/              # ThemeContext, AuthContext, MobileMenuContext
  data/                 # dataset/fixture locali (contenuti statici)
  pages/                # pagine pubbliche e admin (UI)
  supabase/             # config e servizi per accesso dati/auth/activity
  types/                # tipi TS (modelli e payload)
  utils/                # helper condivisi
```

## Avvio in locale

Prerequisiti: Node.js 18+ e pnpm (consigliato, presente `pnpm-lock.yaml`).

```bash
pnpm install
pnpm dev
```

## Script disponibili

- `pnpm dev`: avvia Vite in locale (porta 3000)
- `pnpm build`: typecheck (`tsc`) + build di produzione (`vite build`, output `build/`)
- `pnpm preview`: preview della build

## Variabili d’ambiente

Creare un file `.env.local` (non versionato) con:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Opzionale:

```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Deploy

- Configurazione pronta per Vercel in `vercel.json` (build via `pnpm build`, output `build/`)
- Regole di rewrite per SPA (tutte le rotte non-statiche puntano a `index.html`)
- Header dedicati per PDF e `pdf-worker` in `public/`

## Punti chiave nel codice

- Routing e lazy-loading: `src/App.tsx`
- Protezione area Admin: `src/components/admin/ProtectedRoute.tsx` + `src/components/admin/AdminLayout.tsx`
- Inizializzazione Supabase + env: `src/supabase/config.ts`
- Servizi data layer: `src/supabase/services.ts`
- Tema chiaro/scuro: `src/context/ThemeContext.tsx`

## Licenza

Tutti i diritti riservati.
