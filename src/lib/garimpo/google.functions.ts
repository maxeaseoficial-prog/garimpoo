import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CONNECTOR_ID = "google_sheets";
const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

/** Estado real da autorização Google Planilhas do usuário logado. */
export const getGoogleSheetsStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getConnectionRowForUser } = await import("./googleConnection.server");
    const row = await getConnectionRowForUser(context.userId, CONNECTOR_ID);
    return {
      conectado: Boolean(row),
      email: row?.account_email ?? null,
      clientePronto: Boolean(process.env["GOOGLE_SHEETS_APP_USER_CONNECTOR_CLIENT_API_KEY"]),
    };
  });

export const startGoogleSheetsConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientAPIKey = process.env["GOOGLE_SHEETS_APP_USER_CONNECTOR_CLIENT_API_KEY"];
    if (!clientAPIKey) throw new Error("CONECTOR_GOOGLE_NAO_CONFIGURADO");

    const { authorizeAppUserOAuth } = await import("@/integrations/lovable/appUserConnector");
    const { getConnectionKeyForUser } = await import("./googleConnection.server");

    const request = getRequest();
    if (!request) throw new Error("OAuth precisa iniciar a partir de uma requisição do app.");
    const url = new URL(request.url);
    const sandboxHost =
      url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const returnUrl = new URL(
      "/oauth/google-sheets/return",
      sandboxHost ? `https://${sandboxHost}` : url.origin,
    ).toString();

    const existingKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID).catch(
      () => null,
    );

    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CONNECTOR_ID,
      appUserId: context.userId,
      clientAPIKey,
      returnUrl,
      ...(existingKey ? { connectionAPIKey: existingKey } : {}),
      credentialsConfiguration: { scopes: GOOGLE_SCOPES },
    });

    return { authorizationUrl };
  });

export const completeGoogleSheetsConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { code: string }) => input)
  .handler(async ({ data, context }) => {
    const { exchangeAppUserOAuthCode, callAsAppUser } = await import(
      "@/integrations/lovable/appUserConnector"
    );
    const { saveConnectionKeyForUser } = await import("./googleConnection.server");

    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(
      GATEWAY_BASE_URL,
      data.code,
    );
    if (connectorId !== CONNECTOR_ID) throw new Error("Conector inesperado no retorno do OAuth");

    let email: string | null = null;
    try {
      const res = await callAsAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey,
        connectorId: CONNECTOR_ID,
        path: "/oauth2/v2/userinfo",
      });
      if (res.ok) {
        const info = (await res.json()) as { email?: string };
        email = info.email ?? null;
      }
    } catch {
      email = null;
    }

    await saveConnectionKeyForUser(context.userId, CONNECTOR_ID, connectionAPIKey, email);
    return { ok: true };
  });

export const disconnectGoogleSheets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { disconnectAppUser } = await import("@/integrations/lovable/appUserConnector");
    const { getConnectionKeyForUser, deleteConnectionForUser } = await import(
      "./googleConnection.server"
    );

    const key = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (key) {
      try {
        await disconnectAppUser({
          gatewayBaseUrl: GATEWAY_BASE_URL,
          connectionAPIKey: key,
          connectorId: CONNECTOR_ID,
        });
      } catch (error) {
        console.error("Falha ao desconectar no gateway:", error);
      }
    }
    await deleteConnectionForUser(context.userId, CONNECTOR_ID);
    return { ok: true };
  });
