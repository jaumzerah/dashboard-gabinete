'use client';

import { createContext, useContext } from 'react';

export const SidebarContext = createContext({
  open: false,
  setOpen: () => {},
  lastUpdate: null,
  setLastUpdate: () => {},
});

export const useSidebar = () => useContext(SidebarContext);
