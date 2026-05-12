'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Menu } from 'lucide-react';
import StatsCards from '@/components/StatsCards';
import FilterBar from '@/components/FilterBar';
import DataTable from '@/components/DataTable';
import DemandaModal from '@/components/DemandaModal';
import { useSidebar } from '@/lib/SidebarContext';

const PER_PAGE = 6;
const POLL_INTERVAL = 30000;

export default function DashboardPage() {
  const { setOpen, setLastUpdate, role } = useSidebar();
  const isAdmin = role === 'admin';

  const [demandas, setDemandas] = useState([]);
  const [stats, setStats] = useState({ total: 0, aberto: 0, aguardando: 0, concluida: 0 });
  const [filterOpts, setFilterOpts] = useState({ municipios: [], statuses: [], prioridades: [] });
  const [pagination, setPagination] = useState({ total: 0 });
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterMunicipio, setFilterMunicipio] = useState('todos');
  const [filterPrioridade, setFilterPrioridade] = useState('todos');
  const [filterResponsavel, setFilterResponsavel] = useState('todos');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const intervalRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params = new URLSearchParams({
        status: filterStatus,
        municipio: filterMunicipio,
        prioridade: filterPrioridade,
        responsavel: filterResponsavel,
        search,
        limit: String(PER_PAGE),
        offset: String((page - 1) * PER_PAGE),
      });

      const res = await fetch(`/api/demandas?${params}`);
      if (res.status === 401) { window.location.href = '/login'; return; }

      const result = await res.json();
      if (result.success) {
        setDemandas(result.data || []);
        setStats(result.stats || { total: 0, aberto: 0, aguardando: 0, concluida: 0 });
        setPagination(result.pagination || { total: 0 });
        if (result.filters) setFilterOpts(result.filters);
        const now = new Date();
        setLastUpdate(now);
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [filterStatus, filterMunicipio, filterPrioridade, filterResponsavel, search, page]);

  useEffect(() => { fetchData(false); }, [fetchData]);

  useEffect(() => {
    intervalRef.current = setInterval(() => fetchData(true), POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  const hasFilters = filterStatus !== 'todos' || filterMunicipio !== 'todos' || filterPrioridade !== 'todos' || filterResponsavel !== 'todos' || searchInput !== '';

  return (
    <>
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Menu size={20} color="#64748b" />
        </button>
        <span className="mobile-topbar-title">Controle de Demandas</span>
      </div>

      <div className="content-area">
        <StatsCards stats={stats} />
        <FilterBar
          search={searchInput}
          onSearchChange={setSearchInput}
          status={filterStatus}
          onStatusChange={(val) => { setFilterStatus(val); setPage(1); }}
          municipio={filterMunicipio}
          onMunicipioChange={(val) => { setFilterMunicipio(val); setPage(1); }}
          prioridade={filterPrioridade}
          onPrioridadeChange={(val) => { setFilterPrioridade(val); setPage(1); }}
          isAdmin={isAdmin}
          responsavel={filterResponsavel}
          onResponsavelChange={(val) => { setFilterResponsavel(val); setPage(1); }}
          filterOpts={filterOpts}
          total={pagination.total || 0}
          loading={loading}
          hasFilters={hasFilters}
          onClearFilters={() => { setFilterStatus('todos'); setFilterMunicipio('todos'); setFilterPrioridade('todos'); setFilterResponsavel('todos'); setSearchInput(''); setSearch(''); setPage(1); }}
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

      {selected && <DemandaModal d={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
