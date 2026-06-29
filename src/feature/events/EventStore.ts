import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EventsState {
  bookmarks: Set<number>;
  registrations: Set<number>;
  toggleBookmark: (id: number) => void;
  toggleRegistration: (id: number) => void;
  isBookmarked: (id: number) => boolean;
  isRegistered: (id: number) => boolean;
}

export const useEventsStore = create<EventsState>()(
  persist(
    (set, get) => ({
      bookmarks: new Set<number>(),
      registrations: new Set<number>(),

      toggleBookmark: (id) =>
        set((state) => {
          const next = new Set(state.bookmarks);
          next.has(id) ? next.delete(id) : next.add(id);
          return { bookmarks: next };
        }),

      toggleRegistration: (id) =>
        set((state) => {
          const next = new Set(state.registrations);
          next.has(id) ? next.delete(id) : next.add(id);
          return { registrations: next };
        }),

      isBookmarked: (id) => get().bookmarks.has(id),
      isRegistered: (id) => get().registrations.has(id),
    }),
    {
      name: 'events-store',
      // Set<number> không JSON-serializable nên serialize thủ công
      storage: {
        getItem: (key) => {
          const raw = localStorage.getItem(key);
          if (!raw) return null;
          const parsed = JSON.parse(raw);
          return {
            ...parsed,
            state: {
              bookmarks: new Set<number>(parsed.state.bookmarks ?? []),
              registrations: new Set<number>(parsed.state.registrations ?? []),
            },
          };
        },
        setItem: (key, value) => {
          localStorage.setItem(
            key,
            JSON.stringify({
              ...value,
              state: {
                bookmarks: Array.from(value.state.bookmarks),
                registrations: Array.from(value.state.registrations),
              },
            })
          );
        },
        removeItem: (key) => localStorage.removeItem(key),
      },
    }
  )
);
