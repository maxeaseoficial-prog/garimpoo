import type { Lead } from "./types";
import { calcularPotencial } from "./score";

/** Domínios que NÃO são website próprio da empresa. */
const NAO_SAO_SITE = [
  "google.com",
  "goo.gl",
  "maps.app.goo.gl",
  "instagram.com",
  "facebook.com",
  "fb.com",
  "fb.me",
  "wa.me",
  "api.whatsapp.com",
  "whatsapp.com",
  "linktr.ee",
  "linkedin.com",
  "tiktok.com",
  "youtube.com",
  "twitter.com",
  "x.com",
  "ifood.com.br",
  "doctoralia.com.br",
  "booking.com",
];

export function isWebsiteProprio(url: string | null | undefined): boolean {
  if (!url) return false;
  const raw = String(url).trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!host.includes(".")) return false;
    return !NAO_SAO_SITE.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/** Normaliza telefones brasileiros para E.164 quando possível. Nunca altera o original. */
export function normalizarTelefoneBR(telefone: string | null | undefined): string | null {
  if (!telefone) return null;
  const digits = String(telefone).replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return `+${digits}`;
  }
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`;
  return null;
}

/** Só aceita e-mails reais e plausíveis. Nunca fabricar. */
export function limparEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const value = email.trim().toLowerCase();
  const ok = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(value);
  if (!ok) return null;
  if (/(sentry|wixpress|example\.com|no-?reply)/.test(value)) return null;
  return value;
}

const EMAIL_PRIORIDADE = ["contato@", "comercial@", "atendimento@", "vendas@", "faleconosco@"];

export function escolherMelhorEmail(emails: unknown): string | null {
  const lista = (Array.isArray(emails) ? emails : [emails])
    .map(limparEmail)
    .filter((e): e is string => Boolean(e));
  if (lista.length === 0) return null;
  for (const prefixo of EMAIL_PRIORIDADE) {
    const achado = lista.find((e) => e.startsWith(prefixo));
    if (achado) return achado;
  }
  return lista[0] ?? null;
}

export function extrairInstagram(valores: unknown): { username: string; url: string } | null {
  const lista = (Array.isArray(valores) ? valores : [valores]).filter(
    (v): v is string => typeof v === "string",
  );
  for (const item of lista) {
    const match = item.match(/instagram\.com\/([A-Za-z0-9_.]+)/i);
    if (match?.[1]) {
      const username = match[1].replace(/\/$/, "");
      if (!username || ["p", "reel", "explore"].includes(username)) continue;
      return { username: `@${username}`, url: `https://instagram.com/${username}` };
    }
  }
  return null;
}

export function chaveDeduplicacao(lead: Lead): string {
  if (lead.placeId) return `place:${lead.placeId}`;
  const nome = lead.nomeEmpresa.toLowerCase().replace(/[^a-z0-9]/g, "");
  const tel = lead.telefoneNormalizado ?? lead.telefone ?? "";
  const end = (lead.endereco ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `n:${nome}|t:${tel.replace(/\D/g, "")}|e:${end}`;
}

export function deduplicar(leads: Lead[]): Lead[] {
  const mapa = new Map<string, Lead>();
  for (const lead of leads) {
    const chave = chaveDeduplicacao(lead);
    const existente = mapa.get(chave);
    if (!existente) {
      mapa.set(chave, lead);
      continue;
    }
    // mantém o registro mais completo
    const score = (l: Lead) =>
      [l.telefone, l.email, l.instagram, l.endereco, l.nota].filter(Boolean).length;
    if (score(lead) > score(existente)) mapa.set(chave, lead);
  }
  return [...mapa.values()];
}

/** Recalcula potencial após qualquer transformação. */
export function comPotencial(lead: Omit<Lead, "potencial">): Lead {
  return { ...lead, potencial: calcularPotencial(lead as Lead) };
}
