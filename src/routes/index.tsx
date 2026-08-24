import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Layout } from "@/components/garimpo/Layout";
import { GarimpoLogo } from "@/components/garimpo/Logo";
import {
  PixelButton,
  PixelCheckbox,
  PixelInput,
  PixelLabel,
  PixelPanel,
  PixelProgress,
} from "@/components/garimpo/pixel";
import { NicheCombobox, type NicheSelection } from "@/components/garimpo/NicheCombobox";
import { garimparEmpresas, getIntegrationStatus } from "@/lib/garimpo/search.functions";
import { salvarResultado } from "@/lib/garimpo/store";
import type { SearchParams, SearchResult } from "@/lib/garimpo/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Garimpo — Prospecção de empresas sem site" },
      {
        name: "description",
        content:
          "Garimpe empresas por nicho e cidade, filtre as que não têm site, colete contatos públicos e exporte sua lista de prospecção.",
      },
      { property: "og:title", content: "Garimpo — Prospecção de empresas sem site" },
      {
        property: "og:description",
        content:
          "Encontre empresas com boa presença comercial e sem website, com telefone, e-mail e Instagram públicos.",
      },
    ],
  }),
  component: BuscarPage,
});

const QUANTIDADES = [10, 20, 30, 40, 50, 60];

const ETAPAS = [
  "Buscando empresas no Google",
  "Analisando resultados",
  "Verificando websites",
  "Verificando telefones",
  "Removendo duplicados",
  "Calculando potencial",
  "Preparando resultados",
];

const ETAPA_INSTAGRAM = "Buscando Instagram dos leads";

function BuscarPage() {
  const navigate = useNavigate();
  const chamarBusca = useServerFn(garimparEmpresas);
  const statusFn = useServerFn(getIntegrationStatus);
  const { data: status } = useQuery({
    queryKey: ["integration-status"],
    queryFn: () => statusFn({}),
  });

  const [nicho, setNicho] = useState<NicheSelection | null>(null);
  const [localizacao, setLocalizacao] = useState("");
  const [quantidade, setQuantidade] = useState(20);
  const [potencialMinimo, setPotencialMinimo] =
    useState<SearchParams["potencialMinimo"]>("MEDIO_MAIS");
  const [filtros, setFiltros] = useState({
    somenteSemSite: true,
    somenteComTelefone: true,
    buscarEmail: false,
    buscarInstagram: false,
  });
  const [etapa, setEtapa] = useState(0);
  const etapas = filtros.buscarInstagram ? [...ETAPAS, ETAPA_INSTAGRAM] : ETAPAS;

  const mutation = useMutation({
    mutationFn: (params: SearchParams) => chamarBusca({ data: params }),
    onSuccess: (resultado) => {
      salvarResultado(resultado as SearchResult);
      navigate({ to: "/resultados" });
    },
  });

  useEffect(() => {
    if (!mutation.isPending) return;
    setEtapa(0);
    const id = setInterval(() => setEtapa((e) => Math.min(e + 1, etapas.length - 1)), 6000);
    return () => clearInterval(id);
  }, [mutation.isPending, etapas.length]);

  const podeBuscar = (nicho?.label.trim().length ?? 0) >= 2 && localizacao.trim().length >= 2;

  if (mutation.isPending) {
    return (
      <Layout>
        <PixelPanel className="mx-auto max-w-xl scanlines p-6 sm:p-8">
          <h1 className="text-sm text-gold sm:text-base">Garimpando oportunidades...</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {nicho?.label} — {localizacao}
          </p>
          <div className="mt-6 space-y-4">
            {etapas.map((nome, index) => (
              <div key={nome}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className={index <= etapa ? "text-foreground" : "text-muted-foreground/60"}>
                    {nome}
                  </span>
                  <span className="text-muted-foreground">
                    {index < etapa ? "concluído" : index === etapa ? "em andamento" : "aguardando"}
                  </span>
                </div>
                <PixelProgress value={index < etapa ? 100 : index === etapa ? null : 0} />
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            O progresso por etapa é indeterminado: a fonte só informa contagens reais ao final da
            coleta.
          </p>
        </PixelPanel>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <GarimpoLogo className="justify-center" />
        </div>

        {status && !status.googleMapsConfigurado ? (
          <PixelPanel className="mb-6 flex items-start gap-3 border-gold-dark p-4">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold" />
            <p className="text-sm text-muted-foreground">
              Conexão Google Maps indisponível. Verifique em{" "}
              <span className="text-gold">Integrações</span> para executar buscas reais.
            </p>
          </PixelPanel>
        ) : null}

        <PixelPanel className="p-5 sm:p-8">
          <h1 className="text-base text-gold sm:text-lg">Garimpar empresas</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Encontre empresas com potencial comercial e transforme sua busca em uma lista pronta
            para prospecção.
          </p>

          <form
            className="mt-7 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!podeBuscar) return;
              mutation.mutate({
                nicho: nicho!.label.trim(),
                nichoId: nicho!.id,
                localizacao: localizacao.trim(),
                quantidade,
                potencialMinimo,
                filtros,
              });
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <PixelLabel>Nicho</PixelLabel>
                <NicheCombobox value={nicho} onChange={setNicho} />
              </div>
              <div>
                <PixelLabel>Localização</PixelLabel>
                <PixelInput
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  placeholder="Curitiba, PR"
                  maxLength={120}
                />
              </div>
            </div>

            <div>
              <PixelLabel>Quantidade de resultados</PixelLabel>
              <div className="flex flex-wrap gap-2">
                {QUANTIDADES.map((q) => (
                  <PixelButton
                    key={q}
                    type="button"
                    size="sm"
                    variant={quantidade === q ? "primary" : "outline"}
                    onClick={() => setQuantidade(q)}
                  >
                    {q.toLocaleString("pt-BR")}
                  </PixelButton>
                ))}
              </div>
            </div>

            <div>
              <PixelLabel>Potencial mínimo</PixelLabel>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["TODOS", "Todos"],
                    ["MEDIO_MAIS", "Médio+"],
                    ["ALTO", "Alto"],
                  ] as const
                ).map(([valor, rotulo]) => (
                  <PixelButton
                    key={valor}
                    type="button"
                    size="sm"
                    variant={potencialMinimo === valor ? "primary" : "outline"}
                    onClick={() => setPotencialMinimo(valor)}
                  >
                    {rotulo}
                  </PixelButton>
                ))}
              </div>
            </div>

            <div>
              <PixelLabel>Filtros</PixelLabel>
              <div className="grid gap-2 sm:grid-cols-2">
                <PixelCheckbox
                  checked={filtros.somenteSemSite}
                  onChange={(v) => setFiltros((f) => ({ ...f, somenteSemSite: v }))}
                  label="Somente empresas sem site"
                  hint="Instagram e Facebook não contam como site"
                />
                <PixelCheckbox
                  checked={filtros.somenteComTelefone}
                  onChange={(v) => setFiltros((f) => ({ ...f, somenteComTelefone: v }))}
                  label="Somente empresas com telefone"
                />
                <PixelCheckbox
                  disabled
                  checked={false}
                  onChange={() => {}}
                  label="Buscar e-mail"
                  hint="Enriquecimento em breve"
                />
                <PixelCheckbox
                  checked={filtros.buscarInstagram}
                  onChange={(v) => setFiltros((f) => ({ ...f, buscarInstagram: v }))}
                  label="Buscar Instagram"
                  hint="Localizar perfil oficial pela web"
                />
              </div>
            </div>

            {mutation.isError ? (
              <p className="border-2 border-destructive/60 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
                {String(mutation.error).includes("GOOGLE_RATE_LIMIT")
                  ? "Limite temporário de buscas atingido. Tente novamente mais tarde."
                  : String(mutation.error).includes("GOOGLE_REQUEST_DENIED")
                    ? "A busca foi negada pelo Google. Verifique a conexão em Integrações."
                    : String(mutation.error).includes("INTEGRACAO_NAO_CONFIGURADA")
                      ? "Conexão Google Maps não configurada no servidor."
                      : "Não foi possível concluir a busca. Tente novamente em instantes."}
              </p>
            ) : null}

            <PixelButton type="submit" size="lg" className="w-full" disabled={!podeBuscar}>
              Garimpar empresas
            </PixelButton>
          </form>
        </PixelPanel>
      </div>
    </Layout>
  );
}
