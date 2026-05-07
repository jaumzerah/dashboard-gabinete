import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM controle_demanda
      WHERE agendamento = 'Sim'
        AND data_reuniao IS NOT NULL
      ORDER BY data_reuniao ASC
    `);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows = result.rows.map((row) => {
      const reuniao = new Date(row.data_reuniao);
      return {
        ...row,
        data_reuniao: reuniao.toLocaleDateString('pt-BR'),
        data_reuniao_raw: row.data_reuniao,
        data_entrada: row.data_entrada ? new Date(row.data_entrada).toLocaleDateString('pt-BR') : '',
        prazo_resposta: row.prazo_resposta ? new Date(row.prazo_resposta).toLocaleDateString('pt-BR') : '',
        passado: reuniao < today,
      };
    });

    const proximas = rows.filter((r) => !r.passado);
    const passadas = rows.filter((r) => r.passado).reverse();

    return NextResponse.json({ success: true, proximas, passadas });
  } catch (err) {
    console.error('[AGENDA]', err);
    return NextResponse.json({ success: false, message: 'Erro ao consultar agenda.' }, { status: 500 });
  }
}
