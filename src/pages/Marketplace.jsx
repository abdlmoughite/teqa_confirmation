import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Handshake,
  Info,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { GetPublicMarketplaceOffers } from "../api/auth";
import { useToast } from "../context/ToastContext";
import { SkeletonLoader } from "../ui/Loading";
import { getToastError } from "../utils/apiErrors";
import { makePublicEntity, usePublicEntities } from "../hooks/usePublicEntities";

const providerIcon = {
  AGENCY_OWNER: Building2,
  AGENCY_AGENT: UserRound,
};

const formatMoney = (amount, currency = "MAD") => {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

const initials = (name = "Provider") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const pickProviderLookup = (offer) =>
  offer?.provider_lookup || makePublicEntity(offer?.provider_type, offer?.provider_id);

const Marketplace = () => {
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);

  const providerLookups = useMemo(
    () => offers.map(pickProviderLookup).filter(Boolean),
    [offers]
  );
  const { getEntity, getEntityName, getEntitySubtitle, getEntityAvatar } = usePublicEntities(providerLookups);

  useEffect(() => {
    let cancelled = false;

    const loadOffers = async () => {
      setLoading(true);
      try {
        const response = await GetPublicMarketplaceOffers();
        if (!cancelled) {
          setOffers(response.data?.offers || []);
        }
      } catch (error) {
        const friendly = getToastError(error, "Unable to load marketplace offers.");
        toast.error(friendly.message, friendly.title);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadOffers();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return offers;
    return offers.filter((offer) => {
      const lookup = pickProviderLookup(offer);
      const providerName = lookup ? getEntityName(lookup.type, lookup.id, "") : "";
      return [offer.titre, offer.description, providerName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [getEntityName, offers, search]);

  const totals = useMemo(
    () =>
      offers.reduce(
        (acc, offer) => ({
          offers: acc.offers + 1,
          applications: acc.applications + Number(offer.collaborations_count || 0),
          active: acc.active + Number(offer.active_collaborations_count || 0),
        }),
        { offers: 0, applications: 0, active: 0 }
      ),
    [offers]
  );

  return (
    <div className="page-shell px-1 py-2">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Marketplace</p>
          <h1 className="mt-3 text-3xl font-bold text-primary">Available offers</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Browse service offers, compare active collaboration signals, and inspect provider details before you start.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
          <Metric icon={BriefcaseBusiness} label="Offers" value={totals.offers} />
          <Metric icon={UsersRound} label="Applications" value={totals.applications} />
          <Metric icon={Handshake} label="Active" value={totals.active} />
        </div>
      </div>

      <div className="toolbar-card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by offer, description, or provider"
            className="field-input py-2 pl-10 pr-4"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonLoader variant="card" count={6} />
        </div>
      ) : filteredOffers.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              getEntityName={getEntityName}
              getEntitySubtitle={getEntitySubtitle}
              getEntityAvatar={getEntityAvatar}
              onMoreInfo={() => setSelectedOffer(offer)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <BriefcaseBusiness className="mx-auto text-slate-400" size={44} />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No offers found</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Try a different search term or come back when new providers publish offers.
          </p>
        </div>
      )}

      {selectedOffer ? (
        <ProviderDetailsModal
          offer={selectedOffer}
          provider={(() => {
            const lookup = pickProviderLookup(selectedOffer);
            return lookup ? getEntity(lookup.type, lookup.id) : null;
          })()}
          onClose={() => setSelectedOffer(null)}
        />
      ) : null}
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }) => (
  <div className="metric-card">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        <Icon size={19} />
      </div>
    </div>
  </div>
);

const OfferCard = ({ offer, getEntityName, getEntitySubtitle, getEntityAvatar, onMoreInfo }) => {
  const lookup = pickProviderLookup(offer);
  const providerName = lookup ? getEntityName(lookup.type, lookup.id, "Loading provider...") : "Provider";
  const providerSubtitle = lookup ? getEntitySubtitle(lookup.type, lookup.id, "Loading profile...") : "Service provider";
  const avatar = lookup ? getEntityAvatar(lookup.type, lookup.id) : null;
  const ProviderIcon = providerIcon[offer.provider_type] || Building2;

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {avatar ? (
            <img src={avatar} alt="" className="h-11 w-11 rounded-lg object-cover" />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {initials(providerName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{providerName}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500 dark:text-slate-400">
              <ProviderIcon size={13} />
              {providerSubtitle}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 size={13} />
          Active
        </span>
      </div>

      <h2 className="mt-5 line-clamp-2 min-h-[3.25rem] text-xl font-semibold text-slate-950 dark:text-white">
        {offer.titre}
      </h2>
      <p className="mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600 dark:text-slate-400">
        {offer.description || "No description was added for this offer yet."}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
        <Signal label="Posts" value={offer.collaborations_count || 0} />
        <Signal label="Active" value={offer.active_collaborations_count || 0} />
        <Signal label="Pending" value={offer.pending_applications_count || 0} />
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-950 dark:text-white">
          <CircleDollarSign size={18} className="text-slate-400" />
          <span className="text-lg font-semibold">{formatMoney(offer.prix, offer.currency)}</span>
        </div>
        <button type="button" onClick={onMoreInfo} className="btn-secondary px-3 py-2 text-sm">
          <Eye size={16} />
          More info
        </button>
      </div>
    </article>
  );
};

const Signal = ({ label, value }) => (
  <div className="rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800">
    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 font-semibold text-slate-950 dark:text-white">{value}</p>
  </div>
);

const ProviderDetailsModal = ({ offer, provider, onClose }) => {
  const user = provider?.user || {};
  const profile = provider?.profile || user.store || user.agency || user.agent || {};
  const details = [
    ["Provider", provider?.display_name],
    ["Type", provider?.entity_type?.replaceAll("_", " ")],
    ["Email", user.email],
    ["Username", user.username],
    ["Country", user.country],
    ["City", user.city],
    ["Public profile", user.public_profile ? "Yes" : "No"],
    ["Status", user.status],
    ["Store", profile.store_name],
    ["Agency", profile.agency_name],
    ["Agent", profile.full_name],
    ["Industry", profile.industry || profile.activity_sector],
    ["Availability", profile.availability_status],
    ["Website", profile.website || profile.portfolio_url],
  ].filter(([, value]) => value !== undefined && value !== null && value !== "");

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <p className="eyebrow">Provider details</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{offer.titre}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          {!provider ? (
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-800">
              <SkeletonLoader variant="text" count={5} />
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
                {provider.avatar ? (
                  <img src={provider.avatar} alt="" className="h-14 w-14 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {initials(provider.display_name)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{provider.display_name}</h3>
                  <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                    <BadgeCheck size={15} />
                    {provider.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {details.map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                    <p className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-lg border border-slate-200 p-4 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-400">
                <div className="mb-2 flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                  <Info size={16} />
                  Offer activity
                </div>
                This offer has {offer.collaborations_count || 0} total postulations, {offer.active_collaborations_count || 0} active collaborations,
                and {offer.pending_applications_count || 0} pending requests.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
