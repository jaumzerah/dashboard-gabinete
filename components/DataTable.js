import { MapPin, CalendarDays, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Badge from './Badge';
import PBadge from './PBadge';

const PER_PAGE = 12;

export default function DataTable({ data, total, page, onPageChange, loading, onView }) {
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start, end;
    if (totalPages <= maxVisible) { start = 1; end = totalPages; }
    else if (page <= 3) { start = 1; end = maxVisible; }
    else if (page >= totalPages - 2) { start = totalPages - maxVisible + 1; end = totalPages; }
    else { start = page - 2; end = page + 2; }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="cards-container">
      {loading ? (
        <div className="cards-loading">Buscando demandas...</div>
      ) : data.length === 0 ? (
        <div className="cards-empty">Nenhuma demanda encontrada.</div>
      ) : (
        <div className="cards-grid">
          {data.map((d) => (
            <button
              key={d.id}
              className="demand-card"
              onClick={() => onView(d)}
              aria-label={`Ver demanda ${d.protocolo}`}
            >
              <div className="demand-card-header">
                <span className="demand-card-protocolo">{d.protocolo || `#${d.id}`}</span>
                <Badge status={d.status} />
              </div>

              <p className="demand-card-name">{d.demandante || '—'}</p>
              <p className="demand-card-tema">{d.tema_assunto || '—'}</p>

              <div className="demand-card-footer">
                <div className="demand-card-meta">
                  {d.municipio && (
                    <span className="demand-card-meta-item">
                      <MapPin size={11} />
                      {d.municipio}{d.uf ? `/${d.uf}` : ''}
                    </span>
                  )}
                  {d.data_entrada && (
                    <span className="demand-card-meta-item">
                      <CalendarDays size={11} />
                      {d.data_entrada}
                    </span>
                  )}
                </div>
                <div className="demand-card-right">
                  <PBadge prioridade={d.prioridade} />
                  <span className="demand-card-ver">
                    <Eye size={12} /> ver
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <p className="pagination-info">
            {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de {total}
          </p>
          <div className="pagination-buttons">
            <button
              className="page-arrow"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={14} color="#64748b" />
            </button>
            {getPageNumbers().map((p) => (
              <button
                key={p}
                className={`page-num ${page === p ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="page-arrow"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              aria-label="Próxima página"
            >
              <ChevronRight size={14} color="#64748b" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
