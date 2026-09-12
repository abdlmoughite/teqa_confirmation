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
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Shield,
  Filter,
  Languages,
  Target,
  Calendar,
  Layers,
  Home,
  Banknote,
  Star,
  TrendingUp,
  Award,
  Zap,
  Users,
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

const ENTITY_TYPE_OPTS = [
  { value: "", label: "All Providers" },
  { value: "individual", label: "Individuals" },
  { value: "company", label: "Companies" },
];

const LANG_OPTS = [
  { value: "french", label: "Français" }, { value: "english", label: "English" },
  { value: "arabic", label: "العربية" }, { value: "spanish", label: "Español" },
  { value: "german", label: "Deutsch" }, { value: "italian", label: "Italiano" },
  { value: "portuguese", label: "Português" }, { value: "dutch", label: "Nederlands" },
  { value: "chinese", label: "中文" }, { value: "other", label: "Autre" },
];

const NICHE_OPTS = [
  "e-commerce", "insurance", "real_estate", "telecoms", "banking",
  "health", "education", "travel", "automotive", "other",
];

const Marketplace = () => {
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Server-side filters
  const [entityType, setEntityType] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Client-side filters (use provider profile data)
  const [filterLanguages, setFilterLanguages] = useState([]);
  const [filterNiches, setFilterNiches] = useState([]);
  const [minDeliveryRate, setMinDeliveryRate] = useState(0);
  const [filterCountry, setFilterCountry] = useState("");
  const [minAgeFilter, setMinAgeFilter] = useState("");
  const [maxAgeFilter, setMaxAgeFilter] = useState("");
  const [minExperience, setMinExperience] = useState("");

  const toggleLang = (l) => setFilterLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  const toggleNiche = (n) => setFilterNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);

  const activeFilterCount = [
    entityType !== "", verifiedOnly, minPrice !== "", maxPrice !== "",
    filterLanguages.length > 0, filterNiches.length > 0,
    minDeliveryRate > 0, filterCountry !== "",
    minAgeFilter !== "", maxAgeFilter !== "", minExperience !== "",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setEntityType(""); setVerifiedOnly(false);
    setMinPrice(""); setMaxPrice("");
    setFilterLanguages([]); setFilterNiches([]);
    setMinDeliveryRate(0); setFilterCountry("");
    setMinAgeFilter(""); setMaxAgeFilter(""); setMinExperience("");
  };

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
        const params = {};
        if (entityType) params.entity_type = entityType;
        if (verifiedOnly) params.verified_only = "true";
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        const response = await GetPublicMarketplaceOffers(params);
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
    return () => { cancelled = true; };
  }, [toast, entityType, verifiedOnly, minPrice, maxPrice]);

  const filteredOffers = useMemo(() => {
    const query = search.trim().toLowerCase();
    let results = offers;

    if (query) {
      results = results.filter((offer) => {
        const lookup = pickProviderLookup(offer);
        const providerName = lookup ? getEntityName(lookup.type, lookup.id, "") : "";
        return [offer.titre, offer.description, providerName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
    }

    if (filterLanguages.length > 0) {
      results = results.filter((offer) => {
        const lookup = pickProviderLookup(offer);
        if (!lookup) return true;
        const entity = getEntity(lookup.type, lookup.id);
        if (!entity) return true; // not yet loaded, pass through
        const providerLangs = entity.profile?.languages_spoken || [];
        return filterLanguages.some(l => providerLangs.includes(l));
      });
    }

    if (filterNiches.length > 0) {
      results = results.filter((offer) => {
        const lookup = pickProviderLookup(offer);
        if (!lookup) return true;
        const entity = getEntity(lookup.type, lookup.id);
        if (!entity) return true;
        const providerNiches = entity.profile?.niches || [];
        return filterNiches.some(n => providerNiches.includes(n));
      });
    }

    if (minDeliveryRate > 0) {
      results = results.filter((offer) => {
        const lookup = pickProviderLookup(offer);
        if (!lookup) return true;
        const entity = getEntity(lookup.type, lookup.id);
        if (!entity) return true;
        return (entity.profile?.delivery_rate || 0) >= minDeliveryRate;
      });
    }

    if (filterCountry) {
      const q = filterCountry.toLowerCase();
      results = results.filter((offer) => {
        const lookup = pickProviderLookup(offer);
        if (!lookup) return true;
        const entity = getEntity(lookup.type, lookup.id);
        if (!entity) return true;
        const c = (entity.profile?.country || entity.user?.country || "").toLowerCase();
        return c.includes(q);
      });
    }

    if (minAgeFilter || maxAgeFilter) {
      results = results.filter((offer) => {
        const lookup = pickProviderLookup(offer);
        if (!lookup) return true;
        const entity = getEntity(lookup.type, lookup.id);
        if (!entity) return true;
        const age = entity.profile?.age;
        if (!age) return true;
        if (minAgeFilter && age < Number(minAgeFilter)) return false;
        if (maxAgeFilter && age > Number(maxAgeFilter)) return false;
        return true;
      });
    }

    if (minExperience) {
      results = results.filter((offer) => {
        if (offer.provider_type !== "AGENCY_AGENT") return true;
        const lookup = pickProviderLookup(offer);
        if (!lookup) return true;
        const entity = getEntity(lookup.type, lookup.id);
        if (!entity) return true;
        return (entity.profile?.years_experience || 0) >= Number(minExperience);
      });
    }

    return results;
  }, [getEntity, getEntityName, offers, search, filterLanguages, filterNiches,
      minDeliveryRate, filterCountry, minAgeFilter, maxAgeFilter, minExperience]);

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

        {/* Search + Filter Row */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by offer, description, or provider..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3 pl-10 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <SlidersHorizontal size={16} />
            <span className="text-sm font-medium hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* ── FILTER PANEL ── */}
        {showFilters && (
          <div style={{ marginBottom: 24, borderRadius: "var(--radius-xl)", border: "0.5px solid var(--teqa-border)", background: "var(--teqa-surface)", overflow: "hidden" }}>
            {/* Panel header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "0.5px solid var(--teqa-border)", background: "var(--teqa-surface2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Filter size={13} style={{ color: "var(--teqa-green)" }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--teqa-text)" }}>Filtres avancés</span>
                {activeFilterCount > 0 && (
                  <span style={{ background: "var(--teqa-green)", color: "#fff", borderRadius: "var(--radius-full)", padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{activeFilterCount}</span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} style={{ fontSize: 12, color: "var(--teqa-red)", background: "var(--teqa-red-dim)", border: "0.5px solid rgba(220,38,38,0.2)", borderRadius: "var(--radius-md)", padding: "4px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                  <X size={11} /> Tout effacer
                </button>
              )}
            </div>

            <div style={{ padding: 20 }}>
              {/* ── Provider Type Tabs (always visible) ── */}
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8 }}>Type de prestataire</p>
                <div style={{ display: "flex", gap: 0, background: "var(--teqa-surface2)", borderRadius: "var(--radius-lg)", padding: 3 }}>
                  {[
                    { value: "", label: "Tous", icon: null },
                    { value: "individual", label: "Agents", icon: UserRound },
                    { value: "company", label: "Agences", icon: Building2 },
                  ].map(({ value, label, icon: Icon }) => (
                    <button key={value} onClick={() => setEntityType(value)}
                      style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.15s",
                        background: entityType === value ? "var(--teqa-surface)" : "transparent",
                        color: entityType === value ? "var(--teqa-text)" : "var(--teqa-muted)",
                        boxShadow: entityType === value ? "var(--shadow-card)" : "none",
                      }}>
                      {Icon && <Icon size={13} />}{label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>

                {/* ── Languages ── */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <Languages size={11} /> Langues parlées
                  </p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {LANG_OPTS.map((opt) => (
                      <button key={opt.value} onClick={() => toggleLang(opt.value)}
                        style={{ borderRadius: "var(--radius-full)", padding: "4px 10px", fontSize: 11, fontWeight: filterLanguages.includes(opt.value) ? 600 : 500, cursor: "pointer", border: "0.5px solid",
                          background: filterLanguages.includes(opt.value) ? "var(--teqa-green-dim)" : "var(--teqa-surface2)",
                          color: filterLanguages.includes(opt.value) ? "var(--teqa-green)" : "var(--teqa-muted)",
                          borderColor: filterLanguages.includes(opt.value) ? "rgba(37,99,235,0.4)" : "var(--teqa-border-md)",
                        }}>{opt.label}</button>
                    ))}
                  </div>
                </div>

                {/* ── Niches ── */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <Target size={11} /> Secteurs d'activité
                  </p>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {NICHE_OPTS.map((n) => (
                      <button key={n} onClick={() => toggleNiche(n)}
                        style={{ borderRadius: "var(--radius-full)", padding: "4px 10px", fontSize: 11, fontWeight: filterNiches.includes(n) ? 600 : 500, cursor: "pointer", border: "0.5px solid",
                          background: filterNiches.includes(n) ? "var(--teqa-blue-dim)" : "var(--teqa-surface2)",
                          color: filterNiches.includes(n) ? "var(--teqa-blue)" : "var(--teqa-muted)",
                          borderColor: filterNiches.includes(n) ? "rgba(8,145,178,0.3)" : "var(--teqa-border-md)",
                        }}>{n.replace(/_/g, " ")}</button>
                    ))}
                  </div>
                </div>

                {/* ── Delivery Rate (slider) ── */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <TrendingUp size={11} /> Taux de livraison min.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input type="range" min={0} max={100} step={5} value={minDeliveryRate} onChange={e => setMinDeliveryRate(Number(e.target.value))}
                      style={{ flex: 1, accentColor: "var(--teqa-green)", height: 4 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teqa-green)", minWidth: 36, textAlign: "right" }}>{minDeliveryRate}%</span>
                  </div>
                </div>

                {/* ── Price Range ── */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <Banknote size={11} /> Prix (MAD)
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min"
                      style={{ width: 80, padding: "6px 10px", fontSize: 12, borderRadius: "var(--radius-md)", border: "0.5px solid var(--teqa-border-md)", background: "var(--teqa-bg)", color: "var(--teqa-text)", outline: "none" }} />
                    <span style={{ color: "var(--teqa-hint)", fontSize: 12 }}>—</span>
                    <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max"
                      style={{ width: 80, padding: "6px 10px", fontSize: 12, borderRadius: "var(--radius-md)", border: "0.5px solid var(--teqa-border-md)", background: "var(--teqa-bg)", color: "var(--teqa-text)", outline: "none" }} />
                  </div>
                </div>

                {/* ── Country ── */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={11} /> Pays
                  </p>
                  <input type="text" value={filterCountry} onChange={e => setFilterCountry(e.target.value)} placeholder="ex: Maroc, France..."
                    style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: "var(--radius-md)", border: "0.5px solid var(--teqa-border-md)", background: "var(--teqa-bg)", color: "var(--teqa-text)", outline: "none" }} />
                </div>

                {/* ── Agent-specific: Age range ── */}
                {(!entityType || entityType === "individual") && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8 }}>
                      Âge (agents)
                    </p>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input type="number" value={minAgeFilter} onChange={e => setMinAgeFilter(e.target.value)} placeholder="Min" min={18} max={65}
                        style={{ width: 72, padding: "6px 10px", fontSize: 12, borderRadius: "var(--radius-md)", border: "0.5px solid var(--teqa-border-md)", background: "var(--teqa-bg)", color: "var(--teqa-text)", outline: "none" }} />
                      <span style={{ color: "var(--teqa-hint)" }}>–</span>
                      <input type="number" value={maxAgeFilter} onChange={e => setMaxAgeFilter(e.target.value)} placeholder="Max" min={18} max={65}
                        style={{ width: 72, padding: "6px 10px", fontSize: 12, borderRadius: "var(--radius-md)", border: "0.5px solid var(--teqa-border-md)", background: "var(--teqa-bg)", color: "var(--teqa-text)", outline: "none" }} />
                    </div>
                  </div>
                )}

                {/* ── Agent-specific: Experience ── */}
                {(!entityType || entityType === "individual") && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-muted)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                      <Award size={11} /> Expérience min. (ans)
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="range" min={0} max={20} step={1} value={minExperience || 0} onChange={e => setMinExperience(e.target.value === "0" ? "" : e.target.value)}
                        style={{ flex: 1, accentColor: "var(--teqa-blue)", height: 4 }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--teqa-blue)", minWidth: 36, textAlign: "right" }}>{minExperience || 0} ans</span>
                    </div>
                  </div>
                )}

                {/* ── Verified Only ── */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: "var(--radius-lg)", border: "0.5px solid", width: "100%",
                    borderColor: verifiedOnly ? "rgba(37,99,235,0.4)" : "var(--teqa-border-md)",
                    background: verifiedOnly ? "var(--teqa-green-dim)" : "var(--teqa-surface2)",
                  }}>
                    <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} style={{ accentColor: "var(--teqa-green)", width: 14, height: 14 }} />
                    <BadgeCheck size={13} style={{ color: verifiedOnly ? "var(--teqa-green)" : "var(--teqa-muted)" }} />
                    <span style={{ fontSize: 12, color: verifiedOnly ? "var(--teqa-green)" : "var(--teqa-muted)", fontWeight: 500 }}>Vérifiés seulement</span>
                  </label>
                </div>

              </div>
            </div>
          </div>
        )}

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
                getEntity={getEntity}
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

const LANG_SHORT    = { french:"FR", english:"EN", arabic:"AR", spanish:"ES", german:"DE", italian:"IT", portuguese:"PT", dutch:"NL", chinese:"ZH", other:"+" };
const LANG_LABELS_M = { french:"Français", english:"English", arabic:"العربية", spanish:"Español", german:"Deutsch", italian:"Italiano", portuguese:"Português", dutch:"Nederlands", chinese:"中文", other:"Autre" };
const DAY_ORDER_M   = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAY_SHORT_M   = { monday:"Lun", tuesday:"Mar", wednesday:"Mer", thursday:"Jeu", friday:"Ven", saturday:"Sam", sunday:"Dim" };

const rateColor = (r) => r >= 80 ? "var(--teqa-success)" : r >= 60 ? "var(--teqa-warning)" : "var(--teqa-red)";
const rateBg    = (r) => r >= 80 ? "var(--teqa-success-dim)" : r >= 60 ? "rgba(217,119,6,0.1)" : "var(--teqa-red-dim)";

const DeliveryBadge = ({ rate }) => {
  if (!rate && rate !== 0) return null;
  const r = Number(rate);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, borderRadius: "var(--radius-full)", padding: "3px 9px", background: rateBg(r), color: rateColor(r) }}>
      <TrendingUp size={10} />
      {r}%
    </span>
  );
};

const OfferCard = ({ offer, getEntityName, getEntitySubtitle, getEntityAvatar, getEntity, onMoreInfo }) => {
  const isAgent = offer.provider_type === "AGENCY_AGENT";
  const lookup = pickProviderLookup(offer);
  const providerName = lookup ? getEntityName(lookup.type, lookup.id, "Provider") : "Provider";
  const avatar = lookup ? getEntityAvatar(lookup.type, lookup.id) : null;
  const entity = lookup ? getEntity(lookup.type, lookup.id) : null;
  const profile = entity?.profile || {};
  const languages = Array.isArray(profile.languages_spoken) ? profile.languages_spoken.slice(0, 4) : [];
  const niches    = Array.isArray(profile.niches) ? profile.niches.slice(0, 3) : [];
  const deliveryRate = profile.delivery_rate ?? null;
  const age = profile.age ?? null;
  const agentCount = profile.agent_count ?? null;
  const isVerified = offer.is_verified;
  const isOnline = profile.is_online;

  const accentColor = isAgent ? "var(--teqa-blue)" : "var(--teqa-green)";
  const accentDim   = isAgent ? "var(--teqa-blue-dim)" : "var(--teqa-green-dim)";

  return (
    <div style={{ background: "var(--teqa-surface)", border: "0.5px solid var(--teqa-border)", borderRadius: "var(--radius-xl)", display: "flex", flexDirection: "column", overflow: "hidden", transition: "border-color 0.15s, box-shadow 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = isAgent ? "rgba(8,145,178,0.4)" : "rgba(37,99,235,0.4)"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--teqa-border)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Accent strip + Provider header */}
      <div style={{ padding: "14px 16px 12px", background: accentDim, borderBottom: "0.5px solid var(--teqa-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          {/* Badge */}
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accentColor, background: "var(--teqa-surface)", border: `0.5px solid ${accentColor}`, borderRadius: "var(--radius-full)", padding: "3px 9px", display: "flex", alignItems: "center", gap: 4 }}>
            {isAgent ? <><UserRound size={10} /> Agent</> : <><Building2 size={10} /> Agence</>}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {deliveryRate !== null && <DeliveryBadge rate={deliveryRate} />}
            {isVerified && <BadgeCheck size={14} style={{ color: "var(--teqa-blue)" }} title="Vérifié" />}
          </div>
        </div>

        {/* Provider identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {avatar ? (
              <img src={avatar} alt="" style={{ width: 44, height: 44, borderRadius: isAgent ? "50%" : "var(--radius-lg)", objectFit: "cover", border: `2px solid ${accentColor}` }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: isAgent ? "50%" : "var(--radius-lg)", background: accentColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15 }}>
                {initials(providerName)}
              </div>
            )}
            {isOnline && <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "var(--teqa-green)", border: "2px solid var(--teqa-surface)" }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--teqa-text)", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{providerName}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {age !== null && (
                <span style={{ fontSize: 11, color: "var(--teqa-muted)" }}>{age} ans</span>
              )}
              {isAgent && profile.years_experience > 0 && (
                <span style={{ fontSize: 11, color: "var(--teqa-muted)" }}>{profile.years_experience} ans exp.</span>
              )}
              {!isAgent && agentCount !== null && (
                <span style={{ fontSize: 11, color: "var(--teqa-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                  <Users size={10} />{agentCount} agents
                </span>
              )}
              {(profile.city || profile.country) && (
                <span style={{ fontSize: 11, color: "var(--teqa-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                  <MapPin size={10} />{[profile.city, profile.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {/* Offer info */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--teqa-text)", margin: "0 0 4px", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {offer.titre}
          </h3>
          <p style={{ fontSize: 11, color: "var(--teqa-muted)", margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {offer.description || "Aucune description"}
          </p>
        </div>

        {/* Skills chips */}
        {(languages.length > 0 || niches.length > 0) && (
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {languages.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <Languages size={10} style={{ color: "var(--teqa-hint)", flexShrink: 0 }} />
                {languages.map(l => (
                  <span key={l} style={{ fontSize: 10, fontWeight: 600, color: "var(--teqa-green)", background: "var(--teqa-green-dim)", borderRadius: "var(--radius-full)", padding: "1px 6px" }}>
                    {LANG_SHORT[l] || l.slice(0,2).toUpperCase()}
                  </span>
                ))}
              </div>
            )}
            {niches.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                <Target size={10} style={{ color: "var(--teqa-hint)", flexShrink: 0 }} />
                {niches.map(n => (
                  <span key={n} style={{ fontSize: 10, fontWeight: 500, color: "var(--teqa-blue)", background: "var(--teqa-blue-dim)", borderRadius: "var(--radius-full)", padding: "1px 6px" }}>
                    {n.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginTop: "auto" }}>
          {[
            { label: "Candidatures", value: offer.collaborations_count || 0 },
            { label: "Actives", value: offer.active_collaborations_count || 0 },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center", padding: "7px 4px", borderRadius: "var(--radius-md)", background: "var(--teqa-surface2)" }}>
              <p style={{ fontSize: 10, color: "var(--teqa-muted)", margin: "0 0 2px" }}>{label}</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--teqa-text)", margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "0.5px solid var(--teqa-border)", background: "var(--teqa-surface2)" }}>
        <div>
          <p style={{ fontSize: 10, color: "var(--teqa-hint)", margin: "0 0 1px" }}>Prix</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: accentColor, margin: 0 }}>{formatMoney(offer.prix, offer.currency)}</p>
        </div>
        <button onClick={onMoreInfo}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: "var(--radius-lg)", background: accentColor, color: "#fff", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          <Eye size={13} /> Voir détails
        </button>
      </div>
    </div>
  );
};

const MChip = ({ label, color = "neutral" }) => (
  <span style={{ display: "inline-block", fontSize: 11, fontWeight: 500, borderRadius: "var(--radius-full)", padding: "3px 10px",
    color: color === "green" ? "var(--teqa-green)" : color === "blue" ? "var(--teqa-blue)" : "var(--teqa-muted)",
    background: color === "green" ? "var(--teqa-green-dim)" : color === "blue" ? "var(--teqa-blue-dim)" : "var(--teqa-surface2)",
    border: `0.5px solid ${color === "green" ? "rgba(37,99,235,0.4)" : color === "blue" ? "rgba(8,145,178,0.3)" : "var(--teqa-border)"}`,
  }}>{label}</span>
);

const MInfoRow = ({ icon: Icon, label, value, accent = false }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: "var(--radius-md)", background: "var(--teqa-surface2)", border: "0.5px solid var(--teqa-border)" }}>
    <div style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", background: accent ? "var(--teqa-green-dim)" : "var(--teqa-surface2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "0.5px solid var(--teqa-border)" }}>
      <Icon size={13} style={{ color: accent ? "var(--teqa-green)" : "var(--teqa-muted)" }} />
    </div>
    <div style={{ minWidth: 0 }}>
      <p style={{ fontSize: 10, color: "var(--teqa-hint)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--teqa-text)", margin: 0 }}>{value}</p>
    </div>
  </div>
);

const ProviderDetailsModal = ({ offer, provider, onClose }) => {
  const isAgent = offer.provider_type === "AGENCY_AGENT";
  const user = provider?.user || {};
  const profile = provider?.profile || {};

  const languages  = Array.isArray(profile.languages_spoken) ? profile.languages_spoken : [];
  const niches     = Array.isArray(profile.niches)           ? profile.niches           : [];
  const crmList    = Array.isArray(profile.crm_expertise)    ? profile.crm_expertise    : [];
  const workDays   = Array.isArray(profile.working_days)     ? profile.working_days     : [];

  const deliveryRate = profile.delivery_rate ?? null;
  const age          = profile.age ?? null;
  const accentColor  = isAgent ? "var(--teqa-blue)" : "var(--teqa-green)";
  const accentDim    = isAgent ? "var(--teqa-blue-dim)" : "var(--teqa-green-dim)";

  const keyMetrics = [
    deliveryRate !== null && { label: "Taux de livraison", value: `${deliveryRate}%`, color: rateColor(deliveryRate), bg: rateBg(deliveryRate), icon: TrendingUp },
    age !== null          && { label: "Âge", value: `${age} ans`, color: "var(--teqa-text)", bg: "var(--teqa-surface2)", icon: UserRound },
    profile.years_experience && isAgent && { label: "Expérience", value: `${profile.years_experience} ans`, color: "var(--teqa-blue)", bg: "var(--teqa-blue-dim)", icon: Award },
    profile.agent_count !== undefined && !isAgent && { label: "Agents", value: String(profile.agent_count || 0), color: "var(--teqa-green)", bg: "var(--teqa-green-dim)", icon: Users },
  ].filter(Boolean);

  const infoRows = [
    (profile.country || user.country) && { icon: MapPin,           label: "Pays",       value: profile.country || user.country },
    (profile.city || user.city)       && { icon: MapPin,           label: "Ville",      value: profile.city || user.city },
    profile.workspace_type            && { icon: Home,              label: "Workspace",  value: profile.workspace_type.replace(/_/g, " ") },
    (profile.working_hours_start && profile.working_hours_end)
                                      && { icon: Clock,             label: "Horaires",   value: `${profile.working_hours_start} – ${profile.working_hours_end}` },
    profile.daily_capacity            && { icon: Layers,            label: "Capacité",   value: `${profile.daily_capacity}/jour` },
    profile.education_level && isAgent && { icon: BriefcaseBusiness, label: "Études",   value: profile.education_level.replace(/_/g, " ") },
    profile.job_type && isAgent       && { icon: BriefcaseBusiness, label: "Poste",     value: profile.job_type.replace(/_/g, " ") },
    profile.industry                  && { icon: Building2,         label: "Secteur",   value: profile.industry },
    profile.max_agents && !isAgent    && { icon: Users,             label: "Capacité max", value: `${profile.max_agents} agents` },
  ].filter(Boolean);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", padding: 16 }} onClick={onClose}>
      <div style={{ background: "var(--teqa-surface)", borderRadius: "var(--radius-xl)", width: "100%", maxWidth: 660, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.35)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "16px 20px", borderBottom: "0.5px solid var(--teqa-border)", flexShrink: 0, background: accentDim }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: accentColor, background: "var(--teqa-surface)", border: `0.5px solid ${accentColor}`, borderRadius: "var(--radius-full)", padding: "2px 8px" }}>
                {isAgent ? "Agent" : "Agence"}
              </span>
              {offer.is_verified && <BadgeCheck size={14} style={{ color: "var(--teqa-blue)" }} />}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--teqa-text)", margin: "0 0 4px", lineHeight: 1.3 }}>{offer.titre}</h2>
            <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <Banknote size={12} style={{ color: accentColor }} />
              <span style={{ fontWeight: 700, color: accentColor }}>{formatMoney(offer.prix, offer.currency)}</span>
              <span style={{ color: "var(--teqa-hint)" }}>·</span>
              {offer.collaborations_count || 0} candidatures
            </p>
          </div>
          <button onClick={onClose} style={{ background: "var(--teqa-surface)", border: "0.5px solid var(--teqa-border)", borderRadius: "var(--radius-md)", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <X size={14} style={{ color: "var(--teqa-muted)" }} />
          </button>
        </div>

        {/* Scroll content */}
        <div style={{ overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 18 }}>
          {!provider ? (
            <SkeletonLoader variant="text" count={4} />
          ) : (
            <>
              {/* Provider hero banner */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: "var(--radius-lg)", background: "var(--teqa-surface2)", border: "0.5px solid var(--teqa-border)" }}>
                {provider.avatar ? (
                  <img src={provider.avatar} alt="" style={{ width: 52, height: 52, borderRadius: isAgent ? "50%" : "var(--radius-lg)", objectFit: "cover", flexShrink: 0, border: `2px solid ${accentColor}` }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: isAgent ? "50%" : "var(--radius-lg)", background: accentColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                    {initials(provider.display_name)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--teqa-text)", margin: "0 0 3px" }}>{provider.display_name}</h3>
                  <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: "0 0 8px" }}>{provider.subtitle}</p>
                  {/* Key metrics row */}
                  {keyMetrics.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {keyMetrics.map(m => (
                        <span key={m.label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, borderRadius: "var(--radius-full)", padding: "3px 9px", background: m.bg, color: m.color }}>
                          <m.icon size={10} />{m.value} <span style={{ fontWeight: 400, opacity: 0.7 }}>{m.label}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Offer description */}
              {offer.description && (
                <div>
                  <p style={{ fontSize: 11, color: "var(--teqa-hint)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>Description de l'offre</p>
                  <p style={{ fontSize: 13, color: "var(--teqa-muted)", lineHeight: 1.6, margin: 0 }}>{offer.description}</p>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div>
                  <p style={{ fontSize: 11, color: "var(--teqa-hint)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>Bio</p>
                  <p style={{ fontSize: 13, color: "var(--teqa-muted)", lineHeight: 1.6, margin: 0 }}>{profile.bio}</p>
                </div>
              )}

              {/* Delivery rate visual */}
              {deliveryRate !== null && (
                <div style={{ padding: "12px 14px", borderRadius: "var(--radius-lg)", background: rateBg(deliveryRate), border: `0.5px solid ${rateColor(deliveryRate)}22` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <TrendingUp size={14} style={{ color: rateColor(deliveryRate) }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--teqa-text)" }}>Taux de livraison</span>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: rateColor(deliveryRate) }}>{deliveryRate}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: "var(--radius-full)", background: "var(--teqa-surface2)", overflow: "hidden" }}>
                    <div style={{ width: `${deliveryRate}%`, height: "100%", background: rateColor(deliveryRate), borderRadius: "var(--radius-full)", transition: "width 0.4s ease" }} />
                  </div>
                  <p style={{ fontSize: 10, color: "var(--teqa-hint)", margin: "6px 0 0" }}>
                    {deliveryRate >= 80 ? "Excellent" : deliveryRate >= 60 ? "Bon" : "À améliorer"} · Valeur statique (mise à jour prévue)
                  </p>
                </div>
              )}

              {/* Skills */}
              {(languages.length || niches.length || crmList.length || workDays.length) ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 11, color: "var(--teqa-hint)", margin: 0, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>Compétences</p>
                  {languages.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                        <Languages size={12} style={{ color: "var(--teqa-green)" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-text)" }}>Langues parlées</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {languages.map(l => <MChip key={l} label={LANG_LABELS_M[l] || l} color="green" />)}
                      </div>
                    </div>
                  )}
                  {niches.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                        <Target size={12} style={{ color: "var(--teqa-blue)" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-text)" }}>Secteurs</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {niches.map(n => <MChip key={n} label={n.replace(/_/g, " ")} color="blue" />)}
                      </div>
                    </div>
                  )}
                  {crmList.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                        <Layers size={12} style={{ color: "var(--teqa-hint)" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-text)" }}>CRM maîtrisés</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {crmList.map(c => <MChip key={c} label={c} />)}
                      </div>
                    </div>
                  )}
                  {workDays.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
                        <Calendar size={12} style={{ color: "var(--teqa-green)" }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--teqa-text)" }}>Jours disponibles</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {DAY_ORDER_M.map(d => {
                          const active = workDays.includes(d);
                          return <span key={d} style={{ fontSize: 11, fontWeight: 600, borderRadius: "var(--radius-md)", padding: "4px 10px", color: active ? "var(--teqa-green)" : "var(--teqa-hint)", background: active ? "var(--teqa-green-dim)" : "var(--teqa-surface2)", border: `0.5px solid ${active ? "rgba(37,99,235,0.4)" : "var(--teqa-border)"}` }}>{DAY_SHORT_M[d]}</span>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Info grid */}
              {infoRows.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, color: "var(--teqa-hint)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>Informations</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {infoRows.map(r => <MInfoRow key={r.label} icon={r.icon} label={r.label} value={r.value} />)}
                  </div>
                </div>
              )}

              {/* Activity */}
              <div style={{ padding: 14, borderRadius: "var(--radius-lg)", background: "var(--teqa-surface2)", border: "0.5px solid var(--teqa-border)" }}>
                <p style={{ fontSize: 11, color: "var(--teqa-hint)", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>Activité</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, textAlign: "center" }}>
                  {[
                    { label: "Candidatures", value: offer.collaborations_count || 0, color: accentColor },
                    { label: "Actives",      value: offer.active_collaborations_count || 0, color: "var(--teqa-blue)" },
                    { label: "En attente",   value: offer.pending_applications_count || 0, color: "var(--teqa-muted)" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p style={{ fontSize: 24, fontWeight: 800, color, margin: "0 0 2px" }}>{value}</p>
                      <p style={{ fontSize: 10, color: "var(--teqa-muted)", margin: 0 }}>{label}</p>
                    </div>
                  ))}
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