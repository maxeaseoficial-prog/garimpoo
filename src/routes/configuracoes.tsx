import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/garimpo/Layout";
import { PixelButton, PixelInput, PixelLabel, PixelPanel } from "@/components/garimpo/pixel";
import { getIntegrationStatus, saveApifyToken } from "@/lib/garimpo/search.functions";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Integrações — Garimpo" },
      {
        name: "description",
        content:
          "Status das integrações do Garimpo: coleta via Apify e exportação para Google Planilhas.",
      },
      { property: "og:title", content: "Integrações — Garimpo" },
      {
        property: "og:description",
        content: "Configure a coleta via Apify e a exportação para Google Planilhas.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

function StatusTag({ ok }: { ok: boolean }) {
  return (
    <span
      className={`text-pixel border-2 px-2 py-1 text-[8px] tracking-wider ${
        ok
          ? "border-gold-dark bg-primary text-primary-foreground"
          : "border-border bg-secondary text-muted-foreground"
      }`}
    >
      {ok ? "CONECTADO" : "NÃO CONFIGURADO"}
    </span>
  );
}

function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  const statusFn = useServerFn(getIntegrationStatus);
  const saveTokenFn = useServerFn(saveApifyToken);
  
  const { data, isLoading } = useQuery({ 
    queryKey: ["integration-status"], 
    queryFn: () => statusFn({}) 
  });

  const [token, setToken] = useState("");

  const saveMutation = useMutation({
    mutationFn: (newToken: string) => saveTokenFn({ data: { token: newToken } }),
    onSuccess: () => {
      toast.success("Token Apify salvo com sucesso!");
      setToken("");
      queryClient.invalidateQueries({ queryKey: ["integration-status"] });
    },
    onError: () => {
      toast.error("Erro ao salvar o token. Tente novamente.");
    },
  });

  return (
    <Layout>
      <h1 className="text-sm text-gold sm:text-base">Integrações</h1>

      <div className="mt-5 grid gap-4">
        <PixelPanel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs text-gold">Apify — coleta de empresas</h2>
            <StatusTag ok={Boolean(data?.apifyConfigurado)} />
          </div>
          
          <p className="mt-3 text-sm text-muted-foreground">
            A coleta roda no servidor do Garimpo. O token da Apify é armazenado de forma segura no seu banco de dados Lovable Cloud.
          </p>

          <div className="mt-6 border-t border-border/40 pt-4">
            <PixelLabel>Configurar Token da Apify</PixelLabel>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PixelInput
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Insira seu API Token..."
                className="flex-1"
              />
              <PixelButton
                disabled={token.length < 10 || saveMutation.isPending}
                onClick={() => saveMutation.mutate(token)}
              >
                {saveMutation.isPending ? "Salvando..." : "Salvar Token"}
              </PixelButton>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Obtenha seu token em: Apify Console → Settings → API & Integrations
            </p>
          </div>

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
              <dt className="text-xs text-muted-foreground">Actor</dt>
              <dd className="font-mono text-xs break-all">{data?.actorId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-xs text-muted-foreground">Status do Actor</dt>
              <dd className="font-mono text-xs">
                {isLoading ? "Verificando..." : data?.apifyConfigurado ? "PRONTO PARA USO" : "TOKEN PENDENTE"}
              </dd>
            </div>
          </dl>
        </PixelPanel>

        <PixelPanel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs text-gold">Google Planilhas — exportação</h2>
            <StatusTag ok={Boolean(data?.googleSheetsConfigurado)} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Ainda não autorizado. Após a autorização do Google, será possível criar uma nova
            planilha ou adicionar os leads a uma planilha existente. Enquanto isso, use a
            exportação CSV — as colunas são exatamente as mesmas.
          </p>
        </PixelPanel>
      </div>
    </Layout>
  );
}
