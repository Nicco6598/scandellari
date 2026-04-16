export type MenuItem = {
  name: string;
  path: string;
};

export type MenuGroup = {
  name: string;
  items: MenuItem[];
};

export type MenuEntry = MenuItem | MenuGroup;

export const menuEntries = [
  { name: 'Competenze', path: '/competenze' },
  { name: 'Progetti', path: '/progetti' },
  { name: 'Certificazioni', path: '/certificazioni' },
  {
    name: 'Azienda',
    items: [
      { name: 'Chi Siamo', path: '/chi-siamo' },
      { name: 'Carriera', path: '/lavora-con-noi' },
    ],
  },
] satisfies MenuEntry[];

export const isMenuGroup = (item: MenuEntry): item is MenuGroup => 'items' in item;
