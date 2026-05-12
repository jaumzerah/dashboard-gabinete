/**
 * Controle de papéis (RBAC)
 *
 * Env vars necessárias no Portainer:
 *
 * DASH_ADMINS  — JSON array com usernames que podem ver tudo
 *   Ex: ["dani","alipio","ledenir","joao","reimont","divino"]
 *
 * DASH_RESPONSAVEL_MAP — JSON object mapeando username → valor exato do campo
 *   `responsavel` na tabela controle_demanda (necessário quando o nome no banco
 *   difere do username). Se omitido, usa o próprio username.
 *   Ex: {"nilson":"Nilson","mita":"Mitã","janaina":"Janaina"}
 */

export function getAdmins() {
  try {
    const list = JSON.parse(process.env.DASH_ADMINS || '[]');
    return Array.isArray(list) ? list.map((u) => u.toLowerCase()) : [];
  } catch {
    return [];
  }
}

export function isAdmin(username) {
  return getAdmins().includes((username || '').toLowerCase());
}

/**
 * Retorna o valor do campo `responsavel` no banco para o username dado.
 * Usa DASH_RESPONSAVEL_MAP se disponível, senão usa o próprio username.
 */
export function getResponsavelDB(username) {
  try {
    const map = JSON.parse(process.env.DASH_RESPONSAVEL_MAP || '{}');
    return map[username] || username;
  } catch {
    return username;
  }
}
