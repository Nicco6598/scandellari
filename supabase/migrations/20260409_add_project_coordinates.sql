alter table public.progetti
  add column if not exists coordinate_punti jsonb,
  add column if not exists coordinate_percorso jsonb;

comment on column public.progetti.coordinate_punti is
  'Coordinate persistite dei punti progetto, salvate come array JSON [{lat, lng}].';

comment on column public.progetti.coordinate_percorso is
  'Percorso persistito del progetto, salvato come array JSON [{lat, lng}].';
