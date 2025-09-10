export interface MenuItem {
  id: string;
  label: string;
  link: string;
  icon: string;
}

export const menuItems: MenuItem[] = [
  {
    id: 'home',
    label: '홈',
    link: '/',
    icon: 'iconify-[fa-solid--home]',
  },
  {
    id: 'algorithm',
    label: '알고리즘',
    link: '/algorithm',
    icon: 'iconify-[fa7-solid--puzzle-piece]',
  },
  {
    id: 'about',
    label: 'About',
    link: '/about',
    icon: 'iconify-[healthicons--info]',
  },
];
