import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import maplibreCss from 'maplibre-gl/dist/maplibre-gl.css?inline';
import { useRef } from 'react';
import { useInjectedHeadStyle } from '../../hooks/useInjectedHeadStyle';
import { usePreventWheelScroll } from '../../hooks/usePreventWheelScroll';
import { useRafViewStateChange } from '../../hooks/useRafViewStateChange';

type Theme = 'light' | 'dark';
type ViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
};

type CompanyMapProps = {
  onViewStateChange: (next: ViewState) => void;
  theme: Theme;
  viewState: ViewState;
};

const companyCoords = { longitude: 9.59088, latitude: 45.51263 };

function CompanyMap({ onViewStateChange, theme, viewState }: CompanyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useInjectedHeadStyle(maplibreCss);
  const handleViewStateChange = useRafViewStateChange(onViewStateChange);
  usePreventWheelScroll(containerRef);

  return (
    <div
      ref={containerRef}
      className="aspect-square bg-black/8 dark:bg-dark-surface border border-black/10 dark:border-white/5 overflow-hidden group hover:border-primary/30 transition-all relative"
    >
      <Map
        {...viewState}
        attributionControl={false}
        mapStyle={theme === 'dark'
          ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
          : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'}
        onMove={(event) => handleViewStateChange({
          latitude: event.viewState.latitude,
          longitude: event.viewState.longitude,
          zoom: event.viewState.zoom,
        })}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <Marker
          longitude={companyCoords.longitude}
          latitude={companyCoords.latitude}
          anchor="center"
        >
          <div className="relative group cursor-pointer flex items-center justify-center">
            <div className="absolute w-10 h-10 border border-primary/30 scale-0 group-hover:scale-110 transition-transform duration-500" />
            <div className="w-5 h-5 bg-white dark:bg-black border-2 border-primary z-10 transition-all duration-300 group-hover:bg-primary group-hover:border-white group-hover:rotate-45 shadow-[0_0_15px_rgba(37,99,235,0.3)]" />
          </div>
        </Marker>
        <Popup
          longitude={companyCoords.longitude}
          latitude={companyCoords.latitude}
          anchor="top"
          offset={15}
          closeButton={false}
          className="maplibre-popup-custom"
        >
          <div className="p-4 min-w-[180px] bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 shadow-xl">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">Sede Operativa</span>
            <h4 className="font-black uppercase text-xs tracking-tight text-black dark:text-white">Scandellari Giacinto s.n.c.</h4>
          </div>
        </Popup>
      </Map>
    </div>
  );
}

export default CompanyMap;
