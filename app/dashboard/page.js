'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import StatsCards from '@/components/StatsCards';
import FilterBar from '@/components/FilterBar';
import DataTable from '@/components/DataTable';
import DemandaModal from '@/components/DemandaModal';

const PER_PAGE = 12;
const POLL_INTERVAL = 30000; // 30 seconds

export default function DashboardPage() {
  const [username, setUsername] = useState('');
  const [demandas, setDemandas] = useState([]);
  const [stats, setStats] = useState({ total: 0, aberto: 0, aguardando: 0, concluida: 0 });
  const [filterOpts, setFilterOpts] = useState({ municipios: [], statuses: [], prioridades: [] });
  const [pagination, setPagination] = useState({ total: 0 });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterMunicipio, setFilterMunicipio] = useState('todos');
  const [filterPrioridade, setFilterPrioridade] = useState('todos');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [lastUpdate, setLastUpdate] = useState(null);
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

        if (result.filters) {
          setFilterOpts(result.filters);
        }

        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [filterStatus, filterMunicipio, filterPrioridade, search, page]);

  // Initial fetch + refetch on filter/page change
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Polling for real-time updates
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  const hasFilters = filterStatus !== 'todos' || filterMunicipio !== 'todos' || filterPrioridade !== 'todos' || search !== '';

  const handleClearFilters = () => {
    setFilterStatus('todos');
    setFilterMunicipio('todos');
    setFilterPrioridade('todos');
    setSearch('');
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val) => {
    setFilterStatus(val);
    setPage(1);
  };

  const handleMunicipioChange = (val) => {
    setFilterMunicipio(val);
    setPage(1);
  };

  const handlePrioridadeChange = (val) => {
    setFilterPrioridade(val);
    setPage(1);
  };

  return (
    <div className="app-layout">
      <Sidebar username={username} />

      <div className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <div>
            <h1 className="topbar-title">Controle de Demandas</h1>
            <p className="topbar-sub">
              Dep. Federal Reimont — PT/RJ · tabela: <code>controle_demanda</code>
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <p className="topbar-date">
              {new Date().toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <div className="topbar-live">
              <span className="live-dot" />
              Atualização automática
              {lastUpdate && (
                <span>
                  · {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content-area">
          <StatsCards stats={stats} />

          <FilterBar
            search={search}
            onSearchChange={handleSearchChange}
            status={filterStatus}
            onStatusChange={handleStatusChange}
            municipio={filterMunicipio}
            onMunicipioChange={handleMunicipioChange}
            prioridade={filterPrioridade}
            onPrioridadeChange={handlePrioridadeChange}
            filterOpts={filterOpts}
            total={pagination.total || 0}
            loading={loading}
            hasFilters={hasFilters}
            onClearFilters={handleClearFilters}
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

      {selected && (
        <DemandaModal d={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
