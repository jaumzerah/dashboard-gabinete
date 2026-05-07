import Badge from './Badge';
import PBadge from './PBadge';
import ModalField from './ModalField';

export default function DemandaModal({ d, onClose }) {
  if (!d) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ flex: 1 }}>
            <div className="modal-header-info">
              <span className="modal-protocolo">{d.protocolo}</span>
              <Badge status={d.status} />
              <PBadge prioridade={d.prioridade} />
            </div>
            <p className="modal-sub">{d.tipo_demanda} · {d.tema_assunto}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Demandante */}
          <section className="modal-section">
            <p className="modal-section-title">👤 Demandante</p>
            <div className="modal-grid">
              <ModalField label="Nome" value={d.demandante} />
              <ModalField label="Cargo / Setor" value={d.cargo_setor_posicao} />
              <ModalField label="E-mail" value={d.email} />
              <ModalField label="Telefone" value={d.telefone} />
              <ModalField label="Contato adicional" value={d.numero_de_contato} />
              <ModalField label="Município / UF" value={d.municipio ? `${d.municipio} — ${d.uf}` : ''} />
            </div>
          </section>

          {/* Demanda */}
          <section className="modal-section">
            <p className="modal-section-title">📋 Demanda</p>
            <div className="modal-grid" style={{ marginBottom: 10 }}>
              <ModalField label="Canal de Origem" value={d.canal_origem} />
              <ModalField label="Data de Entrada" value={d.data_entrada} />
              <ModalField label="Objetivo" value={d.objetivo} />
              <ModalField label="Órgão Destino" value={d.orgao_destino} />
              <ModalField label="Data Encaminhamento" value={d.data_encaminhamento} />
              <ModalField label="Prazo de Resposta" value={d.prazo_resposta} />
              <ModalField label="Viabilidade Legal" value={d.viabilidade_legal} />
              <ModalField label="Alinhamento com Pauta" value={d.alinhamento_pauta} />
              <ModalField label="Validação" value={d.validacao} />
              <ModalField label="Agendamento" value={d.agendamento} />
              {d.agendamento === 'Sim' && (
                <>
                  <ModalField label="Tipo de Reunião" value={d.tipo_reuniao} />
                  <ModalField label="Data da Reunião" value={d.data_reuniao} />
                </>
              )}
            </div>
            <div className="modal-stack">
              <ModalField label="Resumo da Demanda" value={d.resumo_demanda} />
              {d.justificativa_da_prioridade && (
                <ModalField label="Justificativa da Prioridade" value={d.justificativa_da_prioridade} />
              )}
              {d.historico && (
                <div>
                  <p className="modal-field-label">Histórico</p>
                  <a
                    href={`https://drive.google.com/open?id=${d.historico}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-drive-link"
                  >
                    📄 Abrir no Google Drive
                  </a>
                </div>
              )}
              {d.resposta_sintese && <ModalField label="Síntese da Resposta" value={d.resposta_sintese} />}
              {d.data_resposta && <ModalField label="Data da Resposta" value={d.data_resposta} />}
              {d.link_protocolo_externo && (
                <ModalField label="Link Protocolo Externo" value={d.link_protocolo_externo} />
              )}
            </div>
          </section>

          {/* Gestão */}
          <section className="modal-section">
            <p className="modal-section-title">🗂 Gestão</p>
            <div className="modal-grid">
              <ModalField label="Responsável" value={d.responsavel} />
              <ModalField label="Cadastrante" value={d.cadastrante} />
              <ModalField label="Última Atualização" value={d.ultima_atualizacao} />
              <ModalField label="Arquivamento" value={d.arquivamento} />
              <ModalField label="Publicização" value={d.publicizacao} />
            </div>
          </section>

          {/* Feedback */}
          {(d.feedback_01 || d.feedback_02 || d.feedback_03 || d.observacoes) && (
            <section className="modal-section-feedback">
              <p className="modal-section-title">💬 Feedback e Observações</p>
              <div className="modal-stack">
                {d.feedback_01 && <ModalField label="Feedback 01" value={d.feedback_01} />}
                {d.feedback_02 && <ModalField label="Feedback 02" value={d.feedback_02} />}
                {d.feedback_03 && <ModalField label="Feedback 03" value={d.feedback_03} />}
                {d.observacoes && <ModalField label="Observações" value={d.observacoes} />}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
