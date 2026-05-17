// AgencyCommissions.jsx
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle, CheckCircle2, Clock3, Eye, Loader2,
  RefreshCw, Search, Wallet2, XCircle, Filter,
  ArrowUpRight, ArrowDownRight, Building2, User, Zap, Calendar,
} from "lucide-react";
import { GetCommissionStats, GetCommissions, GetPaymentAttempts } from "../../api/auth";
import {
  IconBox, MetricCard, TeqaModal, TeqaToast, TeqaLoader,
  TeqaError, TeqaEmpty, TeqaPagination, InfoRow, AttemptItem,
} from "../../components/ui/teqa-shared";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */

const STATUS_META = {
  pending_payment:    { label: "En attente",    badgeClass: "badge badge-neutral", icon: Clock3,       spinning: false  },
  processing_payment: { label: "En traitement", badgeClass: "badge badge-blue",    icon: RefreshCw,    spinning: true   },
  paid:               { label: "Payé",          badgeClass: "badge badge-green",   icon: CheckCircle2, spinning: false  },
  payment_failed:     { label: "Paiement échoué", badgeClass: "badge badge-red",   icon: XCircle,      spinning: false  },
  cancelled:          { label: "Annulé",        badgeClass: "badge badge-neutral", icon: XCircle,      spinning: false  },
};

const ITEMS_PER_PAGE = 10;

const toArray = (p) => Array.isArray(p) ? p : Array.isArray(p?.results) ? p.results : Array.isArray(p?.data) ? p.data : [];
const fmt    = (v, cur = "MAD") => `${parseFloat(v || 0).toLocaleString("fr-FR")} ${cur}`;
const fmtDate = (v) => {
  if (!v) return "—";
  try { return new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(v)); }
  catch { return v; }
};

/* ─────────────────────────────────────────────────────────────
   STATUS CHIP
───────────────────────────────────────────────────────────── */

const StatusChip = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending_payment;
  return (
    <span className={m.badgeClass} style={{ gap: 5 }}>
      <m.icon size={11} className={m.spinning ? "animate-spin" : ""} />
      {m.label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   PROVIDER CELL
───────────────────────────────────────────────────────────── */

const ProviderCell = ({ type }) => {
  const isOwner = type === "AGENCY_OWNER";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <IconBox icon={isOwner ? Building2 : User} variant={isOwner ? "green" : "blue"} size={12} boxSize={24} />
      <span style={{ fontSize: 12, color: "var(--teqa-muted)" }}>
        {isOwner ? "Agency Owner" : "Agency Agent"}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

const AgencyCommissions = () => {
  const [commissions,      setCommissions]      = useState([]);
  const [statsData,        setStatsData]        = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [error,            setError]            = useState("");
  const [statusFilter,     setStatusFilter]     = useState("all");
  const [searchTerm,       setSearchTerm]       = useState("");
  const [page,             setPage]             = useState(1);
  const [openModal,        setOpenModal]        = useState(false);
  const [activeCommission, setActiveCommission] = useState(null);
  const [attempts,         setAttempts]         = useState([]);
  const [attemptsLoading,  setAttemptsLoading]  = useState(false);
  const [toast,            setToast]            = useState(null);

  const showToast = (msg, type = "info") => setToast({ message: msg, type });

  /* ---------- fetch ---------- */
  const fetchData = async ({ silent = false } = {}) => {
    silent ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;

      const [commRes, statsRes] = await Promise.allSettled([
        GetCommissions(params),
        GetCommissionStats(),
      ]);

      if (commRes.status !== "fulfilled") throw commRes.reason;
      setCommissions(toArray(commRes.value?.data || commRes.value));
      if (statsRes.status === "fulfilled" && statsRes.value?.data?.success) setStatsData(statsRes.value.data);
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Impossible de charger les commissions.");
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  /* ---------- filter / paginate ---------- */
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return commissions;
    const q = searchTerm.toLowerCase();
    return commissions.filter(c =>
      c.order_id?.toLowerCase().includes(q) ||
      c.collaboration?.offer?.titre?.toLowerCase().includes(q) ||
      c.provider_type?.toLowerCase().includes(q)
    );
  }, [commissions, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  /* ---------- stats ---------- */
  const stats = useMemo(() => {
    const paid    = commissions.filter(c => c.status === "paid");
    const pending = commissions.filter(c => c.status === "pending_payment");
    const failed  = commissions.filter(c => c.status === "payment_failed");
    return {
      count:         commissions.length,
      paidAmount:    paid.reduce((s, c) => s + parseFloat(c.commission_provider || 0), 0),
      pendingAmount: pending.reduce((s, c) => s + parseFloat(c.commission_provider || 0), 0),
      totalAmount:   commissions.reduce((s, c) => s + parseFloat(c.commission_provider || 0), 0),
      paidCount:     paid.length,
      pendingCount:  pending.length,
      failedCount:   failed.length,
    };
  }, [commissions]);

  const openDetails = async (commission) => {
    setActiveCommission(commission);
    setOpenModal(true);
    setAttemptsLoading(true);
    setAttempts([]);
    try {
      const res = await GetPaymentAttempts(commission.id);
      setAttempts(toArray(res?.data || res));
    } catch { setAttempts([]); }
    finally { setAttemptsLoading(false); }
  };

  /* ---------- render ---------- */
  if (loading) return <TeqaLoader label="Chargement des commissions…" />;

  return (
    <div style={{ background: "var(--teqa-bg)", minHeight: "100vh", padding: "20px 16px" }}>
      <AnimatePresence>
        {toast && <TeqaToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconBox icon={Wallet2} variant="green" size={18} boxSize={38} />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--teqa-text)", margin: 0 }}>
                Commissions
              </h1>
              <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>Suivi de toutes les commissions</p>
            </div>
          </div>
          <button onClick={() => fetchData({ silent: true })} disabled={refreshing} className="btn-outline" style={{ gap: 6 }}>
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Actualiser
          </button>
        </motion.div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
          <MetricCard title="Total commissions"  value={fmt(stats.totalAmount)}   sub={`${stats.count} total`}             icon={Wallet2}      iconVariant="green"   delay={0}    />
          <MetricCard title="Disponible"         value={fmt(stats.paidAmount)}    sub={`${stats.paidCount} payées`}         icon={CheckCircle2} iconVariant="green"   delay={0.05} />
          <MetricCard title="En attente"         value={fmt(stats.pendingAmount)} sub={`${stats.pendingCount} en cours`}    icon={Clock3}       iconVariant="warning" delay={0.1}  />
          <MetricCard title="Échouées"           value={stats.failedCount}        sub="Paiements échoués"                   icon={XCircle}      iconVariant="red"     delay={0.15} />
        </div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="teqa-card" style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--teqa-hint)", pointerEvents: "none" }} />
              <input placeholder="Order ID, offre, provider…" value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }} className="teqa-input" style={{ paddingLeft: 36 }} />
            </div>
            <div style={{ position: "relative", minWidth: 200 }}>
              <Filter size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--teqa-hint)", pointerEvents: "none" }} />
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="teqa-input" style={{ paddingLeft: 30, appearance: "none", cursor: "pointer" }}>
                <option value="all">Tous les statuts</option>
                <option value="pending_payment">En attente</option>
                <option value="processing_payment">En traitement</option>
                <option value="paid">Payé</option>
                <option value="payment_failed">Paiement échoué</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="alert-danger">
              <AlertCircle size={16} style={{ marginRight: 8, flexShrink: 0 }} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="teqa-card">
            <TeqaEmpty icon={Wallet2} title="Aucune commission trouvée" subtitle="Vos commissions apparaîtront ici après chaque paiement" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="teqa-card data-table-shell" style={{ overflow: "hidden", padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table className="teqa-table">
                <thead>
                  <tr>
                    <th>Commande</th>
                    <th>Offre</th>
                    <th>Provider</th>
                    <th>Montant total</th>
                    <th>Commission</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>—</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginated.map((c, idx) => (
                      <motion.tr key={c.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}
                        style={{ transition: "background 0.15s", cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--teqa-surface2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td><span style={{ fontSize: 12, color: "var(--teqa-muted)" }}>{c.order_reference || (c.order_id ? "Commande liée" : "—")}</span></td>
                        <td><p style={{ fontSize: 13, fontWeight: 500, color: "var(--teqa-text)", margin: 0, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.collaboration?.offer?.titre || "—"}</p></td>
                        <td><ProviderCell type={c.provider_type} /></td>
                        <td><span style={{ fontSize: 13, fontWeight: 500, color: "var(--teqa-text)" }}>{fmt(c.commission_total, c.currency)}</span></td>
                        <td><span style={{ fontSize: 14, fontWeight: 700, color: "var(--teqa-green)" }}>{fmt(c.commission_provider, c.currency)}</span></td>
                        <td><StatusChip status={c.status} /></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--teqa-muted)" }}>
                            <Calendar size={11} style={{ color: "var(--teqa-hint)" }} />
                            {fmtDate(c.created_at)}
                          </div>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button onClick={() => openDetails(c)} className="icon-button" style={{ width: 30, height: 30 }} title="Voir détails">
                            <Eye size={14} style={{ color: "var(--teqa-muted)" }} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
            <TeqaPagination currentPage={page} totalPages={totalPages} total={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPage={setPage} />
          </motion.div>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {openModal && activeCommission && (
          <TeqaModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            title="Détails de la commission"
            subtitle={activeCommission.order_reference || (activeCommission.order_id ? "Commande liée" : "Sans commande")}
            icon={Wallet2}
            iconVariant="green"
            accentColor="var(--teqa-green)"
            footer={<button onClick={() => setOpenModal(false)} className="btn-primary">Fermer</button>}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <InfoRow label="Offre">
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--teqa-text)", margin: 0 }}>
                  {activeCommission?.collaboration?.offer?.titre || "—"}
                </p>
              </InfoRow>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <InfoRow label="Montant total">
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--teqa-text)", margin: 0 }}>{fmt(activeCommission.commission_total, activeCommission.currency)}</p>
                </InfoRow>
                <InfoRow label="Commission provider" variant="green">
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--teqa-green)", margin: 0 }}>{fmt(activeCommission.commission_provider, activeCommission.currency)}</p>
                </InfoRow>
                <InfoRow label="Frais SaaS">
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--teqa-text)", margin: 0 }}>{fmt(activeCommission.commission_saas, activeCommission.currency)}</p>
                </InfoRow>
                <InfoRow label="Créé le">
                  <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>{fmtDate(activeCommission.created_at)}</p>
                </InfoRow>
              </div>

              {/* Payment attempts */}
              <div style={{ marginTop: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <IconBox icon={Zap} variant="warning" size={13} boxSize={26} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--teqa-text)", margin: 0 }}>Tentatives de paiement</p>
                </div>
                {attemptsLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: "24px 0" }}>
                    <Loader2 size={22} style={{ color: "var(--teqa-green)" }} className="animate-spin" />
                  </div>
                ) : attempts.length === 0 ? (
                  <div className="surface-card-muted" style={{ textAlign: "center", fontSize: 13 }}>Aucune tentative enregistrée</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {attempts.map((a, i) => (
                      <AttemptItem key={a.id} attempt={a} idx={i} currency={activeCommission.currency} formatPrice={fmt} formatDate={fmtDate} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TeqaModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgencyCommissions;