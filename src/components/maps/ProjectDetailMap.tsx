import { Fragment, useEffect, useMemo, useRef } from 'react';
import Map, { Layer, Marker, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import maplibreCss from 'maplibre-gl/dist/maplibre-gl.css?inline';
import { useInjectedHeadStyle } from '../../hooks/useInjectedHeadStyle';
import { usePreventWheelScroll } from '../../hooks/usePreventWheelScroll';
import { useRafViewStateChange } from '../../hooks/useRafViewStateChange';

type Theme = 'light' | 'dark';
type Coordinate = { lat: number; lng: number };
type ViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
};

type ProjectDetailMapProps = {
  localita: string;
  mapPoints: Coordinate[];
  onViewStateChange: (next: ViewState) => void;
  routePoints: Coordinate[];
  theme: Theme;
  viewState: ViewState;
};

function ProjectDetailMap({
  localita,
  mapPoints,
  onViewStateChange,
  routePoints,
  theme,
  viewState,
}: ProjectDetailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useInjectedHeadStyle(maplibreCss);
  const handleViewStateChange = useRafViewStateChange(onViewStateChange);
  usePreventWheelScroll(containerRef, mapPoints.length > 0);

  const lineGeoJSON = useMemo(() => {
    if (routePoints.length < 2) return null;

    return {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: routePoints.map((point) => [point.lng, point.lat] as [number, number]),
        },
        properties: {},
      }],
    };
  }, [routePoints]);

  return (
    <div
      ref={containerRef}
      className="mt-12 w-full h-80 bg-black/8 dark:bg-dark-surface border border-black/10 dark:border-white/5 overflow-hidden relative"
    >
      {mapPoints.length > 0 ? (
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
          {lineGeoJSON ? (
            <Source id="routes" type="geojson" data={lineGeoJSON}>
              <Layer
                id="routes-layer"
                type="line"
                paint={{
                  'line-color': theme === 'dark' ? '#3b82f6' : '#2563eb',
                  'line-width': 4,
                  'line-opacity': 0.8,
                }}
              />
            </Source>
          ) : null}
          {mapPoints.map((point, index) => (
            <Fragment key={`${point.lat}-${point.lng}`}>
              <Marker
                longitude={point.lng}
                latitude={point.lat}
                anchor="center"
              >
                <div className="relative group cursor-pointer flex items-center justify-center">
                  <div className="absolute w-8 h-8 border border-primary/30 scale-0 group-hover:scale-110 transition-transform duration-500" />
                  <div className="w-3 h-3 bg-white dark:bg-black border-[1.5px] border-primary z-10 transition-all duration-300 group-hover:bg-primary group-hover:border-white group-hover:rotate-45" />
                </div>
              </Marker>
              <Popup
                longitude={point.lng}
                latitude={point.lat}
                anchor="top"
                offset={15}
                closeButton={false}
                className="maplibre-popup-custom"
              >
                <div className="p-3 min-w-[120px] bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 shadow-xl">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">
                    Località {index + 1}
                  </span>
                  <h4 className="font-black uppercase text-[10px] tracking-tight text-black dark:text-white leading-tight">
                    {localita.split(/[-/]/)[index]?.trim() || localita}
                  </h4>
                </div>
              </Popup>
            </Fragment>
          ))}
        </Map>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 animate-pulse">
          <div className="w-8 h-8 border border-black/10 dark:border-white/10 rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary/20" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 dark:text-white/20">
            Acquisizione coordinate...
          </span>
        </div>
      )}
    </div>
  );
}

export default ProjectDetailMap;
