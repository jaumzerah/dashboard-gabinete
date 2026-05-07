'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/');
      } else {
        setError(data.message || 'Credenciais inválidas.');
      }
    } catch {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <Shield size={30} color="white" />
          </div>
          <h1 className="login-title">APOLÔNIO</h1>
          <p className="login-subtitle">Painel de Controle de Demandas</p>
          <p className="login-org">Gabinete Dep. Federal Reimont — PT/RJ</p>
        </div>

        <div className="login-card">
          <div className="login-form">
            <div className="form-group">
              <label htmlFor="username">Usuário</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="seu.usuario"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              id="login-submit"
              onClick={handleLogin}
              disabled={loading}
              className="login-btn"
            >
              {loading ? 'Verificando...' : 'Entrar no painel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
