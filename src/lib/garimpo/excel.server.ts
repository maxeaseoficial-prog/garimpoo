import * as XLSX from "xlsx";
import type { Lead } from "./types";
import { POTENCIAL_LABEL } from "./score";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/microsoft_excel";

export const COLUNAS_PLANILHA = [
  "Empresa",
  "Categoria",
  "Telefone",
  "WhatsApp",
  "Instagram",
  "E-mail",
  "Website",
  "Endereço",
  "Cidade",
  "Estado",
  "Nota",
  "Avaliações",
  "Potencial",
  "Google Maps",
  "Fonte",
  "Data da coleta",
] as const;

function linha(lead: Lead, nicho: string): (string | number)[] {
  return [
    lead.nomeEmpresa,
    lead.categoria ?? nicho,
    lead.telefoneNormalizado ?? lead.telefone ?? "",
    lead.whatsapp ?? "",
    lead.instagramUrl ?? "",
    lead.email ?? "",
    lead.website ?? "",
    lead.endereco ?? "",
    lead.cidade ?? "",
    lead.estado ?? "",
    lead.nota ?? "",
    lead.quantidadeAvaliacoes ?? "",
    POTENCIAL_LABEL[lead.potencial],
    lead.googleMapsUrl ?? "",
    lead.fonte,
    new Date(lead.dataColeta).toLocaleString("pt-BR"),
  ];
}

export function sanitizarNomeArquivo(valor: string): string {
  return (
    valor
      .replace(/[\\/:*?"<>|#%]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 60) || "sem-nome"
  );
}

export function nomeArquivo(nicho: string, cidade: string, data = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  const carimbo = `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())} ${p(data.getHours())}-${p(data.getMinutes())}`;
  return `Garimpo - ${sanitizarNomeArquivo(nicho)} - ${sanitizarNomeArquivo(cidade)} - ${carimbo}.xlsx`;
}

export function montarWorkbook(leads: Lead[], nicho: string): ArrayBuffer {
  const dados: (string | number)[][] = [
    [...COLUNAS_PLANILHA],
    ...leads.map((lead) => linha(lead, nicho)),
  ];
  const ws = XLSX.utils.aoa_to_sheet(dados);
  // Telefone e WhatsApp sempre como texto (colunas C e D).
  for (let r = 1; r < dados.length; r += 1) {
    for (const col of ["C", "D"]) {
      const cell = ws[`${col}${r + 1}`];
      if (cell) cell.t = "s";
    }
  }
  ws["!cols"] = COLUNAS_PLANILHA.map((titulo) => ({ wch: Math.max(14, titulo.length + 4) }));
  ws["!freeze"] = { xSplit: "0", ySplit: "1", topLeftCell: "A2", activePane: "bottomLeft" };
  ws["!autofilter"] = { ref: XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 0, c: COLUNAS_PLANILHA.length - 1 } }) };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export interface PlanilhaCriada {
  fileId: string;
  webUrl: string;
  nome: string;
  linhas: number;
}

/** Cria o workbook completo (cabeçalho + leads) em UMA única requisição ao Microsoft Graph. */
export async function criarPlanilhaExcel(
  leads: Lead[],
  nicho: string,
  cidade: string,
): Promise<PlanilhaCriada> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["MICROSOFT_EXCEL_API_KEY"];
  if (!lovableKey || !connectionKey) throw new Error("CONECTOR_EXCEL_INDISPONIVEL");
  if (leads.length === 0) throw new Error("Nenhum lead para exportar.");

  const buffer = montarWorkbook(leads, nicho);
  const nome = nomeArquivo(nicho, cidade);
  const caminho = encodeURIComponent(`Garimpo/${nome}`);
  const url = `${GATEWAY_URL}/me/drive/root:/${caminho}:/content?@microsoft.graph.conflictBehavior=rename`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });
  } catch (error) {
    console.error("Erro de rede ao criar planilha:", error);
    throw new Error("Falha de rede ao falar com o Microsoft Excel.");
  }

  if (!res.ok) {
    const corpo = await res.text();
    console.error(`Excel gateway falhou [${res.status}]: ${corpo.slice(0, 500)}`);
    if (res.status === 401 || res.status === 403)
      throw new Error("A conexão Microsoft Excel expirou ou não tem permissão. Reconecte o conector.");
    if (res.status === 429) throw new Error("Limite de requisições da Microsoft atingido. Tente novamente em instantes.");
    throw new Error(`Não foi possível criar a planilha (erro ${res.status}).`);
  }

  const item = (await res.json()) as { id?: string; webUrl?: string; name?: string; size?: number };
  if (!item.id || !item.webUrl) throw new Error("Resposta inválida da Microsoft: arquivo sem URL.");

  return {
    fileId: item.id,
    webUrl: item.webUrl,
    nome: item.name ?? nome,
    linhas: leads.length + 1,
  };
}

export async function conectorExcelDisponivel(): Promise<{ conectado: boolean; erro?: string }> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["MICROSOFT_EXCEL_API_KEY"];
  if (!lovableKey || !connectionKey) return { conectado: false, erro: "Conector não vinculado ao projeto." };
  try {
    const res = await fetch("https://connector-gateway.lovable.dev/api/v1/verify_credentials", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": connectionKey },
    });
    if (!res.ok) return { conectado: false, erro: `Gateway retornou ${res.status}.` };
    const data = (await res.json()) as { outcome?: string; error?: string };
    return data.outcome === "failed"
      ? { conectado: false, ...(data.error ? { erro: data.error } : {}) }
      : { conectado: true };
  } catch {
    return { conectado: false, erro: "Falha de rede ao verificar o conector." };
  }
}
