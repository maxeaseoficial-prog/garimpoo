import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Lead } from "@/lib/garimpo/types";
import { POTENCIAL_LABEL } from "@/lib/garimpo/score";
import { NaoEncontrado, PotencialBadge, SemSiteTag } from "./pixel";

function Linha({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 py-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {rotulo}
      </span>
      <span className="text-right text-sm break-words">{children}</span>
    </div>
  );
}

export function whatsappLink(lead: Lead): string | null {
  const numero = lead.whatsapp ?? lead.telefoneNormalizado;
  if (!numero) return null;
  return `https://wa.me/${numero.replace(/\D/g, "")}`;
}

export function LeadDetails({
  lead,
  onOpenChange,
}: {
  lead: Lead | null;
  onOpenChange: (open: boolean) => void;
}) {
  const wa = lead ? whatsappLink(lead) : null;
  return (
    <Dialog open={Boolean(lead)} onOpenChange={onOpenChange}>
      <DialogContent className="pixel-panel max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {lead ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-pixel text-sm leading-relaxed text-gold">
                {lead.nomeEmpresa}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              <Linha rotulo="Categoria">{lead.categoria ?? <NaoEncontrado />}</Linha>
              <Linha rotulo="Endereço">{lead.endereco ?? <NaoEncontrado />}</Linha>
              <Linha rotulo="Cidade / Estado">
                {[lead.cidade, lead.estado].filter(Boolean).join(" / ") || <NaoEncontrado />}
              </Linha>
              <Linha rotulo="Telefone">
                {lead.telefone ?? <NaoEncontrado />}
                {lead.telefoneNormalizado ? (
                  <span className="block text-xs text-muted-foreground">
                    {lead.telefoneNormalizado}
                  </span>
                ) : null}
              </Linha>
              <Linha rotulo="WhatsApp">
                {wa ? (
                  <a className="text-gold underline" href={wa} target="_blank" rel="noreferrer">
                    Abrir WhatsApp
                  </a>
                ) : (
                  <NaoEncontrado />
                )}
              </Linha>
              <Linha rotulo="E-mail">{lead.email ?? <NaoEncontrado />}</Linha>
              <Linha rotulo="Instagram">
                {lead.instagramUrl ? (
                  <a
                    className="text-gold underline"
                    href={lead.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lead.instagram}
                  </a>
                ) : (
                  <NaoEncontrado />
                )}
              </Linha>
              <Linha rotulo="Google Maps">
                {lead.googleMapsUrl ? (
                  <a
                    className="text-gold underline"
                    href={lead.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir no Maps
                  </a>
                ) : (
                  <NaoEncontrado />
                )}
              </Linha>
              <Linha rotulo="Nota">{lead.nota ?? <NaoEncontrado />}</Linha>
              <Linha rotulo="Avaliações">
                {lead.quantidadeAvaliacoes ?? <NaoEncontrado />}
              </Linha>
              <Linha rotulo="Website">
                {lead.website ? (
                  <a
                    className="text-gold underline"
                    href={lead.website}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {lead.website}
                  </a>
                ) : (
                  <SemSiteTag />
                )}
              </Linha>
              <Linha rotulo="Potencial">
                <span className="flex items-center justify-end gap-2">
                  <PotencialBadge potencial={lead.potencial} />
                  <span className="text-xs text-muted-foreground">
                    {POTENCIAL_LABEL[lead.potencial]}
                  </span>
                </span>
              </Linha>
              <Linha rotulo="Responsável">{lead.responsavel ?? <NaoEncontrado />}</Linha>
              <Linha rotulo="Fonte">
                <span className="text-xs text-muted-foreground">{lead.fonte}</span>
              </Linha>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
