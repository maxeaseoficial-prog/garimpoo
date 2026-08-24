import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const searchParamsSchema = z.object({
  nicho: z.string().trim().min(2).max(120),
  nichoId: z.string().trim().max(60).nullable().optional(),
  localizacao: z.string().trim().min(2).max(120),
  quantidade: z.number().int().min(10).max(60),
  potencialMinimo: z.enum(["TODOS", "MEDIO_MAIS", "ALTO"]),
  filtros: z.object({
    somenteSemSite: z.boolean(),
    somenteComTelefone: z.boolean(),
    buscarEmail: z.boolean(),
    buscarInstagram: z.boolean(),
  }),
});


/** Status da fonte de coleta. Nunca retorna credenciais. */
export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(async () => {
  const configurado = Boolean(
    process.env["LOVABLE_API_KEY"] && process.env["GOOGLE_MAPS_API_KEY"],
  );
  return {
    googleMapsConfigurado: configurado,
    fonte: "Google Maps Platform",
    api: "Places API (New)",
    conexao: "Maps Garimpo",
    modo: "Gerenciado pela Lovable",
  };
});

export const garimparEmpresas = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => searchParamsSchema.parse(data))
  .handler(async ({ data }) => {
    const { garimparComMeta, FONTE } = await import("./googleMaps.server");
    const { atendePotencialMinimo } = await import("./score");
    const { montarConsultas } = await import("./queryPlan");

    const consultas = montarConsultas(
      data.nicho,
      data.nichoId ?? null,
      data.localizacao,
      data.quantidade,
    );

    const { leads, diagnostico } = await garimparComMeta({
      consultas,
      alvo: data.quantidade,
      aceitar: (lead) => {
        if (data.filtros.somenteSemSite && lead.website) return "website";
        if (data.filtros.somenteComTelefone && !lead.telefone) return "telefone";
        if (!atendePotencialMinimo(lead.potencial, data.potencialMinimo)) return "potencial";
        return "ok";
      },
    });

    return {
      id: `${Date.now()}`,
      params: data,
      fonte: FONTE,
      criadoEm: new Date().toISOString(),
      stats: {
        meta: data.quantidade,
        metaAtingida: diagnostico.metaAtingida,
        diagnostico,
        totalBruto: diagnostico.rawFetched,
        aposDeduplicacao: diagnostico.rawFetched - diagnostico.duplicatesRemoved,
        semSite: leads.filter((l) => !l.website).length,
        comTelefone: leads.filter((l) => Boolean(l.telefone)).length,
        comEmail: leads.filter((l) => Boolean(l.email)).length,
        comInstagram: leads.filter((l) => Boolean(l.instagram)).length,
        qualificados: leads.length,
      },
      leads,
    };
  });


