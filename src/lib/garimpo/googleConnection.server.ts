// Server-only: armazenamento criptografado da conexão do usuário com o Google Sheets.
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export const GOOGLE_SHEETS_CONNECTOR_ID = "google_sheets";
export const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";

function encryptionKey(): Buffer {
  const raw = process.env["APP_USER_CONNECTION_KEY_SECRET"];
  if (!raw) throw new Error("APP_USER_CONNECTION_KEY_SECRET is not set");
  return Buffer.from(raw, "base64");
}

export function encryptConnectionKey(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), ct]).toString("base64");
}

export function decryptConnectionKey(stored: string): string {
  const buf = Buffer.from(stored, "base64");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), buf.subarray(0, 12));
  decipher.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString("utf8");
}

export async function saveConnectionKeyForUser(
  userId: string,
  connectorId: string,
  connectionAPIKey: string,
  accountEmail: string | null,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.from("app_user_connections").upsert(
    {
      user_id: userId,
      connector_id: connectorId,
      connection_key_ciphertext: encryptConnectionKey(connectionAPIKey),
      account_email: accountEmail,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,connector_id" },
  );
  if (error) throw error;
}

export async function getConnectionRowForUser(userId: string, connectorId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("app_user_connections")
    .select("connection_key_ciphertext, account_email")
    .eq("user_id", userId)
    .eq("connector_id", connectorId)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function getConnectionKeyForUser(userId: string, connectorId: string) {
  const row = await getConnectionRowForUser(userId, connectorId);
  return row ? decryptConnectionKey(row.connection_key_ciphertext) : null;
}

export async function deleteConnectionForUser(userId: string, connectorId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("app_user_connections")
    .delete()
    .eq("user_id", userId)
    .eq("connector_id", connectorId);
  if (error) throw error;
}
