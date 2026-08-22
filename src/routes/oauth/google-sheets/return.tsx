import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/oauth/google-sheets/return")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Conectando Google Planilhas — Garimpo" },
      { name: "description", content: "Finalizando a autorização do Google Planilhas no Garimpo." },
      { property: "og:title", content: "Conectando Google Planilhas — Garimpo" },
      {
        property: "og:description",
        content: "Finalizando a autorização do Google Planilhas no Garimpo.",
      },
    ],
  }),
  component: OAuthReturn,
});

function OAuthReturn() {
  const [message, setMessage] = useState("Finalizando conexão…");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const notify = (
      type: "appUserConnectorOAuthComplete" | "appUserConnectorOAuthFailed",
      code?: string,
    ) => {
      window.opener?.postMessage(
        { type, connectorId: "google_sheets", code: code ?? null },
        window.location.origin,
      );
      window.close();
    };

    if (params.get("success") !== "true") {
      setMessage(params.get("error") ?? "A autorização não foi concluída.");
      notify("appUserConnectorOAuthFailed");
      return;
    }

    const code = params.get("code");
    if (!code) {
      if (params.get("offline_access_allowed") === "false") {
        notify("appUserConnectorOAuthComplete");
        return;
      }
      setMessage("A autorização terminou sem código de troca.");
      notify("appUserConnectorOAuthFailed");
      return;
    }
    notify("appUserConnectorOAuthComplete", code);
  }, []);

  return <p className="p-6 text-sm">{message}</p>;
}
