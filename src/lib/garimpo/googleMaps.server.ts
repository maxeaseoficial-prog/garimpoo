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

export async function coletarNoGoogleMaps(params: SearchParams): Promise<Lead[]> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !mapsKey) throw new Error("INTEGRACAO_NAO_CONFIGURADA");

  const textQuery = `${params.nicho} em ${params.localizacao}`;
  const alvo = Math.min(params.quantidade, MAX_RESULTADOS);

  const vistos = new Set<string>();
  const leads: Lead[] = [];
  let pageToken: string | undefined;
  const tokensUsados = new Set<string>();

  while (leads.length < alvo) {
    const body: Record<string, unknown> = {
      textQuery,
      languageCode: "pt-BR",
      regionCode: "BR",
      pageSize: Math.min(PAGE_SIZE, alvo - leads.length),
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
      console.error(`Places API falhou [${response.status}]: ${texto.slice(0, 500)}`);
      if (response.status === 403) throw new Error("GOOGLE_REQUEST_DENIED");
      throw new Error(`GOOGLE_ERRO_${response.status}`);
    }

    const json = (await response.json()) as {
      places?: GooglePlace[];
      nextPageToken?: string;
    };

    for (const place of json.places ?? []) {
      const chave = place.id ?? place.displayName?.text ?? "";
      if (chave && vistos.has(chave)) continue;
      if (chave) vistos.add(chave);
      const lead = normalizarPlace(place);
      if (lead) leads.push(lead);
    }

    const proximo = json.nextPageToken;
    if (!proximo || tokensUsados.has(proximo) || (json.places ?? []).length === 0) break;
    tokensUsados.add(proximo);
    pageToken = proximo;
  }

  return leads.slice(0, alvo);
}
