import type { Lead, SearchParams } from "./types";
import { comPotencial, isWebsiteProprio, normalizarTelefoneBR } from "./normalize";

/**
 * Coleta de empresas via Google Maps Platform — Places API (New).
 * Todas as chamadas passam pelo Connector Gateway da Lovable (server-side).
 */
export const FONTE = "Google Maps Platform / Places API (New)";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const PAGE_SIZE = 20;
/** Limite real da Places API (New) para searchText: 3 páginas de 20. */
export const MAX_RESULTADOS = 60;

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.primaryTypeDisplayName",
  "places.formattedAddress",
  "places.addressComponents",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.googleMapsUri",
  "nextPageToken",
].join(",");

interface AddressComponent {
  longText?: string;
  shortText?: string;
  types?: string[];
}

interface GooglePlace {
  id?: string;
  displayName?: { text?: string };
  primaryTypeDisplayName?: { text?: string };
  formattedAddress?: string;
  addressComponents?: AddressComponent[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
}

function componente(place: GooglePlace, tipo: string, curto = false): string | null {
  const item = place.addressComponents?.find((c) => c.types?.includes(tipo));
  const valor = curto ? item?.shortText : item?.longText;
  return valor?.trim() || null;
}

export function normalizarPlace(place: GooglePlace): Lead | null {
  const nomeEmpresa = place.displayName?.text?.trim() ?? "";
  if (!nomeEmpresa) return null;

  const telefone =
    place.nationalPhoneNumber?.trim() || place.internationalPhoneNumber?.trim() || null;
  const websiteBruto = place.websiteUri?.trim() || null;
  const website = isWebsiteProprio(websiteBruto) ? websiteBruto : null;

  return comPotencial({
    id: place.id ?? `${nomeEmpresa}-${telefone ?? ""}`,
    placeId: place.id ?? null,
    nomeEmpresa,
    categoria: place.primaryTypeDisplayName?.text?.trim() || null,
    endereco: place.formattedAddress?.trim() || null,
    cidade: componente(place, "administrative_area_level_2"),
    estado: componente(place, "administrative_area_level_1", true),
    telefone,
    telefoneNormalizado: normalizarTelefoneBR(telefone),
    whatsapp: null,
    email: null,
    instagram: null,
    instagramUrl: null,
    responsavel: null,
    website,
    googleMapsUrl: place.googleMapsUri ?? null,
    nota: typeof place.rating === "number" ? place.rating : null,
    quantidadeAvaliacoes:
      typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    fonte: FONTE,
    dataColeta: new Date().toISOString(),
  });
}

export interface Diagnostico {
  requestedTarget: number;
  rawFetched: number;
  duplicatesRemoved: number;
  withWebsiteRemoved: number;
  withoutPhoneRemoved: number;
  potentialRemoved: number;
  validCount: number;
  consultasExecutadas: number;
  chamadasHttp: number;
  metaAtingida: boolean;
}

export type Rejeicao = "ok" | "website" | "telefone" | "potencial";

/** Limites de segurança — nunca chamar o Google indefinidamente. */
const MAX_CONSULTAS = 14;
const MAX_CHAMADAS = 40;
const MAX_PAGINAS_POR_CONSULTA = 3;

async function paginaSearchText(
  textQuery: string,
  pageToken: string | undefined,
  lovableKey: string,
  mapsKey: string,
) {
  const body: Record<string, unknown> = {
    textQuery,
    languageCode: "pt-BR",
    regionCode: "BR",
    pageSize: PAGE_SIZE,
  };
  if (pageToken) body["pageToken"] = pageToken;

  const response = await fetch(`${GATEWAY_URL}/places/v1/places:searchText`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": mapsKey,
      "Content-Type": "application/json",
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (response.status === 429) throw new Error("GOOGLE_RATE_LIMIT");
  if (!response.ok) {
    const texto = await response.text();
    console.error(`Places API falhou [${response.status}]: ${texto.slice(0, 300)}`);
    if (response.status === 403) throw new Error("GOOGLE_REQUEST_DENIED");
    throw new Error(`GOOGLE_ERRO_${response.status}`);
  }

  return (await response.json()) as { places?: GooglePlace[]; nextPageToken?: string };
}

/**
 * Busca progressiva: consulta lotes reais no Google, normaliza, deduplica
 * globalmente por placeId e aplica os filtros ANTES de contar a meta.
 * Para assim que atinge o alvo de leads VÁLIDOS ou esgota fontes/limites.
 */
export async function garimparComMeta(opts: {
  consultas: string[];
  alvo: number;
  aceitar: (lead: Lead) => Rejeicao;
}): Promise<{ leads: Lead[]; diagnostico: Diagnostico }> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !mapsKey) throw new Error("INTEGRACAO_NAO_CONFIGURADA");

  const { chaveDeduplicacao } = await import("./normalize");
  const alvo = Math.max(1, opts.alvo);
  const vistos = new Set<string>();
  const validos: Lead[] = [];
  const diag: Diagnostico = {
    requestedTarget: alvo,
    rawFetched: 0,
    duplicatesRemoved: 0,
    withWebsiteRemoved: 0,
    withoutPhoneRemoved: 0,
    potentialRemoved: 0,
    validCount: 0,
    consultasExecutadas: 0,
    chamadasHttp: 0,
    metaAtingida: false,
  };

  for (const textQuery of opts.consultas.slice(0, MAX_CONSULTAS)) {
    if (validos.length >= alvo || diag.chamadasHttp >= MAX_CHAMADAS) break;
    diag.consultasExecutadas += 1;

    let pageToken: string | undefined;
    const tokensUsados = new Set<string>();

    for (let pagina = 0; pagina < MAX_PAGINAS_POR_CONSULTA; pagina++) {
      if (validos.length >= alvo || diag.chamadasHttp >= MAX_CHAMADAS) break;
      diag.chamadasHttp += 1;
      const json = await paginaSearchText(textQuery, pageToken, lovableKey, mapsKey);
      const places = json.places ?? [];
      diag.rawFetched += places.length;

      for (const place of places) {
        const lead = normalizarPlace(place);
        if (!lead) continue;
        const chave = chaveDeduplicacao(lead);
        if (vistos.has(chave)) {
          diag.duplicatesRemoved += 1;
          continue;
        }
        vistos.add(chave);

        const veredito = opts.aceitar(lead);
        if (veredito === "website") diag.withWebsiteRemoved += 1;
        else if (veredito === "telefone") diag.withoutPhoneRemoved += 1;
        else if (veredito === "potencial") diag.potentialRemoved += 1;
        else if (validos.length < alvo) validos.push(lead);

        if (validos.length >= alvo) break;
      }

      const proximo = json.nextPageToken;
      if (!proximo || tokensUsados.has(proximo) || places.length === 0) break;
      tokensUsados.add(proximo);
      pageToken = proximo;
    }
  }

  diag.validCount = validos.length;
  diag.metaAtingida = validos.length >= alvo;
  return { leads: validos.slice(0, alvo), diagnostico: diag };
}
