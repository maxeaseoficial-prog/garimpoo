import {
  TODOS_OS_NICHOS_ID,
  buscarNichoPorId,
  buscarNichoPorLabel,
  planoTodosOsNichos,
} from "@/data/business-niches";

/**
 * Monta a lista ordenada de consultas reais enviadas ao Google.
 * - nicho específico: o próprio nicho e seus sinônimos (nunca outros segmentos);
 * - "Todos os nichos": round-robin entre categorias;
 * - busca personalizada: o termo digitado.
 */
export function montarConsultas(
  nicho: string,
  nichoId: string | null | undefined,
  localizacao: string,
  alvo: number,
): string[] {
  const local = localizacao.trim();
  const termos: string[] = [];

  if (nichoId === TODOS_OS_NICHOS_ID) {
    // ~1 consulta a cada 5 leads desejados, com folga; limitado adiante pelo coletor.
    const quantidade = Math.min(14, Math.max(4, Math.ceil(alvo / 4)));
    for (const n of planoTodosOsNichos().slice(0, quantidade)) termos.push(n.label);
  } else {
    const niche = (nichoId ? buscarNichoPorId(nichoId) : undefined) ?? buscarNichoPorLabel(nicho);
    if (niche) termos.push(...niche.searchTerms);
    else termos.push(nicho.trim());
  }

  const vistos = new Set<string>();
  const consultas: string[] = [];
  for (const termo of termos) {
    const query = `${termo} em ${local}`;
    const chave = query.toLowerCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    consultas.push(query);
  }
  return consultas;
}
