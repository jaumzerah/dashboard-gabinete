import { MapPin, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Badge from './Badge';
import PBadge from './PBadge';

const PER_PAGE = 12;

export default function DataTable({ data, total, page, onPageChange, loading, onView }) {
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start, end;

    if (totalPages <= maxVisible) {
      start = 1;
      end = totalPages;
    } else if (page <= 3) {
      start = 1;
      end = maxVisible;
    } else if (page >= totalPages - 2) {
      start = totalPages - maxVisible + 1;
      end = totalPages;
    } else {
      start = page - 2;
      end = page + 2;
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="table-container">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {['Protocolo', 'Demandante', 'Município / UF', 'Tema / Tipo', 'Cadastrante', 'Data Entrada', 'Prior.', 'Status', ''].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="table-empty">
                  {loading ? 'Buscando demandas...' : 'Nenhuma demanda encontrada.'}
                </td>
              </tr>
            ) : (
              data.map((d) => (
                <tr key={d.id}>
                  <td>
                    <span className="td-protocolo">{d.protocolo}</span>
                  </td>
                  <td>
                    <p className="td-demandante-name">{d.demandante}</p>
                    <p className="td-demandante-canal">{d.canal_origem}</p>
                  </td>
                  <td>
                    <div className="td-municipio">
                      <MapPin size={11} color="#94a3b8" />
                      {d.municipio}/{d.uf}
                    </div>
                  </td>
                  <td>
                    <p className="td-tema">{d.tema_assunto}</p>
                    <p className="td-tipo">{d.tipo_demanda}</p>
                  </td>
                  <td className="td-cadastrante">
                    {d.cadastrante?.split(' ')[0]}
                  </td>
                  <td className="td-data">{d.data_entrada}</td>
                  <td><PBadge prioridade={d.prioridade} /></td>
                  <td><Badge status={d.status} /></td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => onView(d)}
                      aria-label={`Ver demanda ${d.protocolo}`}
                    >
                      <Eye size={13} /> ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
