import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const searchParamsSchema = z.object({
  nicho: z.string().trim().min(2).max(120),
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
    const { coletarNoGoogleMaps, FONTE } = await import("./googleMaps.server");
    const { deduplicar } = await import("./normalize");
    const { atendePotencialMinimo } = await import("./score");

    const brutos = await coletarNoGoogleMaps(data);
    const unicos = deduplicar(brutos);

    let leads = unicos;
    if (data.filtros.somenteSemSite) leads = leads.filter((l) => !l.website);
    if (data.filtros.somenteComTelefone) leads = leads.filter((l) => Boolean(l.telefone));

    const qualificados = leads.filter((l) =>
      atendePotencialMinimo(l.potencial, data.potencialMinimo),
    );

    return {
      id: `${Date.now()}`,
      params: data,
      fonte: FONTE,
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
