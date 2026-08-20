import { ExternalLink, Instagram, MapPin, MessageCircle } from "lucide-react";
import type { Lead } from "@/lib/garimpo/types";
import { NaoEncontrado, PixelButton, PotencialBadge, SemSiteTag } from "./pixel";
import { whatsappLink } from "./LeadDetails";

function Acoes({ lead, onDetalhes }: { lead: Lead; onDetalhes: () => void }) {
  const wa = whatsappLink(lead);
  return (
    <div className="flex flex-wrap items-center gap-1">
      <PixelButton variant="outline" size="sm" onClick={onDetalhes}>
        Detalhes
      </PixelButton>
      {lead.googleMapsUrl ? (
        <a
          href={lead.googleMapsUrl}
          target="_blank"
          rel="noreferrer"
          title="Google Maps"
          className="pixel-focus inline-grid size-8 place-items-center border-2 border-border text-muted-foreground hover:border-gold hover:text-gold"
        >
          <MapPin className="size-4" />
        </a>
      ) : null}
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          title="Abrir WhatsApp"
          className="pixel-focus inline-grid size-8 place-items-center border-2 border-border text-muted-foreground hover:border-gold hover:text-gold"
        >
          <MessageCircle className="size-4" />
        </a>
      ) : null}
      {lead.instagramUrl ? (
        <a
          href={lead.instagramUrl}
          target="_blank"
          rel="noreferrer"
          title="Instagram"
          className="pixel-focus inline-grid size-8 place-items-center border-2 border-border text-muted-foreground hover:border-gold hover:text-gold"
        >
          <Instagram className="size-4" />
        </a>
      ) : null}
    </div>
  );
}

export function ResultsTable({
  leads,
  nicho,
  onSelect,
}: {
  leads: Lead[];
  nicho: string;
  onSelect: (lead: Lead) => void;
}) {
  return (
    <>
      {/* Desktop */}
      <div className="pixel-panel hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1000px] text-sm">
          <thead>
            <tr className="border-b-2 border-border bg-secondary/60 text-left">
              {[
                "Empresa",
                "Nicho",
                "Cidade",
                "Telefone",
                "E-mail",
                "Instagram",
                "Aval.",
                "Nota",
                "Potencial",
                "Ações",
              ].map((c) => (
                <th
                  key={c}
                  className="px-3 py-3 text-[10px] uppercase tracking-wider text-gold"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-border/60 hover:bg-secondary/40">
                <td className="px-3 py-3">
                  <button
                    onClick={() => onSelect(lead)}
                    className="pixel-focus text-left font-medium hover:text-gold"
                  >
                    {lead.nomeEmpresa}
                  </button>
                  <div className="mt-1">{lead.website ? null : <SemSiteTag />}</div>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{lead.categoria ?? nicho}</td>
                <td className="px-3 py-3 text-muted-foreground">
                  {lead.cidade ?? <NaoEncontrado />}
                </td>
                <td className="px-3 py-3 font-mono text-xs">
                  {lead.telefone ?? <NaoEncontrado />}
                </td>
                <td className="px-3 py-3 text-xs break-all">
                  {lead.email ?? <NaoEncontrado />}
                </td>
                <td className="px-3 py-3 text-xs">{lead.instagram ?? <NaoEncontrado />}</td>
                <td className="px-3 py-3 tabular-nums">{lead.quantidadeAvaliacoes ?? "—"}</td>
                <td className="px-3 py-3 tabular-nums">{lead.nota ?? "—"}</td>
                <td className="px-3 py-3">
                  <PotencialBadge potencial={lead.potencial} />
                </td>
                <td className="px-3 py-3">
                  <Acoes lead={lead} onDetalhes={() => onSelect(lead)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet */}
      <div className="grid gap-3 lg:hidden">
        {leads.map((lead) => (
          <div key={lead.id} className="pixel-panel p-4">
            <div className="flex items-start justify-between gap-3">
              <button
                onClick={() => onSelect(lead)}
                className="pixel-focus text-left font-medium hover:text-gold"
              >
                {lead.nomeEmpresa}
              </button>
              <PotencialBadge potencial={lead.potencial} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {[lead.categoria ?? nicho, lead.cidade].filter(Boolean).join(" · ")}
            </p>
            <dl className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-xs text-muted-foreground">Telefone</dt>
                <dd className="font-mono text-xs">{lead.telefone ?? "Não encontrado"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-xs text-muted-foreground">E-mail</dt>
                <dd className="text-xs break-all">{lead.email ?? "Não encontrado"}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-xs text-muted-foreground">Avaliações</dt>
                <dd className="text-xs tabular-nums">
                  {lead.quantidadeAvaliacoes ?? "—"} · nota {lead.nota ?? "—"}
                </dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center justify-between gap-2">
              {lead.website ? (
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline"
                >
                  Site <ExternalLink className="size-3" />
                </a>
              ) : (
                <SemSiteTag />
              )}
              <Acoes lead={lead} onDetalhes={() => onSelect(lead)} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
