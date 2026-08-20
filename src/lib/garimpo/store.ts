import type { HistoryEntry, SearchResult } from "./types";

const HISTORY_KEY = "garimpo:historico";
const RESULT_PREFIX = "garimpo:resultado:";
const LAST_KEY = "garimpo:ultimo";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function salvarResultado(resultado: SearchResult) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RESULT_PREFIX + resultado.id, JSON.stringify(resultado));
    localStorage.setItem(LAST_KEY, resultado.id);
    const historico = lerHistorico();
    const entrada: HistoryEntry = {
      id: resultado.id,
      nicho: resultado.params.nicho,
      localizacao: resultado.params.localizacao,
      quantidade: resultado.params.quantidade,
      leads: resultado.leads.length,
      criadoEm: resultado.criadoEm,
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([entrada, ...historico].slice(0, 30)));
  } catch {
    /* armazenamento indisponível */
  }
}

export function lerHistorico(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  return safeParse<HistoryEntry[]>(localStorage.getItem(HISTORY_KEY), []);
}

export function lerResultado(id: string | null): SearchResult | null {
  if (typeof window === "undefined" || !id) return null;
  return safeParse<SearchResult | null>(localStorage.getItem(RESULT_PREFIX + id), null);
}

export function idUltimoResultado(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_KEY);
}

export function limparHistorico() {
  if (typeof window === "undefined") return;
  for (const entrada of lerHistorico()) localStorage.removeItem(RESULT_PREFIX + entrada.id);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(LAST_KEY);
}
