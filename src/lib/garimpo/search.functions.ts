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
    const { garimparComMeta, FONTE, type Rejeicao } = { ...(await import("./googleMaps.server")) } as never;
    return garimparComMeta as never;
  });

