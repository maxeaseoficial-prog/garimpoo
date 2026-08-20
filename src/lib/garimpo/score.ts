import type { Lead, Potencial } from "./types";

/**
 * Regra de potencial comercial — isolada de propósito.
 * Ajuste apenas aqui; não espalhe números mágicos pela aplicação.
 */
export const SCORE_RULES = {
  altoMinAvaliacoes: 100,
  medioMinAvaliacoes: 30,
  notaMinima: 4.0,
} as const;

type ScoreInput = Pick<
  Lead,
  "quantidadeAvaliacoes" | "nota" | "telefoneNormalizado" | "telefone" | "website"
>;

export function calcularPotencial(lead: ScoreInput): Potencial {
  const avaliacoes = lead.quantidadeAvaliacoes ?? 0;
  const nota = lead.nota ?? 0;
  const temTelefone = Boolean(lead.telefoneNormalizado ?? lead.telefone);
  const semSite = !lead.website;

  const base = nota >= SCORE_RULES.notaMinima && temTelefone && semSite;

  if (base && avaliacoes >= SCORE_RULES.altoMinAvaliacoes) return "ALTO";
  if (base && avaliacoes >= SCORE_RULES.medioMinAvaliacoes) return "MEDIO";
  return "BAIXO";
}

export function atendePotencialMinimo(
  potencial: Potencial,
  minimo: "TODOS" | "MEDIO_MAIS" | "ALTO",
): boolean {
  if (minimo === "TODOS") return true;
  if (minimo === "ALTO") return potencial === "ALTO";
  return potencial === "ALTO" || potencial === "MEDIO";
}

export const POTENCIAL_LABEL: Record<Potencial, string> = {
  ALTO: "Alto",
  MEDIO: "Médio",
  BAIXO: "Baixo",
};
