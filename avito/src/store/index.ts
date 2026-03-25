import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category, SortColumn, SortDirection } from '../types';

type Theme = 'light' | 'dark';
type Layout = 'grid' | 'list';

interface FiltersState {
  search: string;
  categories: Category[];
  needsRevision: boolean;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  page: number;
  layout: Layout;
  theme: Theme;
  setSearch: (q: string) => void;
  toggleCategory: (cat: Category) => void;
  setNeedsRevision: (v: boolean) => void;
  setSort: (col: SortColumn, dir: SortDirection) => void;
  setPage: (p: number) => void;
  setLayout: (l: Layout) => void;
  toggleTheme: () => void;
  resetFilters: () => void;
}

export const useStore = create<FiltersState>()(
  persist(
    (set) => ({
      search: '',
      categories: [],
      needsRevision: false,
      sortColumn: 'createdAt',
      sortDirection: 'desc',
      page: 1,
      layout: 'grid',
      theme: 'light',
      setSearch: (search) => set({ search, page: 1 }),
      toggleCategory: (cat) =>
        set((s) => ({
          categories: s.categories.includes(cat)
            ? s.categories.filter((c) => c !== cat)
            : [...s.categories, cat],
          page: 1,
        })),
      setNeedsRevision: (needsRevision) => set({ needsRevision, page: 1 }),
      setSort: (sortColumn, sortDirection) => set({ sortColumn, sortDirection }),
      setPage: (page) => set({ page }),
      setLayout: (layout) => set({ layout }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      resetFilters: () =>
        set({ search: '', categories: [], needsRevision: false, page: 1 }),
    }),
    { name: 'avito-ui-state', partialize: (s) => ({ layout: s.layout, theme: s.theme }) }
  )
);
