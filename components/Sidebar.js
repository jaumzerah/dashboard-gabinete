'use client';

import { useRouter } from 'next/navigation';
import { Shield, FileText, LogOut, X } from 'lucide-react';

export default function Sidebar({ username, isOpen, onClose }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="sidebar-backdrop" onClick={onClose} />
      )}

      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Shield size={17} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p className="sidebar-brand-name">APOLÔNIO</p>
            <p className="sidebar-brand-sub">Controle de Demandas</p>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Fechar menu">
            <X size={16} color="#475569" />
          </button>
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
    </>
  );
}
