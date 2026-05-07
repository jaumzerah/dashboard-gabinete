'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StatsCards from '@/components/StatsCards';
import FilterBar from '@/components/FilterBar';
import DataTable from '@/components/DataTable';
import DemandaModal from '@/components/DemandaModal';

const PER_PAGE = 12;
const POLL_INTERVAL = 30000;

export default function DashboardPage() {
  const [username, setUsername] = useState('');
  const [demandas, setDemandas] = useState([]);
  const [stats, setStats] = useState({ total: 0, aberto: 0, aguardando: 0, concluida: 0 });
  const [filterOpts, setFilterOpts] = useState({ municipios: [], statuses: [], prioridades: [] });
  const [pagination, setPagination] = useState({ total: 0 });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterMunicipio, setFilterMunicipio] = useState('todos');
  const [filterPrioridade, setFilterPrioridade] = useState('todos');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [lastUpdate, setLastUpdate] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.success) setUsername(d.username || ''); })
      .catch(() => {});
  }, []);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);

    try {
      const params = new URLSearchParams({
        status: filterStatus,
        municipio: filterMunicipio,
        prioridade: filterPrioridade,
        search,
        limit: String(PER_PAGE),
        offset: String((page - 1) * PER_PAGE),
      });

      const res = await fetch(`/api/demandas?${params}`);

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      const result = await res.json();

      if (result.success) {
        setDemandas(result.data || []);
        setStats(result.stats || { total: 0, aberto: 0, aguardando: 0, concluida: 0 });
        setPagination(result.pagination || { total: 0 });
        if (result.filters) setFilterOpts(result.filters);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [filterStatus, filterMunicipio, filterPrioridade, search, page]);

  useEffect(() => { fetchData(false); }, [fetchData]);

  useEffect(() => {
    intervalRef.current = setInterval(() => fetchData(true), POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  const hasFilters = filterStatus !== 'todos' || filterMunicipio !== 'todos' || filterPrioridade !== 'todos' || search !== '';

  return (
    <div className="app-layout">
      <Sidebar username={username} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
              <Menu size={20} color="#64748b" />
            </button>
            <div>
              <h1 className="topbar-title">Controle de Demandas</h1>
              <p className="topbar-sub">
                Dep. Federal Reimont — PT/RJ · tabela: <code>controle_demanda</code>
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <p className="topbar-date">
              {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <div className="topbar-live">
              <span className="live-dot" />
              Atualização automática
              {lastUpdate && (
                <span>· {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          </div>
        </div>

        <div className="content-area">
          <StatsCards stats={stats} />
          <FilterBar
            search={search}
            onSearchChange={(val) => { setSearch(val); setPage(1); }}
            status={filterStatus}
            onStatusChange={(val) => { setFilterStatus(val); setPage(1); }}
            municipio={filterMunicipio}
            onMunicipioChange={(val) => { setFilterMunicipio(val); setPage(1); }}
            prioridade={filterPrioridade}
            onPrioridadeChange={(val) => { setFilterPrioridade(val); setPage(1); }}
            filterOpts={filterOpts}
            total={pagination.total || 0}
            loading={loading}
            hasFilters={hasFilters}
            onClearFilters={() => { setFilterStatus('todos'); setFilterMunicipio('todos'); setFilterPrioridade('todos'); setSearch(''); setPage(1); }}
          />
          <DataTable
            data={demandas}
            total={pagination.total || 0}
            page={page}
            onPageChange={setPage}
            loading={loading}
            onView={setSelected}
          />
        </div>
      </div>

      {selected && <DemandaModal d={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
