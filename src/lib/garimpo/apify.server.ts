import type { Lead, SearchParams } from "./types";
import {
  comPotencial,
  escolherMelhorEmail,
  extrairInstagram,
  isWebsiteProprio,
  limparEmail,
  normalizarTelefoneBR,
} from "./normalize";

/**
 * Camada isolada de integração com a Apify.
 * O token NUNCA sai do servidor.
 */
export const DEFAULT_ACTOR_ID = "compass~crawler-google-places";

export function getApifyConfig() {
  const token = process.env["APIFY_API_TOKEN"] ?? null;
  const actorId = process.env["APIFY_ACTOR_ID"] ?? DEFAULT_ACTOR_ID;
  return { token, actorId, configurado: Boolean(token) };
}

interface ApifyPlace {
  placeId?: string;
  title?: string;
  categoryName?: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  url?: string;
  totalScore?: number;
  reviewsCount?: number;
  emails?: string[];
  instagrams?: string[];
  facebooks?: string[];
  linkedIns?: string[];
  twitters?: string[];
  contactPerson?: string;
  ownerName?: string;
  whatsapp?: string;
  whatsapps?: string[];
  [key: string]: unknown;
}

export function normalizarPlace(place: ApifyPlace, fonte: string): Lead | null {
  const nomeEmpresa = (place.title ?? "").trim();
  if (!nomeEmpresa) return null;

  const telefone = place.phone?.trim() || place.phoneUnformatted?.trim() || null;
  const websiteBruto = typeof place.website === "string" ? place.website.trim() : null;
  const website = isWebsiteProprio(websiteBruto) ? websiteBruto : null;

  const instagram = extrairInstagram(place.instagrams ?? []);
  const whatsappBruto = place.whatsapp ?? (place.whatsapps ?? [])[0] ?? null;

  return comPotencial({
    id: place.placeId ?? `${nomeEmpresa}-${telefone ?? Math.random().toString(36).slice(2)}`,
    placeId: place.placeId ?? null,
    nomeEmpresa,
    categoria: place.categoryName?.trim() || null,
    endereco: place.address?.trim() || null,
    cidade: place.city?.trim() || null,
    estado: place.state?.trim() || null,
    telefone,
    telefoneNormalizado: normalizarTelefoneBR(telefone),
    whatsapp: whatsappBruto ? normalizarTelefoneBR(String(whatsappBruto)) : null,
    email: escolherMelhorEmail(place.emails ?? []) ?? limparEmail(place["email"]),
    instagram: instagram?.username ?? null,
    instagramUrl: instagram?.url ?? null,
    responsavel: place.contactPerson?.trim() || place.ownerName?.trim() || null,
    website,
    googleMapsUrl:
      place.url ??
      (place.placeId
        ? `https://www.google.com/maps/place/?q=place_id:${place.placeId}`
        : null),
    nota: typeof place.totalScore === "number" ? place.totalScore : null,
    quantidadeAvaliacoes: typeof place.reviewsCount === "number" ? place.reviewsCount : null,
    fonte,
    dataColeta: new Date().toISOString(),
  });
}

export async function coletarNaApify(params: SearchParams): Promise<Lead[]> {
  const { token, actorId } = getApifyConfig();
  if (!token) throw new Error("INTEGRACAO_NAO_CONFIGURADA");

  const input = {
    searchStringsArray: [params.nicho],
    locationQuery: params.localizacao,
    maxCrawledPlacesPerSearch: params.quantidade,
    language: "pt-BR",
    countryCode: "br",
    skipClosedPlaces: true,
    scrapeContacts: params.filtros.buscarEmail || params.filtros.buscarInstagram,
    maximumLeadsEnrichmentRecords:
      params.filtros.buscarEmail || params.filtros.buscarInstagram ? params.quantidade : 0,
  };

  const url = `https://api.apify.com/v2/acts/${encodeURIComponent(
    actorId,
  )}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&timeout=280`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Apify falhou [${response.status}]: ${body.slice(0, 500)}`);
    throw new Error(`APIFY_ERRO_${response.status}`);
  }

  const items = (await response.json()) as ApifyPlace[];
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => normalizarPlace(item, `apify:${actorId}`))
    .filter((lead): lead is Lead => lead !== null);
}
