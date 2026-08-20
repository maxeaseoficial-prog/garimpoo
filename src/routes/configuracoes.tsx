import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Layout } from "@/components/garimpo/Layout";
import { PixelPanel } from "@/components/garimpo/pixel";
import { getIntegrationStatus } from "@/lib/garimpo/search.functions";

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
  const statusFn = useServerFn(getIntegrationStatus);
  const { data } = useQuery({ queryKey: ["integration-status"], queryFn: () => statusFn({}) });

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
            A coleta roda no servidor do Garimpo. O token da Apify nunca é enviado ao navegador.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
              <dt className="text-xs text-muted-foreground">Actor</dt>
              <dd className="font-mono text-xs break-all">{data?.actorId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-xs text-muted-foreground">Segredos necessários</dt>
              <dd className="font-mono text-xs">APIFY_API_TOKEN, APIFY_ACTOR_ID</dd>
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
