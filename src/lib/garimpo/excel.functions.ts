import { createServerFn } from "@tanstack/react-start";
import type { Lead } from "./types";

interface ExportInput {
  leads: Lead[];
  nicho: string;
  localizacao: string;
}

export const getExcelStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { conectorExcelDisponivel } = await import("./excel.server");
  const status = await conectorExcelDisponivel();
  return {
    conectado: status.conectado,
    servico: "Microsoft Excel",
    conexao: "Garimpo Planilhas",
    autenticacao: "OAuth2",
    ...(status.erro ? { erro: status.erro } : {}),
  };
});

export const exportarParaPlanilha = createServerFn({ method: "POST" })
  .inputValidator((input: ExportInput) => {
    if (!input || !Array.isArray(input.leads) || input.leads.length === 0)
      throw new Error("Nenhum lead para exportar.");
    return input;
  })
  .handler(async ({ data }) => {
    const { criarPlanilhaExcel } = await import("./excel.server");
    const planilha = await criarPlanilhaExcel(data.leads, data.nicho, data.localizacao);
    return {
      provider: "microsoft_excel" as const,
      fileId: planilha.fileId,
      url: planilha.webUrl,
      nome: planilha.nome,
      linhas: planilha.linhas,
      criadoEm: new Date().toISOString(),
    };
  });
