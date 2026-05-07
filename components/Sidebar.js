'use client';

import { useRouter } from 'next/navigation';
import { Shield, FileText, LogOut } from 'lucide-react';

export default function Sidebar({ username }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Shield size={17} color="white" />
        </div>
        <div>
          <p className="sidebar-brand-name">APOLÔNIO</p>
          <p className="sidebar-brand-sub">Controle de Demandas</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-nav-item">
          <FileText size={15} color="#4ade80" />
          <span>Demandas</span>
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {username ? username.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <p className="sidebar-user-name">{username || 'Usuário'}</p>
            <p className="sidebar-user-role">Chefe de gabinete</p>
          </div>
        </div>
        <button className="sidebar-logout-btn" onClick={handleLogout}>
          <LogOut size={13} /> Sair
        </button>
      </div>
    </div>
  );
}
