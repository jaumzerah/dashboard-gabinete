import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const countOnly = searchParams.get('count') === '1';

    const today = new Date().toISOString().split('T')[0];
    const in3days = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    const result = await pool.query(`
      SELECT *
      FROM controle_demanda
      WHERE status != 'Concluída'
        AND prazo_resposta IS NOT NULL
        AND prazo_resposta::date <= $1::date
      ORDER BY prazo_resposta ASC
    `, [in3days]);

    const rows = result.rows.map((row) => ({
      ...row,
      prazo_resposta: row.prazo_resposta ? new Date(row.prazo_resposta).toLocaleDateString('pt-BR') : '',
      data_entrada: row.data_entrada ? new Date(row.data_entrada).toLocaleDateString('pt-BR') : '',
      vencido: row.prazo_resposta ? new Date(row.prazo_resposta) < new Date(today) : false,
    }));

    if (countOnly) {
      return NextResponse.json({ success: true, total: rows.length });
    }

    return NextResponse.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    console.error('[ALERTAS]', err);
    return NextResponse.json({ success: false, message: 'Erro ao consultar alertas.' }, { status: 500 });
  }
}
