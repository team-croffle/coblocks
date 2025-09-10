import { menuItems, type MenuItem } from '@/data/menuItem';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useNavStore = create(
  immer<MenuItem[]>(() => {
    return menuItems;
  }),
);
