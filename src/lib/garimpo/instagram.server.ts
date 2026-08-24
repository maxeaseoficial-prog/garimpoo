import type { Lead } from "./types";
import { classificar, escolherCandidato, type SearchHit } from "./instagramMatch";

/**
 * Enriquecimento de Instagram via Firecrawl Search (Connector Gateway).
 * Executa SOMENTE depois dos filtros, nos leads finais sem Instagram.
 */
const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2";
export const INSTAGRAM_SOURCE = "Firecrawl Web Search";
const LIMITE_RESULTADOS = 5;
const CONCORRENCIA = 3;
const MAX_TENTATIVAS_HTTP = 3;
const CACHE_TTL_DIAS = 14;
const CACHE_TTL_NEGATIVO_DIAS = 3;

export interface EnrichStats {
  firecrawlSearchRequests: number;
  firecrawlCreditsUsed: number | null;
  instagramFound: number;
  instagramNotFound: number;
  cacheHits: number;
}

interface FirecrawlSearchResult {
  hits: SearchHit[];
  creditsUsed: number | null;
}

async function firecrawlSearch(query: string, location: string | null): Promise<FirecrawlSearchResult> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const firecrawlKey = process.env["FIRECRAWL_API_KEY"];
  if (!lovableKey || !firecrawlKey) throw new Error("FIRECRAWL_NAO_CONFIGURADO");

  const body: Record<string, unknown> = {
    query,
    limit: LIMITE_RESULTADOS,
    country: "br",
    lang: "pt",
  };
  if (location) body["location"] = location;

  let ultimaFalha = "";
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS_HTTP; tentativa++) {
    const response = await fetch(`${GATEWAY}/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": firecrawlKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const json = (await response.json()) as {
        success?: boolean;
        error?: string;
        data?: { web?: SearchHit[] } | SearchHit[];
        creditsUsed?: number;
      };
      // A Firecrawl devolve rate limit com HTTP 200 e success:false.
      if (json.success === false) {
        ultimaFalha = String(json.error ?? "resposta sem sucesso").slice(0, 200);
        if (/rate limit/i.test(ultimaFalha)) {
          await new Promise((r) => setTimeout(r, 5000 * (tentativa + 1)));
          continue;
        }
        break;
      }
      const web = Array.isArray(json.data) ? json.data : (json.data?.web ?? []);
      return {
        hits: web ?? [],
        creditsUsed: typeof json.creditsUsed === "number" ? json.creditsUsed : null,
      };
    }

    ultimaFalha = `${response.status}: ${(await response.text()).slice(0, 200)}`;
    if (response.status === 429 || response.status >= 500) {
      await new Promise((r) => setTimeout(r, 800 * (tentativa + 1)));
      continue;
    }
    break;
  }
  throw new Error(`FIRECRAWL_ERRO ${ultimaFalha}`);
}

function aspas(valor: string): string {
  return `"${valor.replace(/"/g, "")}"`;
}

export function montarConsultas(lead: Lead): string[] {
  const nome = aspas(lead.nomeEmpresa);
  const cidade = lead.cidade ? aspas(lead.cidade) : "";
  const primeira = `site:instagram.com ${nome} ${cidade}`.trim();
  const segunda = [
    "site:instagram.com",
    nome,
    cidade,
    lead.estado ? aspas(lead.estado) : "",
    lead.categoria ? aspas(lead.categoria) : "",
  ]
    .filter(Boolean)
    .join(" ");
  return segunda === primeira ? [primeira] : [primeira, segunda];
}

interface CacheRow {
  place_id: string;
  instagram_handle: string | null;
  instagram_url: string | null;
  confidence: string | null;
  checked_at: string;
}

function cacheValido(row: CacheRow): boolean {
  const dias = (Date.now() - new Date(row.checked_at).getTime()) / 86_400_000;
  return dias <= (row.instagram_url ? CACHE_TTL_DIAS : CACHE_TTL_NEGATIVO_DIAS);
}

/**
 * Enriquece os leads finais. Nunca altera a quantidade de leads.
 */
export async function enriquecerInstagram(
  leads: Lead[],
): Promise<{ leads: Lead[]; stats: EnrichStats }> {
  const stats: EnrichStats = {
    firecrawlSearchRequests: 0,
    firecrawlCreditsUsed: null,
    instagramFound: 0,
    instagramNotFound: 0,
    cacheHits: 0,
  };

  const pendentes = leads.filter((l) => !l.instagram);
  if (pendentes.length === 0) return { leads, stats };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const placeIds = pendentes.map((l) => l.placeId).filter((v): v is string => Boolean(v));
  const cache = new Map<string, CacheRow>();
  if (placeIds.length > 0) {
    const { data } = await supabaseAdmin
      .from("instagram_cache")
      .select("place_id,instagram_handle,instagram_url,confidence,checked_at")
      .in("place_id", placeIds);
    for (const row of (data ?? []) as CacheRow[]) {
      if (cacheValido(row)) cache.set(row.place_id, row);
    }
  }

  const resultados = new Map<string, { handle: string; url: string } | null>();

  async function processar(lead: Lead) {
    const cached = lead.placeId ? cache.get(lead.placeId) : undefined;
    if (cached) {
      stats.cacheHits += 1;
      resultados.set(
        lead.id,
        cached.instagram_url && cached.instagram_handle
          ? { handle: cached.instagram_handle, url: cached.instagram_url }
          : null,
      );
      return;
    }

    const location = lead.cidade
      ? `${lead.cidade}${lead.estado ? `, ${lead.estado}` : ""}, Brazil`
      : "Brazil";

    let aceito: { handle: string; url: string } | null = null;
    for (const consulta of montarConsultas(lead)) {
      let resposta: FirecrawlSearchResult;
      try {
        stats.firecrawlSearchRequests += 1;
        resposta = await firecrawlSearch(consulta, location);
      } catch (erro) {
        console.error("Firecrawl search falhou:", String(erro).slice(0, 200));
        break;
      }
      if (resposta.creditsUsed != null) {
        stats.firecrawlCreditsUsed = (stats.firecrawlCreditsUsed ?? 0) + resposta.creditsUsed;
      }

      const candidato = escolherCandidato(resposta.hits, {
        nomeEmpresa: lead.nomeEmpresa,
        cidade: lead.cidade,
        estado: lead.estado,
        categoria: lead.categoria,
        endereco: lead.endereco,
        telefone: lead.telefoneNormalizado ?? lead.telefone,
      });

      if (candidato && classificar(candidato.score) === "high") {
        aceito = { handle: candidato.handle, url: candidato.url };
        break;
      }
    }

    resultados.set(lead.id, aceito);
    if (aceito) stats.instagramFound += 1;
    else stats.instagramNotFound += 1;

    if (lead.placeId) {
      await supabaseAdmin.from("instagram_cache").upsert({
        place_id: lead.placeId,
        instagram_handle: aceito?.handle ?? null,
        instagram_url: aceito?.url ?? null,
        confidence: aceito ? "high" : null,
        source: aceito ? INSTAGRAM_SOURCE : null,
        checked_at: new Date().toISOString(),
      });
    }
  }

  const fila = [...pendentes];
  await Promise.all(
    Array.from({ length: Math.min(CONCORRENCIA, fila.length) }, async () => {
      for (;;) {
        const lead = fila.shift();
        if (!lead) return;
        await processar(lead);
      }
    }),
  );

  const enriquecidos = leads.map((lead) => {
    if (lead.instagram) return lead;
    const achado = resultados.get(lead.id);
    if (!achado) return lead;
    return {
      ...lead,
      instagram: achado.handle,
      instagramUrl: achado.url,
      instagramConfidence: "high" as const,
      instagramSource: INSTAGRAM_SOURCE,
    };
  });

  return { leads: enriquecidos, stats };
}
