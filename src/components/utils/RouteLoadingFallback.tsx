import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoadingState from './LoadingState';

const ROUTE_LOADING_COPY: Array<{
  description: string;
  label: string;
  match: (pathname: string) => boolean;
}> = [
  {
    label: 'Dettaglio Progetto',
    description: 'Stiamo preparando immagini, contenuti e mappa del progetto selezionato.',
    match: (pathname) => pathname.startsWith('/progetti/'),
  },
  {
    label: 'Progetti',
    description: 'Stiamo caricando portfolio, filtri e contenuti della pagina progetti.',
    match: (pathname) => pathname === '/progetti',
  },
  {
    label: 'Competenze',
    description: 'Stiamo preparando competenze, contenuti e materiali di approfondimento.',
    match: (pathname) => pathname.startsWith('/competenze'),
  },
  {
    label: 'Contatti',
    description: 'Stiamo caricando la pagina contatti e le informazioni utili per raggiungerci.',
    match: (pathname) => pathname === '/contatti',
  },
  {
    label: 'Area Admin',
    description: 'Stiamo preparando la sezione amministrativa richiesta.',
    match: (pathname) => pathname.startsWith('/admin'),
  },
];

function RouteLoadingFallback() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsVisible(true);
    }, 140);

    return () => {
      window.clearTimeout(timeoutId);
      setIsVisible(false);
    };
  }, [location.pathname]);

  const copy = useMemo(() => {
    return ROUTE_LOADING_COPY.find((item) => item.match(location.pathname)) ?? {
      label: 'Pagina',
      description: 'Stiamo caricando la pagina richiesta.',
    };
  }, [location.pathname]);

  if (!isVisible) return null;

  return (
    <LoadingState
      variant="overlay"
      label={copy.label}
      description={copy.description}
    />
  );
}

export default RouteLoadingFallback;
