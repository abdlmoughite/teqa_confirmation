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
  MapPin,
  Mail,
  Globe,
  Clock,
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
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Handshake size={20} className="text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Marketplace</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Available offers</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Browse service offers and start collaborating with trusted providers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <BriefcaseBusiness size={18} className="text-emerald-600 mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totals.offers}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Offers</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <UsersRound size={18} className="text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totals.applications}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Applications</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <Handshake size={18} className="text-purple-600 mb-2" />
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totals.active}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by offer, description, or provider..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Offers Grid */}
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
                <SkeletonLoader variant="text" count={4} />
              </div>
            ))}
          </div>
        ) : filteredOffers.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <BriefcaseBusiness size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No offers found</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Try a different search term</p>
          </div>
        )}
      </div>

      {selectedOffer && (
        <ProviderDetailsModal
          offer={selectedOffer}
          provider={(() => {
            const lookup = pickProviderLookup(selectedOffer);
            return lookup ? getEntity(lookup.type, lookup.id) : null;
          })()}
          onClose={() => setSelectedOffer(null)}
        />
      )}
    </div>
  );
};

const OfferCard = ({ offer, getEntityName, getEntitySubtitle, getEntityAvatar, onMoreInfo }) => {
  const lookup = pickProviderLookup(offer);
  const providerName = lookup ? getEntityName(lookup.type, lookup.id, "Provider") : "Provider";
  const providerSubtitle = lookup ? getEntitySubtitle(lookup.type, lookup.id, "Service provider") : "Service provider";
  const avatar = lookup ? getEntityAvatar(lookup.type, lookup.id) : null;
  const ProviderIcon = providerIcon[offer.provider_type] || Building2;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {avatar ? (
          <img src={avatar} alt="" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
            {initials(providerName)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-900 dark:text-white truncate">{providerName}</p>
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
            <ProviderIcon size={12} />
            {providerSubtitle}
          </p>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
        {offer.titre}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
        {offer.description || "No description available"}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Apps</p>
          <p className="font-semibold text-slate-900 dark:text-white">{offer.collaborations_count || 0}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Active</p>
          <p className="font-semibold text-slate-900 dark:text-white">{offer.active_collaborations_count || 0}</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
          <p className="font-semibold text-slate-900 dark:text-white">{offer.pending_applications_count || 0}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Price</p>
          <p className="font-bold text-slate-900 dark:text-white">{formatMoney(offer.prix, offer.currency)}</p>
        </div>
        <button
          onClick={onMoreInfo}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Eye size={16} />
          Details
        </button>
      </div>
    </div>
  );
};

const ProviderDetailsModal = ({ offer, provider, onClose }) => {
  const user = provider?.user || {};
  const profile = provider?.profile || user.store || user.agency || user.agent || {};

  const details = [
    { icon: Building2, label: "Provider", value: provider?.display_name },
    { icon: Mail, label: "Email", value: user.email },
    { icon: UserRound, label: "Username", value: user.username },
    { icon: MapPin, label: "Country", value: user.country },
    { icon: Globe, label: "Public profile", value: user.public_profile ? "Yes" : "No" },
    { icon: CheckCircle2, label: "Status", value: user.status },
    { icon: Building2, label: "Store", value: profile.store_name },
    { icon: Building2, label: "Agency", value: profile.agency_name },
    { icon: BriefcaseBusiness, label: "Industry", value: profile.industry || profile.activity_sector },
    { icon: Clock, label: "Availability", value: profile.availability_status },
  ].filter((item) => item.value !== undefined && item.value !== null && item.value !== "");

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{offer.titre}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Provider details</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-5">
          {!provider ? (
            <SkeletonLoader variant="text" count={4} />
          ) : (
            <>
              {/* Provider Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                {provider.avatar ? (
                  <img src={provider.avatar} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                    {initials(provider.display_name)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{provider.display_name}</h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <BadgeCheck size={14} />
                    {provider.subtitle}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={14} className="text-emerald-600" />
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
                  </div>
                ))}
              </div>

              {/* Activity Summary */}
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Activity summary</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xl font-bold text-emerald-600">{offer.collaborations_count || 0}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Applications</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-blue-600">{offer.active_collaborations_count || 0}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Active</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-600">{offer.pending_applications_count || 0}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Pending</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;