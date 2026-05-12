import { Search, X, Download } from 'lucide-react';

export default function FilterBar({
  search, onSearchChange,
  status, onStatusChange,
  municipio, onMunicipioChange,
  prioridade, onPrioridadeChange,
  responsavel, onResponsavelChange,
  isAdmin,
  filterOpts,
  total,
  loading,
  hasFilters,
  onClearFilters,
}) {
  const handleExportCSV = () => {
    const params = new URLSearchParams({ status, municipio, prioridade, responsavel, search, format: 'csv' });
    window.location.href = `/api/demandas?${params}`;
  };
  return (
    <div className="filter-bar">
      <div className="filter-row">
        <div className="search-box">
          <Search size={13} color="#94a3b8" />
          <input
            id="search-input"
            type="text"
            className="search-input"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Nome, protocolo, tema..."
          />
        </div>

        <select
          id="filter-status"
          className="filter-select"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          {filterOpts.statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          id="filter-municipio"
          className="filter-select"
          value={municipio}
          onChange={(e) => onMunicipioChange(e.target.value)}
        >
          <option value="todos">Todos os municípios</option>
          {filterOpts.municipios.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <select
          id="filter-prioridade"
          className="filter-select"
          value={prioridade}
          onChange={(e) => onPrioridadeChange(e.target.value)}
        >
          <option value="todos">Todas as prioridades</option>
          {filterOpts.prioridades.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {isAdmin && (
          <select
            id="filter-responsavel"
            className="filter-select"
            value={responsavel}
            onChange={(e) => onResponsavelChange(e.target.value)}
          >
            <option value="todos">Todos os assessores</option>
            {(filterOpts.responsaveis || []).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button id="filter-clear" className="filter-clear-btn" onClick={onClearFilters}>
            <X size={13} /> Limpar
          </button>
        )}

        <button className="export-csv-btn" onClick={handleExportCSV} title="Exportar CSV">
          <Download size={13} /> CSV
        </button>

        <span className="filter-count">
          {total} demanda{total !== 1 ? 's' : ''}
          {loading ? ' (carregando...)' : ''}
        </span>
      </div>
    </div>
  );
}
