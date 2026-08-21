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

export const saveApifyToken = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ token: z.string().min(10) }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    const { error } = await supabaseAdmin
      .from("user_settings")
      .upsert({ key: "apify_token", value: data.token }, { onConflict: "key" });

    if (error) {
      console.error("Erro ao salvar token Apify:", error);
      throw new Error("FALHA_AO_SALVAR_TOKEN");
    }

    return { success: true };
  });

export const getIntegrationStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { getApifyConfig } = await import("./apify.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  
  const { data: dbSetting } = await supabaseAdmin
    .from("user_settings")
    .select("value")
    .eq("key", "apify_token")
    .single();

  const { configurado, actorId } = getApifyConfig(dbSetting?.value);
  
  // No Lovable Cloud, verificamos se o usuário está logado via context ou similar.
  // Para simplificar o status da integração "Google Sheets", vamos considerar ativado se houver sessão.
  // Em um cenário real, poderíamos verificar tokens de integração específicos.
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const googleConfigurado = users.some(u => u.identities?.some(i => i.provider === 'google'));
  
  return { 
    apifyConfigurado: configurado, 
    actorId, 
    googleSheetsConfigurado: googleConfigurado 
  };
});

export const garimparEmpresas = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => searchParamsSchema.parse(data))
  .handler(async ({ data }) => {
    const { coletarNaApify, getApifyConfig } = await import("./apify.server");
    const { deduplicar } = await import("./normalize");
    const { atendePotencialMinimo } = await import("./score");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: dbSetting } = await supabaseAdmin
      .from("user_settings")
      .select("value")
      .eq("key", "apify_token")
      .single();
    
    const { actorId } = getApifyConfig(dbSetting?.value);

    const brutos = await coletarNaApify(data, dbSetting?.value);
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
