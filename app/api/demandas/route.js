import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/auth';

/**
 * GET /api/demandas — List demands with filters and pagination
 * Query params: status, municipio, prioridade, search, limit, offset
 */
export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Não autenticado.' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'todos';
    const municipio = searchParams.get('municipio') || 'todos';
    const prioridade = searchParams.get('prioridade') || 'todos';
    const search = searchParams.get('search') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '12', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build WHERE clauses dynamically
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

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    // Count total
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM controle_demanda ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Fetch page data
    const dataParams = [...params, limit, offset];
    const dataResult = await pool.query(
      `SELECT * FROM controle_demanda ${whereClause}
       ORDER BY COALESCE(data_entrada, '1970-01-01') DESC, id DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      dataParams
    );

    // Get stats (unfiltered)
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status IN ('Cadastrado', 'Em Análise', 'Em Andamento')) as aberto,
        COUNT(*) FILTER (WHERE status IN ('Encaminhado', 'Aguardando Resposta')) as tramitacao,
        COUNT(*) FILTER (WHERE prioridade IN ('Urgente', 'Alta')) as alta_prioridade
      FROM controle_demanda
    `);

    // Get filter options
    const [munRes, statRes, priorRes] = await Promise.all([
      pool.query(`SELECT DISTINCT municipio FROM controle_demanda WHERE municipio IS NOT NULL AND municipio != '' ORDER BY municipio`),
      pool.query(`SELECT DISTINCT status FROM controle_demanda WHERE status IS NOT NULL AND status != '' ORDER BY status`),
      pool.query(`SELECT DISTINCT prioridade FROM controle_demanda WHERE prioridade IS NOT NULL AND prioridade != '' ORDER BY prioridade`),
    ]);

    // Format dates for display
    const data = dataResult.rows.map(row => ({
      ...row,
      data_entrada: row.data_entrada ? formatDate(row.data_entrada) : '',
      data_encaminhamento: row.data_encaminhamento ? formatDate(row.data_encaminhamento) : '',
      prazo_resposta: row.prazo_resposta ? formatDate(row.prazo_resposta) : '',
      data_resposta: row.data_resposta ? formatDate(row.data_resposta) : '',
      ultima_atualizacao: row.ultima_atualizacao ? formatDateTime(row.ultima_atualizacao) : '',
    }));

    return NextResponse.json({
      success: true,
      data,
      stats: {
        total: parseInt(statsResult.rows[0].total, 10),
        aberto: parseInt(statsResult.rows[0].aberto, 10),
        tramitacao: parseInt(statsResult.rows[0].tramitacao, 10),
        alta_prioridade: parseInt(statsResult.rows[0].alta_prioridade, 10),
      },
      pagination: { total, limit, offset },
      filters: {
        municipios: munRes.rows.map(r => r.municipio),
        statuses: statRes.rows.map(r => r.status),
        prioridades: priorRes.rows.map(r => r.prioridade),
      },
    });
  } catch (err) {
    console.error('[DEMANDAS] Query error:', err);
    return NextResponse.json(
      { success: false, message: 'Erro ao consultar demandas.' },
      { status: 500 }
    );
  }
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('pt-BR');
}

function formatDateTime(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
