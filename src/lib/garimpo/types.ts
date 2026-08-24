export type Potencial = "ALTO" | "MEDIO" | "BAIXO";

export interface Lead {
  id: string;
  placeId: string | null;
  nomeEmpresa: string;
  categoria: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  telefoneNormalizado: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  instagramUrl: string | null;
  /** Auditoria interna do enriquecimento (não exibida ao usuário). */
  instagramConfidence?: "high";
  instagramSource?: string;
  responsavel: string | null;
  website: string | null;
  googleMapsUrl: string | null;
  nota: number | null;
  quantidadeAvaliacoes: number | null;
  potencial: Potencial;
  fonte: string;
  dataColeta: string;
}

export interface SearchFilters {
  somenteSemSite: boolean;
  somenteComTelefone: boolean;
  buscarEmail: boolean;
  buscarInstagram: boolean;
}

export interface SearchParams {
  nicho: string;
  /** id do nicho na taxonomia, "todos", ou null para busca personalizada. */
  nichoId?: string | null;
  localizacao: string;
  quantidade: number;
  potencialMinimo: "TODOS" | "MEDIO_MAIS" | "ALTO";
  filtros: SearchFilters;
}

export interface SearchDiagnostico {
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

export interface SearchStats {
  meta: number;
  metaAtingida: boolean;
  diagnostico: SearchDiagnostico;
  totalBruto: number;
  aposDeduplicacao: number;
  semSite: number;
  comTelefone: number;
  comEmail: number;
  comInstagram: number;
  qualificados: number;
  enriquecimento?: {
    firecrawlSearchRequests: number;
    firecrawlCreditsUsed: number | null;
    instagramFound: number;
    instagramNotFound: number;
    cacheHits: number;
  };
}

export interface PlanilhaRef {
  provider: "microsoft_excel";
  fileId: string;
  url: string;
  nome: string;
  criadoEm: string;
}

export interface SearchResult {
  id: string;
  params: SearchParams;
  stats: SearchStats;
  leads: Lead[];
  fonte: string;
  criadoEm: string;
  planilha?: PlanilhaRef;
}

export interface HistoryEntry {
  id: string;
  nicho: string;
  localizacao: string;
  quantidade: number;
  leads: number;
  criadoEm: string;
  planilha?: PlanilhaRef;
}
