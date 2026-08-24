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
  localizacao: string;
  quantidade: number;
  potencialMinimo: "TODOS" | "MEDIO_MAIS" | "ALTO";
  filtros: SearchFilters;
}

export interface SearchStats {
  totalBruto: number;
  aposDeduplicacao: number;
  semSite: number;
  comTelefone: number;
  comEmail: number;
  comInstagram: number;
  qualificados: number;
}

export interface SearchResult {
  id: string;
  params: SearchParams;
  stats: SearchStats;
  leads: Lead[];
  fonte: string;
  criadoEm: string;
}

export interface HistoryEntry {
  id: string;
  nicho: string;
  localizacao: string;
  quantidade: number;
  leads: number;
  criadoEm: string;
}
