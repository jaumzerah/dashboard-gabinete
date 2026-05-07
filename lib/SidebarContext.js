'use client';

import { createContext, useContext } from 'react';

export const SidebarContext = createContext({ open: false, setOpen: () => {} });
export const useSidebar = () => useContext(SidebarContext);
