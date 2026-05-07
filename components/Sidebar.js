'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Shield, FileText, Bell, Calendar, Settings, LogOut, X } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/', icon: FileText, label: 'Demandas' },
  { href: '/alertas', icon: Bell, label: 'Alertas de Prazo', badge: true },
  { href: '/agenda', icon: Calendar, label: 'Agenda' },
  { href: '/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function Sidebar({ username, isOpen, onClose, alertCount = 0 }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/login');
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <div className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
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

        <nav className="sidebar-nav">
          {navItems.map(({ href, icon: Icon, label, badge }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`sidebar-nav-item sidebar-nav-link ${active ? 'sidebar-nav-active' : ''}`}
                onClick={onClose}
              >
                <Icon size={15} color={active ? '#4ade80' : '#94a3b8'} />
                <span>{label}</span>
                {badge && alertCount > 0 && (
                  <span className="sidebar-alert-badge">{alertCount > 99 ? '99+' : alertCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {username ? username.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <p className="sidebar-user-name">{username || 'Usuário'}</p>
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
