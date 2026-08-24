import type { Lead } from "./types";
import { POTENCIAL_LABEL } from "./score";

export const COLUNAS_EXPORT = [
  "Empresa",
  "Nicho",
  "Endereço",
  "Cidade",
  "Estado",
  "Telefone",
  "WhatsApp",
  "E-mail",
  "Instagram",
  "Responsável",
  "Avaliações",
  "Nota",
  "Website",
  "Google Maps",
  "Potencial",
  "Status",
  "Data da coleta",
] as const;

export function leadParaLinha(lead: Lead, nicho: string): string[] {
  return [
    lead.nomeEmpresa,
    lead.categoria ?? nicho,
    lead.endereco ?? "",
    lead.cidade ?? "",
    lead.estado ?? "",
    lead.telefoneNormalizado ?? lead.telefone ?? "",
    lead.whatsapp ?? "",
    lead.email ?? "Não encontrado",
    lead.instagramUrl ?? "",
    lead.responsavel ?? "Não encontrado",
    lead.quantidadeAvaliacoes != null ? String(lead.quantidadeAvaliacoes) : "",
    lead.nota != null ? String(lead.nota).replace(".", ",") : "",
    lead.website ?? "Sem site",
    lead.googleMapsUrl ?? "",
    POTENCIAL_LABEL[lead.potencial],
    "Novo",
    new Date(lead.dataColeta).toLocaleString("pt-BR"),
  ];
}

function escapar(valor: string): string {
  const v = valor.replace(/"/g, '""');
  return /[";\n]/.test(v) ? `"${v}"` : v;
}

export function gerarCSV(leads: Lead[], nicho: string): string {
  const linhas = [
    COLUNAS_EXPORT.join(";"),
    ...leads.map((lead) => leadParaLinha(lead, nicho).map(escapar).join(";")),
  ];
  return `\uFEFF${linhas.join("\r\n")}`;
}

export function baixarCSV(leads: Lead[], nicho: string, localizacao: string) {
  const csv = gerarCSV(leads, nicho);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = `${nicho}-${localizacao}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  a.href = url;
  a.download = `garimpo-${slug || "leads"}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
