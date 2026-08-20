import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const searchParamsSchema = z.object({
  nicho: z.string().trim().min(2).max(120),
  localizacao: z.string().trim().min(2).max(120),
  quantidade: z.number().int().min(10).max(1000),
  potencialMinimo: z.enum(["TODOS", "MEDIO_MAIS", "ALTO"]),
  filtros: z.object({
    somenteSemSite: z.boolean(),
    somenteComTelefone: z.boolean(),
    buscarEmail: z.boolean(),
    buscarInstagram: z.boolean(),
  }),
});

export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { getApifyConfig } = await import("./apify.server");
  const { configurado, actorId } = getApifyConfig();
  return { apifyConfigurado: configurado, actorId, googleSheetsConfigurado: false };
});

export const garimparEmpresas = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => searchParamsSchema.parse(data))
  .handler(async ({ data }) => {
    const { coletarNaApify, getApifyConfig } = await import("./apify.server");
    const { deduplicar } = await import("./normalize");
    const { atendePotencialMinimo } = await import("./score");
    const { actorId } = getApifyConfig();

    const brutos = await coletarNaApify(data);
    const unicos = deduplicar(brutos);

    let leads = unicos;
    if (data.filtros.somenteSemSite) leads = leads.filter((l) => !l.website);
    if (data.filtros.somenteComTelefone) leads = leads.filter((l) => Boolean(l.telefone));
    if (!data.filtros.buscarEmail) leads = leads.map((l) => ({ ...l, email: null }));
    if (!data.filtros.buscarInstagram)
      leads = leads.map((l) => ({ ...l, instagram: null, instagramUrl: null }));

    const qualificados = leads.filter((l) =>
      atendePotencialMinimo(l.potencial, data.potencialMinimo),
    );

    return {
      id: `${Date.now()}`,
      params: data,
      actorId,
      criadoEm: new Date().toISOString(),
      stats: {
        totalBruto: brutos.length,
        aposDeduplicacao: unicos.length,
        semSite: unicos.filter((l) => !l.website).length,
        comTelefone: leads.filter((l) => Boolean(l.telefone)).length,
        comEmail: qualificados.filter((l) => Boolean(l.email)).length,
        comInstagram: qualificados.filter((l) => Boolean(l.instagram)).length,
        qualificados: qualificados.length,
      },
      leads: qualificados,
    };
  });
