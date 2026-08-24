import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Layout } from "@/components/garimpo/Layout";
import { PixelButton, PixelPanel } from "@/components/garimpo/pixel";
import { getIntegrationStatus } from "@/lib/garimpo/search.functions";
import {
  disconnectGoogleSheets,
  getGoogleSheetsStatus,
  startGoogleSheetsConnect,
  completeGoogleSheetsConnection,
} from "@/lib/garimpo/google.functions";
import { supabase } from "@/integrations/supabase/client";

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

function waitForOAuthCompletion(popup: Window) {
  return new Promise<string | null>((resolve, reject) => {
    let poll: number | undefined;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = (event.data as { type?: string } | null)?.type;
      const data = event.data as { connectorId?: string; code?: unknown } | null;
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        data?.connectorId !== "google_sheets" ||
        (type !== "appUserConnectorOAuthComplete" && type !== "appUserConnectorOAuthFailed")
      )
        return;
      cleanup();
      if (type === "appUserConnectorOAuthComplete") {
        resolve(typeof data?.code === "string" ? data.code : null);
        return;
      }
      popup.close();
      reject(new Error("A autorização do Google falhou."));
    };
    window.addEventListener("message", onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error("Janela fechada antes da conclusão."));
    }, 500);
  });
}

function ConfiguracoesPage() {
  const queryClient = useQueryClient();
  const statusFn = useServerFn(getIntegrationStatus);
  const saveTokenFn = useServerFn(saveApifyToken);
  const googleStatusFn = useServerFn(getGoogleSheetsStatus);
  const startConnectFn = useServerFn(startGoogleSheetsConnect);
  const completeConnectFn = useServerFn(completeGoogleSheetsConnection);
  const disconnectFn = useServerFn(disconnectGoogleSheets);

  const [token, setToken] = useState("");
  const [substituindo, setSubstituindo] = useState(false);
  const [sessaoCarregando, setSessaoCarregando] = useState(true);
  const [logado, setLogado] = useState(false);

  useEffect(() => {
    let ativo = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!ativo) return;
      setLogado(Boolean(data.user));
      setSessaoCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const apify = useQuery({
    queryKey: ["integration-status"],
    queryFn: () => statusFn({}),
    retry: false,
  });

  const google = useQuery({
    queryKey: ["google-sheets-status"],
    queryFn: () => googleStatusFn({}),
    enabled: logado,
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (novoToken: string) => saveTokenFn({ data: { token: novoToken } }),
    onSuccess: async () => {
      setToken("");
      setSubstituindo(false);
      await queryClient.invalidateQueries({ queryKey: ["integration-status"] });
      toast.success("Token Apify salvo com sucesso!");
    },
    onError: () => toast.error("Erro ao salvar o token. Tente novamente."),
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      const popup = window.open("", "garimpo-google-oauth", "width=600,height=720");
      if (!popup) throw new Error("Popup bloqueado. Libere popups e tente novamente.");
      let code: string | null;
      try {
        const { authorizationUrl } = await startConnectFn({});
        const completion = waitForOAuthCompletion(popup);
        popup.location.href = authorizationUrl;
        code = await completion;
      } catch (error) {
        popup.close();
        throw error;
      }
      if (code) await completeConnectFn({ data: { code } });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["google-sheets-status"] });
      toast.success("Google Planilhas conectado!");
    },
    onError: (error: Error) => toast.error(error.message || "Não foi possível conectar."),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectFn({}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["google-sheets-status"] });
      toast.success("Google Planilhas desconectado.");
    },
    onError: () => toast.error("Não foi possível desconectar."),
  });

  const apifyState: TagState = apify.isLoading
    ? "carregando"
    : apify.isError
      ? "erro"
      : apify.data?.apifyConfigurado
        ? "conectado"
        : "nao-configurado";

  const googleState: TagState =
    sessaoCarregando || (logado && google.isLoading)
      ? "carregando"
      : logado && google.isError
        ? "erro"
        : google.data?.conectado
          ? "conectado"
          : "nao-configurado";

  const mostrarFormApify = apifyState !== "conectado" || substituindo;

  return (
    <Layout>
      <h1 className="text-sm text-gold sm:text-base">Integrações</h1>

      <div className="mt-5 grid gap-4">
        <PixelPanel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs text-gold">Apify — coleta de empresas</h2>
            <StatusTag state={apifyState} />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            A coleta roda no servidor do Garimpo. O token da Apify fica armazenado apenas no
            servidor e nunca é enviado de volta para o navegador.
          </p>

          {apifyState === "erro" && (
            <div className="mt-4 border-t border-border/40 pt-4">
              <PixelButton onClick={() => apify.refetch()}>Tentar novamente</PixelButton>
            </div>
          )}

          {apifyState === "conectado" && !substituindo && (
            <div className="mt-6 border-t border-border/40 pt-4">
              <PixelLabel>Token configurado</PixelLabel>
              <p className="font-mono text-sm tracking-widest">••••••••••••••••</p>
              <div className="mt-4">
                <PixelButton onClick={() => setSubstituindo(true)}>Substituir token</PixelButton>
              </div>
            </div>
          )}

          {apifyState !== "erro" && apifyState !== "carregando" && mostrarFormApify && (
            <div className="mt-6 border-t border-border/40 pt-4">
              <PixelLabel>
                {substituindo ? "Novo token da Apify" : "Configurar Token da Apify"}
              </PixelLabel>
              <div className="flex flex-col gap-3 sm:flex-row">
                <PixelInput
                  type="password"
                  autoComplete="off"
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
                {substituindo && (
                  <PixelButton
                    onClick={() => {
                      setToken("");
                      setSubstituindo(false);
                    }}
                  >
                    Cancelar
                  </PixelButton>
                )}
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">
                Obtenha seu token em: Apify Console → Settings → API & Integrations
              </p>
            </div>
          )}

          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-border/60 pb-2">
              <dt className="text-xs text-muted-foreground">Actor</dt>
              <dd className="font-mono text-xs break-all">{apify.data?.actorId ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-xs text-muted-foreground">Status do Actor</dt>
              <dd className="font-mono text-xs">
                {apifyState === "carregando"
                  ? "VERIFICANDO..."
                  : apifyState === "erro"
                    ? "—"
                    : apifyState === "conectado"
                      ? "PRONTO PARA USO"
                      : "TOKEN PENDENTE"}
              </dd>
            </div>
          </dl>
        </PixelPanel>

        <PixelPanel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xs text-gold">Google Planilhas — exportação</h2>
            <StatusTag state={googleState} />
          </div>

          {googleState === "carregando" && (
            <p className="mt-3 text-sm text-muted-foreground">Verificando autorização...</p>
          )}

          {googleState === "erro" && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">
                Não foi possível verificar a autorização do Google.
              </p>
              <div className="mt-4">
                <PixelButton onClick={() => google.refetch()}>Tentar novamente</PixelButton>
              </div>
            </div>
          )}

          {googleState === "conectado" && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">
                Conta Google conectada
                {google.data?.email ? ` — ${google.data.email}` : ""}.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Google Planilhas pronto para exportação.
              </p>
              <div className="mt-4">
                <PixelButton
                  disabled={disconnectMutation.isPending}
                  onClick={() => disconnectMutation.mutate()}
                >
                  {disconnectMutation.isPending ? "Desconectando..." : "Desconectar"}
                </PixelButton>
              </div>
            </div>
          )}

          {googleState === "nao-configurado" && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">
                Conecte sua conta Google para exportar os leads diretamente para o Google
                Planilhas.
              </p>
              <div className="mt-4">
                {logado ? (
                  <PixelButton
                    disabled={connectMutation.isPending}
                    onClick={() => connectMutation.mutate()}
                  >
                    {connectMutation.isPending ? "Conectando..." : "Conectar com Google"}
                  </PixelButton>
                ) : (
                  <PixelButton
                    onClick={async () => {
                      const { lovable } = await import("@/integrations/lovable/index");
                      await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin + "/configuracoes",
                      });
                    }}
                  >
                    Entrar para conectar
                  </PixelButton>
                )}
              </div>
            </div>
          )}
        </PixelPanel>
      </div>
    </Layout>
  );
}
