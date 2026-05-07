'use client';

import { useState, useEffect } from 'react';
import { Menu, Calendar, MapPin, User } from 'lucide-react';
import { useSidebar } from '@/lib/SidebarContext';

export default function AgendaPage() {
  const { setOpen } = useSidebar();
  const [proximas, setProximas] = useState([]);
  const [passadas, setPassadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agenda')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setProximas(d.proximas || []);
          setPassadas(d.passadas || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu size={20} color="#64748b" />
          </button>
          <div>
            <h1 className="topbar-title">Agenda</h1>
            <p className="topbar-sub">Reuniões agendadas nas demandas</p>
          </div>
        </div>
        {!loading && (
          <span className="agenda-summary">
            <Calendar size={13} />
            {proximas.length} próxima{proximas.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="content-area">
        {loading ? (
          <div className="page-loading">Carregando agenda...</div>
        ) : proximas.length === 0 && passadas.length === 0 ? (
          <div className="page-empty">
            <Calendar size={40} color="#94a3b8" />
            <p>Nenhuma reunião agendada</p>
            <span>Demandas com agendamento = Sim aparecerão aqui.</span>
          </div>
        ) : (
          <>
            {proximas.length > 0 && (
              <AgendaSection title="Próximas Reuniões" items={proximas} variant="upcoming" />
            )}
            {passadas.length > 0 && (
              <AgendaSection title="Reuniões Realizadas" items={passadas} variant="past" />
            )}
          </>
        )}
      </div>
    </>
  );
}

function AgendaSection({ title, items, variant }) {
  return (
    <div className="agenda-section">
      <h2 className="agenda-section-title">{title}</h2>
      <div className="agenda-list">
        {items.map((item) => (
          <div key={item.id} className={`agenda-card agenda-card-${variant}`}>
            <div className="agenda-date-col">
              <span className="agenda-day">
                {item.data_reuniao.split('/')[0]}
              </span>
              <span className="agenda-month">
                {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][
                  parseInt(item.data_reuniao.split('/')[1], 10) - 1
                ]}
              </span>
            </div>
            <div className="agenda-info">
              <p className="agenda-tema">{item.tema_assunto || '—'}</p>
              <div className="agenda-meta">
                <span><User size={11} /> {item.demandante || '—'}</span>
                <span><MapPin size={11} /> {item.municipio || '—'}</span>
              </div>
              <div className="agenda-badges">
                <span className="agenda-protocolo">{item.protocolo || `#${item.id}`}</span>
                <span className="agenda-status">{item.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
