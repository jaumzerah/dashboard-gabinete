'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell, AlertTriangle, Clock } from 'lucide-react';
import { useSidebar } from '@/lib/SidebarContext';

export default function AlertasPage() {
  const { setOpen } = useSidebar();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/alertas')
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const vencidos = data.filter((d) => d.vencido);
  const proximos = data.filter((d) => !d.vencido);

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu size={20} color="#64748b" />
          </button>
          <div>
            <h1 className="topbar-title">Alertas de Prazo</h1>
            <p className="topbar-sub">Demandas vencidas ou a vencer em até 3 dias</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!loading && (
            <span className="alert-summary-badge">
              <Bell size={13} /> {data.length} alerta{data.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="content-area">
        {loading ? (
          <div className="page-loading">Carregando alertas...</div>
        ) : data.length === 0 ? (
          <div className="page-empty">
            <Bell size={40} color="#94a3b8" />
            <p>Nenhum alerta no momento</p>
            <span>Todas as demandas estão dentro do prazo.</span>
          </div>
        ) : (
          <>
            {vencidos.length > 0 && (
              <AlertSection
                title="Prazos Vencidos"
                icon={<AlertTriangle size={15} color="#ef4444" />}
                items={vencidos}
                variant="danger"
              />
            )}
            {proximos.length > 0 && (
              <AlertSection
                title="Vencem em até 3 dias"
                icon={<Clock size={15} color="#f59e0b" />}
                items={proximos}
                variant="warning"
              />
            )}
          </>
        )}
      </div>
    </>
  );
}

function AlertSection({ title, icon, items, variant }) {
  return (
    <div className="alert-section">
      <div className="alert-section-header">
        {icon}
        <span>{title}</span>
        <span className={`alert-count-badge alert-count-${variant}`}>{items.length}</span>
      </div>
      <div className="alert-cards">
        {items.map((item) => (
          <div key={item.id} className={`alert-card alert-card-${variant}`}>
            <div className="alert-card-top">
              <span className="alert-protocolo">{item.protocolo || `#${item.id}`}</span>
              <span className={`alert-prazo alert-prazo-${variant}`}>
                Prazo: {item.prazo_resposta}
              </span>
            </div>
            <p className="alert-demandante">{item.demandante || '—'}</p>
            <p className="alert-tema">{item.tema_assunto || '—'}</p>
            <div className="alert-card-footer">
              <span className="alert-municipio">{item.municipio || '—'}</span>
              <span className="alert-status">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
