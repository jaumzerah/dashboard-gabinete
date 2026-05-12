import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { getResponsavelDB } from '@/lib/roles';

export async function GET(request) {
  try {
    // Verificar sessão e papel
    const token = request.cookies.get('dash_session')?.value;
    const session = token ? await verifyToken(token) : null;
    if (!session) {
      return NextResponse.json({ success: false, message: 'Não autenticado.' }, { status: 401 });
    }
    const userIsAdmin = session.role === 'admin';

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'todos';
    const municipio = searchParams.get('municipio') || 'todos';
    const prioridade = searchParams.get('prioridade') || 'todos';
    // Assessores têm o responsavel fixado no próprio nome — ignoram o param do cliente
    const responsavel = userIsAdmin
      ? (searchParams.get('responsavel') || 'todos')
      : getResponsavelDB(session.username);
    const search = (searchParams.get('search') || '').slice(0, 100);
    const format = searchParams.get('format') || 'json';
    const isCSV = format === 'csv';
    const limit = isCSV ? 10000 : Math.min(Math.max(parseInt(searchParams.get('limit'), 10) || 12, 1), 100);
    const offset = isCSV ? 0 : Math.max(parseInt(searchParams.get('offset'), 10) || 0, 0);

    const conditions = [];
    const params = [];
    let paramIdx = 1;

    if (status !== 'todos') {
      conditions.push(`status = $${paramIdx++}`);
      params.push(status);
    }
    if (municipio !== 'todos') {
      conditions.push(`municipio = $${paramIdx++}`);
      params.push(municipio);
    }
    if (prioridade !== 'todos') {
      conditions.push(`prioridade = $${paramIdx++}`);
      params.push(prioridade);
    }
    // Para assessores o responsavel nunca é 'todos' — é sempre o nome deles
    if (!userIsAdmin || responsavel !== 'todos') {
      conditions.push(`responsavel = $${paramIdx++}`);
      params.push(responsavel);
    }
    if (search) {
      conditions.push(`(
        demandante ILIKE $${paramIdx}
        OR protocolo ILIKE $${paramIdx}
        OR tema_assunto ILIKE $${paramIdx}
        OR municipio ILIKE $${paramIdx}
      )`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM controle_demanda ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataParams = [...params, limit, offset];
    const dataResult = await pool.query(
      `SELECT * FROM controle_demanda ${whereClause}
       ORDER BY COALESCE(data_entrada, '1970-01-01') DESC, id DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      dataParams
    );

    const data = dataResult.rows.map((row) => ({
      ...row,
      data_entrada: row.data_entrada ? formatDate(row.data_entrada) : '',
      data_encaminhamento: row.data_encaminhamento ? formatDate(row.data_encaminhamento) : '',
      prazo_resposta: row.prazo_resposta ? formatDate(row.prazo_resposta) : '',
      data_resposta: row.data_resposta ? formatDate(row.data_resposta) : '',
      ultima_atualizacao: row.ultima_atualizacao ? formatDateTime(row.ultima_atualizacao) : '',
    }));

    if (isCSV) {
      const csv = toCSV(data);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="demandas_${today()}.csv"`,
        },
      });
    }

    // Escopo de stats e filtros de opções: assessores veem apenas seus dados
    const scopeParams = userIsAdmin ? [] : [getResponsavelDB(session.username)];
    const scopeClause = userIsAdmin ? '' : 'WHERE responsavel = $1';
    const andOrWhere = userIsAdmin ? 'WHERE' : 'AND';

    const statsResult = await pool.query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Nova') as aberto,
        COUNT(*) FILTER (WHERE status = 'Aguardando Feedback') as aguardando,
        COUNT(*) FILTER (WHERE status = 'Concluída') as concluida
       FROM controle_demanda ${scopeClause}`,
      scopeParams
    );

    const [munRes, statRes, priorRes, respRes] = await Promise.all([
      pool.query(`SELECT DISTINCT municipio FROM controle_demanda ${scopeClause} ${andOrWhere} municipio IS NOT NULL AND municipio != '' ORDER BY municipio`, scopeParams),
      pool.query(`SELECT DISTINCT status FROM controle_demanda ${scopeClause} ${andOrWhere} status IS NOT NULL AND status != '' ORDER BY status`, scopeParams),
      pool.query(`SELECT DISTINCT prioridade FROM controle_demanda ${scopeClause} ${andOrWhere} prioridade IS NOT NULL AND prioridade != '' ORDER BY prioridade`, scopeParams),
      userIsAdmin
        ? pool.query(`SELECT DISTINCT responsavel FROM controle_demanda WHERE responsavel IS NOT NULL AND responsavel != '' ORDER BY responsavel`)
        : Promise.resolve({ rows: [] }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      stats: {
        total: parseInt(statsResult.rows[0].total, 10),
        aberto: parseInt(statsResult.rows[0].aberto, 10),
        aguardando: parseInt(statsResult.rows[0].aguardando, 10),
        concluida: parseInt(statsResult.rows[0].concluida, 10),
      },
      pagination: { total, limit, offset },
      filters: {
        municipios: munRes.rows.map((r) => r.municipio),
        statuses: statRes.rows.map((r) => r.status),
        prioridades: priorRes.rows.map((r) => r.prioridade),
        responsaveis: respRes.rows.map((r) => r.responsavel),
      },
    });
  } catch (err) {
    console.error('[DEMANDAS] Query error:', err);
    return NextResponse.json({ success: false, message: 'Erro ao consultar demandas.' }, { status: 500 });
  }
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR');
}

function formatDateTime(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function toCSV(rows) {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const escape = (v) => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = cols.join(',');
  const lines = rows.map((r) => cols.map((c) => escape(r[c])).join(','));
  return '﻿' + [header, ...lines].join('\r\n');
}
