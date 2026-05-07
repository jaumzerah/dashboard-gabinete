import { FileText } from 'lucide-react';

const CARDS = [
  { key: 'total',      label: 'Total de Demandas',    textColor: '#1e293b', bgColor: '#e8edf5' },
  { key: 'aberto',     label: 'Em Aberto',            textColor: '#1d4ed8', bgColor: '#eff6ff' },
  { key: 'aguardando', label: 'Aguardando Feedback',  textColor: '#b45309', bgColor: '#fffbeb' },
  { key: 'concluida',  label: 'Concluídas',           textColor: '#15803d', bgColor: '#f0fdf4' },
];

export default function StatsCards({ stats }) {
  return (
    <div className="stats-grid">
      {CARDS.map(({ key, label, textColor, bgColor }) => (
        <div key={key} className="stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-box" style={{ background: bgColor }}>
              <FileText size={16} color={textColor} />
            </div>
            <span className="stat-value" style={{ color: textColor }}>
              {stats?.[key] ?? 0}
            </span>
          </div>
          <p className="stat-label">{label}</p>
        </div>
      ))}
    </div>
  );
}
