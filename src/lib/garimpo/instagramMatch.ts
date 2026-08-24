/**
 * Correspondência determinística entre um resultado de busca web e a empresa
 * vinda do Google Maps. Sem I/O — puro e auditável.
 */

export interface InstagramCandidate {
  handle: string; // @usuario
  url: string; // https://www.instagram.com/usuario/
  username: string;
  score: number;
  confidence: "high" | "medium" | "low";
  motivos: string[];
}

export interface EmpresaRef {
  nomeEmpresa: string;
  cidade: string | null;
  estado: string | null;
  categoria: string | null;
  endereco: string | null;
  telefone: string | null;
}

export interface SearchHit {
  url: string;
  title?: string | null;
  description?: string | null;
}

const TERMOS_SOCIETARIOS = /\b(ltda|me|epp|eireli|s\/a|sa|mei|cia|comercio|com)\b/g;

export function normalizarTexto(valor: string | null | undefined): string {
  if (!valor) return "";
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nomeBase(nome: string): string {
  return normalizarTexto(nome).replace(TERMOS_SOCIETARIOS, " ").replace(/\s+/g, " ").trim();
}

function apenasDigitos(valor: string | null | undefined): string {
  return (valor ?? "").replace(/\D/g, "");
}

const CAMINHOS_INVALIDOS = new Set([
  "p",
  "reel",
  "reels",
  "tv",
  "stories",
  "explore",
  "accounts",
  "directory",
  "login",
  "popular",
  "s",
  "about",
  "legal",
  "developer",
  "privacy",
  "web",
]);

/** Extrai o username do perfil de uma URL do Instagram; null se não for perfil. */
export function extrairUsername(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!/(^|\.)instagram\.com$/.test(parsed.hostname.toLowerCase())) return null;
    const partes = parsed.pathname.split("/").filter(Boolean);
    const primeiro = partes[0]?.toLowerCase();
    if (!primeiro) return null;
    if (CAMINHOS_INVALIDOS.has(primeiro)) return null;
    if (!/^[a-z0-9._]{2,30}$/.test(primeiro)) return null;
    return primeiro;
  } catch {
    return null;
  }
}

/** Username também pode aparecer no título: "Nome (@usuario)". */
export function usernameDoTitulo(titulo: string | null | undefined): string | null {
  const m = (titulo ?? "").match(/@([A-Za-z0-9._]{2,30})/);
  return m?.[1]?.toLowerCase() ?? null;
}

function tokensRelevantes(nome: string): string[] {
  return nomeBase(nome)
    .split(" ")
    .filter((t) => t.length >= 4);
}

export function pontuar(hit: SearchHit, empresa: EmpresaRef, username: string) {
  const texto = normalizarTexto(`${hit.title ?? ""} ${hit.description ?? ""}`);
  const textoDigitos = apenasDigitos(`${hit.title ?? ""} ${hit.description ?? ""}`);
  const nome = nomeBase(empresa.nomeEmpresa);
  const tokens = tokensRelevantes(empresa.nomeEmpresa);
  const motivos: string[] = [];
  let score = 0;

  if (nome && texto.includes(nome)) {
    score += 40;
    motivos.push("nome exato no resultado");
  } else if (tokens.length > 0 && tokens.every((t) => texto.includes(t))) {
    score += 30;
    motivos.push("todos os termos do nome no resultado");
  }

  const userNorm = username.replace(/[._]/g, "");
  const nomeSemEspaco = nome.replace(/\s/g, "");
  if (nomeSemEspaco && userNorm.includes(nomeSemEspaco)) {
    score += 15;
    motivos.push("username contém o nome");
  } else if (tokens[0] && userNorm.includes(tokens[0])) {
    score += 8;
    motivos.push("username contém termo principal");
  }

  const cidade = normalizarTexto(empresa.cidade);
  if (cidade && (texto.includes(cidade) || userNorm.includes(cidade.replace(/\s/g, "")))) {
    score += 25;
    motivos.push("cidade compatível");
  }

  const estado = normalizarTexto(empresa.estado);
  if (estado && new RegExp(`\\b${estado}\\b`).test(texto)) {
    score += 5;
    motivos.push("estado compatível");
  }

  const categoria = normalizarTexto(empresa.categoria).split(" ")[0];
  if (categoria && categoria.length >= 5 && texto.includes(categoria)) {
    score += 10;
    motivos.push("categoria compatível");
  }

  const enderecoTokens = normalizarTexto(empresa.endereco)
    .split(" ")
    .filter((t) => t.length >= 5);
  if (enderecoTokens.length >= 2 && enderecoTokens.filter((t) => texto.includes(t)).length >= 2) {
    score += 30;
    motivos.push("endereço compatível");
  }

  const tel = apenasDigitos(empresa.telefone).slice(-8);
  if (tel.length === 8 && textoDigitos.includes(tel)) {
    score += 40;
    motivos.push("telefone compatível");
  }

  return { score, motivos };
}

export function classificar(score: number): "high" | "medium" | "low" {
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

/** Escolhe o melhor candidato entre os resultados de busca. */
export function escolherCandidato(
  hits: SearchHit[],
  empresa: EmpresaRef,
): InstagramCandidate | null {
  const porUsuario = new Map<string, InstagramCandidate>();

  for (const hit of hits) {
    const username = extrairUsername(hit.url) ?? usernameDoTitulo(hit.title);
    if (!username) continue;
    if (CAMINHOS_INVALIDOS.has(username)) continue;

    const { score, motivos } = pontuar(hit, empresa, username);
    const anterior = porUsuario.get(username);
    if (anterior && anterior.score >= score) continue;
    porUsuario.set(username, {
      username,
      handle: `@${username}`,
      url: `https://www.instagram.com/${username}/`,
      score,
      confidence: classificar(score),
      motivos,
    });
  }

  const ordenados = [...porUsuario.values()].sort((a, b) => b.score - a.score);
  return ordenados[0] ?? null;
}
