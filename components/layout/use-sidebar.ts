import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  collapsed: boolean;
  toggle: () => void;
};

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: "bb-sidebar" },
  ),
);
