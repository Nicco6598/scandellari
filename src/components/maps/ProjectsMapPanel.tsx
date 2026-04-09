import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Map, { Layer, Marker, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import maplibreCss from 'maplibre-gl/dist/maplibre-gl.css?inline';
import { ArrowRightIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useInjectedHeadStyle } from '../../hooks/useInjectedHeadStyle';
import { usePreventWheelScroll } from '../../hooks/usePreventWheelScroll';
import { useRafViewStateChange } from '../../hooks/useRafViewStateChange';
import { metaTextClasses } from '../utils/ColorStyles';
import {
  GeocodingPhase,
  LineFeatureCollection,
  MarkerGroup,
  SelectedGroup,
} from '../../utils/projectLocationUtils';

type Theme = 'light' | 'dark';
type ViewState = {
  latitude: number;
  longitude: number;
  zoom: number;
};

type ProjectsMapPanelProps = {
  activeProjectIndex: number;
  geocodingPhase: GeocodingPhase;
  groupedMarkers: MarkerGroup[];
  hasAnyCoords: boolean;
  isGeocodingDone: boolean;
  lineGeoJSON: LineFeatureCollection;
  onViewStateChange: (next: ViewState) => void;
  selectedGroup: SelectedGroup | null;
  setActiveProjectIndex: Dispatch<SetStateAction<number>>;
  setSelectedGroup: Dispatch<SetStateAction<SelectedGroup | null>>;
  theme: Theme;
  viewState: ViewState;
};

function ProjectsMapPanel({
  activeProjectIndex,
  geocodingPhase,
  groupedMarkers,
  hasAnyCoords,
  isGeocodingDone,
  lineGeoJSON,
  onViewStateChange,
  selectedGroup,
  setActiveProjectIndex,
  setSelectedGroup,
  theme,
  viewState,
}: ProjectsMapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useInjectedHeadStyle(maplibreCss);
  const handleViewStateChange = useRafViewStateChange(onViewStateChange);
  usePreventWheelScroll(containerRef);

  return (
    <div
      ref={containerRef}
      className="h-[70vh] bg-black/5 dark:bg-dark-surface overflow-hidden border border-black/5 dark:border-white/5 rounded-sm relative"
      data-animate="fade"
    >
      {hasAnyCoords ? (
        <>
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

            {lineGeoJSON.features.length > 0 ? (
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

            {groupedMarkers.map((group, index) => (
              <Marker
                key={`group-${index}`}
                longitude={group.lng}
                latitude={group.lat}
                anchor="center"
                onClick={(event) => {
                  event.originalEvent.stopPropagation();
                  setSelectedGroup({
                    coord: { lat: group.lat, lng: group.lng },
                    projects: group.projects,
                  });
                  setActiveProjectIndex(0);
                }}
              >
                <div className="relative group cursor-pointer flex items-center justify-center">
                  {group.projects.length > 1 ? (
                    <div className="absolute -top-3 -right-3 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[8px] font-black flex items-center justify-center z-20 shadow-glow">
                      {group.projects.length}
                    </div>
                  ) : null}
                  <div className="absolute w-8 h-8 border border-primary/30 scale-0 group-hover:scale-110 transition-transform duration-500" />
                  <div className="w-3.5 h-3.5 bg-white dark:bg-black border-[1.5px] border-primary z-10 transition-all duration-300 group-hover:bg-primary group-hover:border-white group-hover:rotate-45" />
                </div>
              </Marker>
            ))}

            {selectedGroup ? (
              <Popup
                longitude={selectedGroup.coord.lng}
                latitude={selectedGroup.coord.lat}
                anchor="top"
                offset={15}
                onClose={() => setSelectedGroup(null)}
                className="maplibre-popup-custom"
                closeButton={false}
              >
                <div className="p-6 min-w-[260px] max-w-[300px] bg-white dark:bg-dark-surface border border-black/10 dark:border-white/10 shadow-2xl">
                  {selectedGroup.projects.length > 1 ? (
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/10 dark:border-white/10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                        {activeProjectIndex + 1} / {selectedGroup.projects.length} Opere
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveProjectIndex((previous) => (
                              previous > 0 ? previous - 1 : selectedGroup.projects.length - 1
                            ));
                          }}
                          className="w-6 h-6 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded-sm transition-colors"
                        >
                          <ListBulletIcon className={`w-3 h-3 rotate-180 hover:text-black dark:hover:text-white ${metaTextClasses}`} />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveProjectIndex((previous) => (
                              previous < selectedGroup.projects.length - 1 ? previous + 1 : 0
                            ));
                          }}
                          className="w-6 h-6 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded-sm transition-colors"
                        >
                          <ArrowRightIcon className={`w-3 h-3 hover:text-black dark:hover:text-white ${metaTextClasses}`} />
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {selectedGroup.projects[activeProjectIndex] ? (
                    <div className="group/pop animate-in fade-in slide-in-from-right-2 duration-300">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1 block">
                        {selectedGroup.projects[activeProjectIndex].categoria}
                      </span>
                      <h4 className="font-black uppercase text-base tracking-tighter leading-tight text-black dark:text-white mb-2">
                        {selectedGroup.projects[activeProjectIndex].titolo}
                      </h4>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${metaTextClasses}`}>
                        {selectedGroup.projects[activeProjectIndex].localita} • {selectedGroup.projects[activeProjectIndex].anno}
                      </p>
                      <Link
                        to={`/progetti/${selectedGroup.projects[activeProjectIndex].id}`}
                        className="flex items-center justify-between group/link pt-4 border-t border-black/10 dark:border-white/10"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white group-hover/link:text-primary transition-colors">Vedi Dettagli</span>
                        <ArrowRightIcon className={`w-4 h-4 group-hover/link:text-primary group-hover/link:translate-x-1 transition-all ${metaTextClasses}`} />
                      </Link>
                    </div>
                  ) : null}
                </div>
              </Popup>
            ) : null}
          </Map>

          {!isGeocodingDone ? (
            <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-4 py-2 flex items-center gap-3 border border-black/10 dark:border-white/10">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className={`text-[9px] font-black uppercase tracking-widest ${metaTextClasses}`}>
                Mappatura in corso
              </span>
              <span className="text-[9px] font-black text-primary tabular-nums">
                {geocodingPhase.current}/{geocodingPhase.total}
              </span>
            </div>
          ) : null}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border border-black/20 dark:border-white/5 animate-ping" />
            <div className="absolute inset-0 border border-primary/20 animate-pulse delay-75" />
            <div className="absolute inset-4 border-2 border-primary/40 rotate-45" />
          </div>
          <div className="text-center space-y-2">
            <span className={`block text-[11px] font-black uppercase tracking-[0.4em] animate-pulse ${metaTextClasses}`}>
              Mappatura Infrastrutture
            </span>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[2px] w-20 bg-black/15 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${geocodingPhase.total > 0 ? (geocodingPhase.current / geocodingPhase.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-[10px] font-black text-primary tabular-nums">
                {geocodingPhase.current} / {geocodingPhase.total}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsMapPanel;
