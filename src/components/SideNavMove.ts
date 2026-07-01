import { create } from 'zustand';

interface SideNavState {
  isExpanded: boolean;
  setExpanded: (value: boolean) => void;
}

// Store dùng chung để Header biết khi nào SideNav đang mở rộng (hover trên desktop)
export const useSideNavStore = create<SideNavState>((set) => ({
  isExpanded: false,
  setExpanded: (value) => set({ isExpanded: value }),
}));
