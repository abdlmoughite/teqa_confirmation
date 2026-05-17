import { MapPin, Star, UsersRound } from "lucide-react";

import Badge from "../ui/Badge";
import Button from "../ui/Button";

const formatMoney = (amount, currency = "MAD") =>
  `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 2 }).format(Number(amount || 0))} ${currency}`;

const OfferCard = ({ offer, providerName, providerSubtitle, onAccept, onNegotiate, accepting = false }) => {
  const isAgent = offer.provider_type === "AGENCY_AGENT";

  return (
    <article className="teqa-offer-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-[14px] font-medium text-[var(--teqa-text)]">{offer.titre}</h2>
            <Badge variant={isAgent ? "blue" : "green"}>{isAgent ? "Agent" : "Agence"}</Badge>
          </div>
          <p className="mt-1 truncate text-xs text-[var(--teqa-muted)]">{providerName || providerSubtitle || "Provider TEQA"}</p>
        </div>
        <strong className="shrink-0 text-[16px] font-medium text-[var(--teqa-green)]">{formatMoney(offer.prix, offer.currency)}</strong>
      </div>

      <p className="mt-4 line-clamp-2 min-h-[42px] text-sm leading-5 text-[var(--teqa-muted)]">
        {offer.description || "Offre disponible pour collaboration de confirmation de commandes."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="neutral">
          <Star size={12} />
          {offer.rating || "4.8"}
        </Badge>
        <Badge variant="neutral">
          <UsersRound size={12} />
          {offer.collaborations_count || 0} collabs
        </Badge>
        <Badge variant="neutral">
          <MapPin size={12} />
          {offer.city || offer.location || "Maroc"}
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--teqa-border)] pt-4">
        <Button variant="outline" onClick={onNegotiate} className="w-full">
          Negocier
        </Button>
        <Button onClick={onAccept} disabled={accepting} className="w-full">
          {accepting ? "..." : "Accepter"}
        </Button>
      </div>
    </article>
  );
};

export default OfferCard;
