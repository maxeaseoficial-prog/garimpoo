import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Layout } from "@/components/garimpo/Layout";
import { PixelButton, PixelPanel } from "@/components/garimpo/pixel";
import { getIntegrationStatus } from "@/lib/garimpo/search.functions";
import { getExcelStatus } from "@/lib/garimpo/excel.functions";

type TagState = "carregando" | "conectado" | "nao-configurado" | "erro";

function StatusTag({ state }: { state: TagState }) {
  const texto =
    state === "carregando"
      ? "VERIFICANDO..."
      : state === "conectado"
        ? "CONECTADO"
        : state === "erro"
          ? "NÃO FOI POSSÍVEL VERIFICAR"
          : "NÃO CONFIGURADO";

  return (
    <span
      className={`text-pixel border-2 px-2 py-1 text-[8px] tracking-wider ${
        state === "conectado"
          ? "border-gold-dark bg-primary text-primary-foreground"
          : "border-border bg-secondary text-muted-foreground"
      }`}
    >
      {texto}
    </span>
  );
}

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Integrações — Garimpo" },
      {
        name: "description",
        content:
          "Status das integrações do Garimpo: coleta via Google Maps Platform e exportação de planilhas.",
      },
      { property: "og:title", content: "Integrações — Garimpo" },
      {
        property: "og:description",
        content: "Confira a coleta via Google Maps Platform e a exportação de planilhas.",
      },
    ],
  }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const statusFn = useServerFn(getIntegrationStatus);
  const excelStatusFn = useServerFn(getExcelStatus);

  const maps = useQuery({
    queryKey: ["integration-status"],
    queryFn: () => statusFn({}),
    retry: false,
  });

  const excel = useQuery({
    queryKey: ["excel-status"],
    queryFn: () => excelStatusFn({}),
    retry: false,
  });

  const mapsState: TagState = maps.isLoading
    ? "carregando"
    : maps.isError
      ? "erro"
      : maps.data?.googleMapsConfigurado
        ? "conectado"
        : "nao-configurado";

  const excelState: TagState = excel.isLoading
    ? "carregando"
    : excel.isError
      ? "erro"
      : excel.data?.conectado
        ? "conectado"
        : "nao-configurado";

  return (
    <Layout>
      <h1 className="text-sm text-gold sm:text-base">Integrações</h1>

      <div className="mt-5 grid gap-4">
        <PixelPanel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs text-gold">Google Maps Platform — coleta de empresas</h2>
            <StatusTag state={mapsState} />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            A coleta usa a conexão gerenciada pela Lovable. As credenciais ficam apenas no
            servidor e nunca são enviadas ao navegador.
          </p>

          {mapsState === "erro" && (
            <div className="mt-4 border-t border-border/40 pt-4">
              <PixelButton onClick={() => maps.refetch()}>Tentar novamente</PixelButton>
            </div>
          )}

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
              <dt className="text-xs text-muted-foreground">Conexão</dt>
              <dd className="font-mono text-xs break-all">{maps.data?.conexao ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
              <dt className="text-xs text-muted-foreground">API</dt>
              <dd className="font-mono text-xs break-all">{maps.data?.api ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-xs text-muted-foreground">Modo</dt>
              <dd className="font-mono text-xs">
                {mapsState === "carregando"
                  ? "VERIFICANDO..."
                  : mapsState === "conectado"
                    ? (maps.data?.modo ?? "—")
                    : "—"}
              </dd>
            </div>
          </dl>
        </PixelPanel>

        <PixelPanel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs text-gold">Planilhas — exportação</h2>
            <StatusTag state={excelState} />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            Exporte os leads encontrados pelo Garimpo diretamente para uma planilha.
          </p>

          {excelState === "erro" || excelState === "nao-configurado" ? (
            <div className="mt-4 border-t border-border/40 pt-4">
              <p className="text-sm text-muted-foreground">
                {excel.data?.erro ?? "Não foi possível verificar a conexão de planilhas."}
              </p>
              <div className="mt-4">
                <PixelButton onClick={() => excel.refetch()}>Tentar novamente</PixelButton>
              </div>
            </div>
          ) : null}

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
              <dt className="text-xs text-muted-foreground">Serviço</dt>
              <dd className="font-mono text-xs break-all">Microsoft Excel</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
              <dt className="text-xs text-muted-foreground">Conexão</dt>
              <dd className="font-mono text-xs break-all">Garimpo Planilhas</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-xs text-muted-foreground">Autenticação</dt>
              <dd className="font-mono text-xs">OAuth2</dd>
            </div>
          </dl>
        </PixelPanel>
      </div>
    </Layout>
  );
}
