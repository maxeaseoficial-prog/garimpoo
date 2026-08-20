import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Layout } from "@/components/garimpo/Layout";
import { PixelButton, PixelPanel } from "@/components/garimpo/pixel";
import { lerHistorico, limparHistorico } from "@/lib/garimpo/store";
import type { HistoryEntry } from "@/lib/garimpo/types";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de buscas — Garimpo" },
      {
        name: "description",
        content: "Veja suas buscas anteriores no Garimpo e reabra as listas de leads coletadas.",
      },
      { property: "og:title", content: "Histórico de buscas — Garimpo" },
      {
        property: "og:description",
        content: "Buscas anteriores por nicho e cidade, com contagem de leads garimpados.",
      },
    ],
  }),
  component: HistoricoPage,
});

function HistoricoPage() {
  const [itens, setItens] = useState<HistoryEntry[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setItens(lerHistorico());
    setCarregado(true);
  }, []);

  return (
    <Layout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-sm text-gold sm:text-base">Histórico</h1>
        {itens.length > 0 ? (
          <PixelButton
            variant="outline"
            size="sm"
            onClick={() => {
              limparHistorico();
              setItens([]);
            }}
          >
            Limpar histórico
          </PixelButton>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3">
        {carregado && itens.length === 0 ? (
          <PixelPanel className="p-10 text-center">
            <h2 className="text-xs text-gold">Nenhuma busca registrada</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Suas buscas aparecem aqui assim que você garimpar empresas.
            </p>
            <Link to="/" className="mt-6 inline-block">
              <PixelButton>Garimpar empresas</PixelButton>
            </Link>
          </PixelPanel>
        ) : null}

        {itens.map((item) => (
          <PixelPanel key={item.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.nicho}</p>
              <p className="text-sm text-muted-foreground">{item.localizacao}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.quantidade.toLocaleString("pt-BR")} pesquisadas · {item.leads} leads ·{" "}
                {new Date(item.criadoEm).toLocaleString("pt-BR")}
              </p>
            </div>
            <Link to="/resultados" search={{ id: item.id }}>
              <PixelButton variant="outline" size="sm">
                Abrir resultados
              </PixelButton>
            </Link>
          </PixelPanel>
        ))}
      </div>
    </Layout>
  );
}
