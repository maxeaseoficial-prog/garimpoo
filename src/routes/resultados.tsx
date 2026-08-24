import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, ExternalLink, FileSpreadsheet, Search } from "lucide-react";
import { Layout } from "@/components/garimpo/Layout";
import { ResultsTable } from "@/components/garimpo/ResultsTable";
import { LeadDetails } from "@/components/garimpo/LeadDetails";
import { PixelButton, PixelInput, PixelPanel } from "@/components/garimpo/pixel";
import { baixarCSV } from "@/lib/garimpo/csv";
import { idUltimoResultado, lerResultado, salvarPlanilha } from "@/lib/garimpo/store";
import { exportarParaPlanilha } from "@/lib/garimpo/excel.functions";
import type { Lead, PlanilhaRef, SearchResult } from "@/lib/garimpo/types";

export const Route = createFileRoute("/resultados")({
  validateSearch: (search: Record<string, unknown>): { id?: string } =>
    typeof search["id"] === "string" ? { id: search["id"] } : {},
  head: () => ({
    meta: [
      { title: "Resultados — Garimpo" },
      {
        name: "description",
        content:
          "Lista de empresas garimpadas com telefone, e-mail, Instagram e potencial comercial, pronta para exportar.",
      },
      { property: "og:title", content: "Resultados — Garimpo" },
      {
        property: "og:description",
        content: "Sua lista de prospecção organizada e pronta para exportar em CSV.",
      },
    ],
  }),
  component: ResultadosPage,
});

function ResultadosPage() {
  const { id } = useSearch({ from: "/resultados" });
  const [resultado, setResultado] = useState<SearchResult | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [busca, setBusca] = useState("");
  const [potencial, setPotencial] = useState<"TODOS" | "ALTO" | "MEDIO" | "BAIXO">("TODOS");
  const [selecionado, setSelecionado] = useState<Lead | null>(null);
  const [exportado, setExportado] = useState(false);
  const [etapa, setEtapa] = useState<"idle" | "criando" | "exportando">("idle");
  const [planilha, setPlanilha] = useState<PlanilhaRef | null>(null);
  const exportarFn = useServerFn(exportarParaPlanilha);

  useEffect(() => {
    const atual = lerResultado(id ?? idUltimoResultado());
    setResultado(atual);
    setPlanilha(atual?.planilha ?? null);
    setCarregado(true);
  }, [id]);

  const leads = useMemo(() => {
    if (!resultado) return [];
    const termo = busca.trim().toLowerCase();
    return resultado.leads.filter((lead) => {
      if (potencial !== "TODOS" && lead.potencial !== potencial) return false;
      if (!termo) return true;
      return [lead.nomeEmpresa, lead.telefone, lead.email, lead.cidade]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(termo));
    });
  }, [resultado, busca, potencial]);

  if (!carregado) {
    return (
      <Layout>
        <PixelPanel className="p-8 text-center text-sm text-muted-foreground">
          Carregando resultados...
        </PixelPanel>
      </Layout>
    );
  }

  if (!resultado) {
    return (
      <Layout>
        <PixelPanel className="p-10 text-center">
          <h1 className="text-sm text-gold">Nenhuma busca ainda</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Faça uma busca para ver suas oportunidades aqui.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <PixelButton size="lg">Garimpar empresas</PixelButton>
          </Link>
        </PixelPanel>
      </Layout>
    );
  }

  const { stats, params } = resultado;

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-sm text-gold sm:text-base">Resultados</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {params.nicho} — {params.localizacao}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <PixelButton
              variant="outline"
              onClick={() => {
                baixarCSV(resultado.leads, params.nicho, params.localizacao);
                setExportado(true);
              }}
            >
              <Download className="size-4" />
              {exportado ? "CSV exportado" : "Exportar CSV"}
            </PixelButton>
            <PixelButton
              variant="outline"
              disabled={exportacao.isPending}
              onClick={() => exportacao.mutate()}
            >
              <FileSpreadsheet className="size-4" />
              {etapa === "criando"
                ? "Criando planilha..."
                : etapa === "exportando"
                  ? "Exportando leads..."
                  : planilha
                    ? "Exportar novamente"
                    : "Exportar para planilha"}
            </PixelButton>
            {planilha ? (
              <a href={planilha.url} target="_blank" rel="noopener noreferrer">
                <PixelButton>
                  <ExternalLink className="size-4" />
                  Abrir planilha
                </PixelButton>
              </a>
            ) : null}
          </div>
        </div>

        <PixelPanel className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-5">
          {[
            [
              stats.meta ? `${resultado.leads.length} de ${stats.meta}` : resultado.leads.length,
              "empresas encontradas",
            ],
            [stats.semSite, "sem site"],
            [stats.comTelefone, "com telefone"],
            [stats.comEmail, "com e-mail"],
            [stats.comInstagram, "com Instagram"],
          ].map(([valor, rotulo]) => (
            <div key={String(rotulo)}>
              <div className="text-pixel text-sm text-gold">{valor}</div>
              <div className="mt-2 text-xs text-muted-foreground">{rotulo}</div>
            </div>
          ))}
        </PixelPanel>

        {stats.meta && !stats.metaAtingida ? (
          <p className="border-2 border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
            Encontramos {resultado.leads.length} empresas que atendem a todos os filtros nesta
            busca. Tente reduzir o potencial mínimo ou ampliar a localização.
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <PixelInput
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar empresa..."
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["TODOS", "Todos"],
                ["ALTO", "Alto"],
                ["MEDIO", "Médio"],
                ["BAIXO", "Baixo"],
              ] as const
            ).map(([valor, rotulo]) => (
              <PixelButton
                key={valor}
                size="sm"
                variant={potencial === valor ? "primary" : "outline"}
                onClick={() => setPotencial(valor)}
              >
                {rotulo}
              </PixelButton>
            ))}
          </div>
        </div>

        {leads.length === 0 ? (
          <PixelPanel className="p-10 text-center">
            <h2 className="text-xs text-gold">Nenhuma oportunidade encontrada</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Tente outro nicho, localização ou diminua o potencial mínimo.
            </p>
          </PixelPanel>
        ) : (
          <ResultsTable leads={leads} nicho={params.nicho} onSelect={setSelecionado} />
        )}
      </div>

      <LeadDetails lead={selecionado} onOpenChange={(open) => !open && setSelecionado(null)} />
    </Layout>
  );
}
