'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { SidebarContext } from '@/lib/SidebarContext';

export default function DashboardLayout({ children }) {
  const [username, setUsername] = useState('');
  const [alertCount, setAlertCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsername(d.username || ''); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/alertas?count=1')
      .then((r) => r.json())
      .then((d) => { if (d.success) setAlertCount(d.total || 0); })
      .catch(() => {});
  }, []);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className="app-layout">
        <Sidebar
          username={username}
          isOpen={open}
          onClose={() => setOpen(false)}
          alertCount={alertCount}
        />
        <div className="main-content">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
