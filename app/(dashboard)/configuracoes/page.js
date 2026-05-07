'use client';

import { useState } from 'react';
import { Menu, Settings, Key, CheckCircle, XCircle } from 'lucide-react';
import { useSidebar } from '@/lib/SidebarContext';

export default function ConfiguracoesPage() {
  const { setOpen } = useSidebar();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message }

  const handlePasswordChange = async () => {
    setFeedback(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter ao menos 8 caracteres.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (data.success) {
        setFeedback({ type: 'success', message: 'Senha alterada com sucesso!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({ type: 'error', message: data.message || 'Erro ao alterar senha.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="hamburger-btn" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu size={20} color="#64748b" />
          </button>
          <div>
            <h1 className="topbar-title">Configurações</h1>
            <p className="topbar-sub">Gerencie as configurações do painel</p>
          </div>
        </div>
      </div>

      <div className="content-area">
        <div className="config-section">
          <div className="config-section-header">
            <Key size={16} color="#16a34a" />
            <h2>Alterar Senha</h2>
          </div>
          <div className="config-card">
            <div className="config-form">
              <div className="config-field">
                <label>Senha atual</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setFeedback(null); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div className="config-field">
                <label>Nova senha</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setFeedback(null); }}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>

              <div className="config-field">
                <label>Confirmar nova senha</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFeedback(null); }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  onKeyDown={(e) => e.key === 'Enter' && handlePasswordChange()}
                />
              </div>

              {feedback && (
                <div className={`config-feedback config-feedback-${feedback.type}`}>
                  {feedback.type === 'success'
                    ? <CheckCircle size={14} />
                    : <XCircle size={14} />
                  }
                  {feedback.message}
                </div>
              )}

              <button
                className="config-save-btn"
                onClick={handlePasswordChange}
                disabled={loading}
              >
                <Settings size={14} />
                {loading ? 'Salvando...' : 'Alterar Senha'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
