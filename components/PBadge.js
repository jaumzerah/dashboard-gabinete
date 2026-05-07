const PRIORITY_COLORS = {
  'Urgente': { bg: '#fee2e2', tc: '#b91c1c' },
  'Alta':    { bg: '#fecaca', tc: '#991b1b' },
  'Média':   { bg: '#fef3c7', tc: '#92400e' },
  'Baixa':   { bg: '#d1fae5', tc: '#065f46' },
};

export default function PBadge({ prioridade }) {
  if (!prioridade) return null;
  const c = PRIORITY_COLORS[prioridade] || { bg: '#f1f5f9', tc: '#64748b' };
  return (
    <span className="priority-badge" style={{ background: c.bg, color: c.tc }}>
      {prioridade}
    </span>
  );
}
