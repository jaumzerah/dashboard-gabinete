const STATUS_COLORS = {
  'Cadastrado':          { bg: '#dbeafe', tc: '#1d4ed8', dot: '#3b82f6' },
  'Em Andamento':        { bg: '#fef3c7', tc: '#b45309', dot: '#f59e0b' },
  'Em Análise':          { bg: '#ede9fe', tc: '#6d28d9', dot: '#8b5cf6' },
  'Encaminhado':         { bg: '#e0f2fe', tc: '#0369a1', dot: '#0ea5e9' },
  'Aguardando Resposta': { bg: '#ffedd5', tc: '#c2410c', dot: '#f97316' },
  'Resolvido':           { bg: '#d1fae5', tc: '#065f46', dot: '#10b981' },
  'Arquivado':           { bg: '#f1f5f9', tc: '#475569', dot: '#94a3b8' },
};

export default function Badge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#f1f5f9', tc: '#475569', dot: '#94a3b8' };
  return (
    <span className="status-badge" style={{ background: c.bg, color: c.tc }}>
      <span className="status-dot" style={{ background: c.dot }} />
      {status}
    </span>
  );
}
