// MyCommissions.jsx  (Agent view)
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  TrendingUp, RefreshCw, Loader2, CheckCircle, XCircle,
  Clock, Eye, Search, Filter, FileText, Wallet,
  Zap, Calendar, AlertTriangle,
} from "lucide-react";
import { GetCommissions, GetPaymentAttempts } from "../../api/auth";
import {
  IconBox, MetricCard, TeqaModal, TeqaToast, TeqaLoader,
  TeqaError, TeqaEmpty, TeqaPagination, InfoRow, AttemptItem,
} from "../../components/ui/teqa-shared";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */

const STATUS_CONFIG = {
  pending_payment:    { label: "En attente",     badgeClass: "badge badge-neutral", icon: Clock,       spinning: false },
  processing_payment: { label: "En traitement",  badgeClass: "badge badge-blue",    icon: RefreshCw,   spinning: true  },
  paid:               { label: "Payé",           badgeClass: "badge badge-green",   icon: CheckCircle, spinning: false },
  payment_failed:     { label: "Paiement échoué",badgeClass: "badge badge-red",     icon: XCircle,     spinning: false },
  cancelled:          { label: "Annulé",         badgeClass: "badge badge-neutral", icon: XCircle,     spinning: false },
};

const ITEMS_PER_PAGE = 10;

const fmt = (v, cur = "MAD") => `${parseFloat(v || 0).toLocaleString("fr-FR")} ${cur}`;
const fmtDate = (v) => {
  if (!v) return "—";
  try { return new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(v)); }
  catch { return v; }
};

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */

const StatusBadge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending_payment;
  return (
    <span className={c.badgeClass} style={{ gap: 5 }}>
      <c.icon size={11} className={c.spinning ? "animate-spin" : ""} />
      {c.label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

const MyCommissions = () => {
  const [commissions,        setCommissions]        = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [error,              setError]              = useState(null);
  const [searchTerm,         setSearchTerm]         = useState("");
  const [statusFilter,       setStatusFilter]       = useState("all");
  const [currentPage,        setCurrentPage]        = useState(1);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [paymentAttempts,    setPaymentAttempts]    = useState([]);
  const [showDetailsModal,   setShowDetailsModal]   = useState(false);
  const [showAttemptsModal,  setShowAttemptsModal]  = useState(false);
  const [loadingAttempts,    setLoadingAttempts]    = useState(false);
  const [toast,              setToast]              = useState(null);

  const showToast = (msg, type = "info") => setToast({ message: msg, type });

  /* ---------- fetch ---------- */
  const fetchCommissions = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await GetCommissions(params);
      const data = res.data?.results || (Array.isArray(res.data) ? res.data : []);
      setCommissions(data);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les commissions");
      showToast(err.response?.data?.message || "Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCommissions(); }, [statusFilter]);

  const fetchAttempts = async (id) => {
    setLoadingAttempts(true);
    try {
      const res = await GetPaymentAttempts(id);
      const data = res.data?.results || (Array.isArray(res.data) ? res.data : []);
      setPaymentAttempts(data);
    } catch { setPaymentAttempts([]); }
    finally { setLoadingAttempts(false); }
  };

  /* ---------- filter / paginate ---------- */
  const filtered = commissions.filter(c => {
    const q = searchTerm.toLowerCase();
    return !q || c.order_id?.toLowerCase().includes(q) || c.collaboration?.offer?.titre?.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  /* ---------- stats ---------- */
  const stats = {
    total:         commissions.length,
    paid:          commissions.filter(c => c.status === "paid").length,
    pending:       commissions.filter(c => c.status === "pending_payment").length,
    failed:        commissions.filter(c => c.status === "payment_failed").length,
    totalEarned:   commissions.filter(c => c.status === "paid").reduce((s, c) => s + parseFloat(c.commission_provider || 0), 0),
    pendingAmount: commissions.filter(c => c.status === "pending_payment").reduce((s, c) => s + parseFloat(c.commission_provider || 0), 0),
  };

  const openDetails = async (commission) => {
    setSelectedCommission(commission);
    await fetchAttempts(commission.id);
    setShowDetailsModal(true);
  };

  /* ---------- render ---------- */
  if (loading) return <TeqaLoader label="Chargement des commissions…" />;
  if (error)   return <TeqaError message={error} onRetry={fetchCommissions} />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AnimatePresence>
        {toast && <TeqaToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <IconBox icon={TrendingUp} variant="green" size={18} boxSize={38} />
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--teqa-text)", margin: 0 }}>
              Mes Commissions
            </h1>
            <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>Suivez vos gains et paiements</p>
          </div>
        </div>
        <button onClick={fetchCommissions} className="btn-outline" style={{ gap: 6 }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser
        </button>
      </motion.div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
        <MetricCard title="Gains totaux"      value={fmt(stats.totalEarned, "MAD")}   sub={`${stats.paid} payées`}          icon={Wallet}      iconVariant="green"   delay={0}    />
        <MetricCard title="En attente"        value={stats.pending}                   sub={fmt(stats.pendingAmount, "MAD")} icon={Clock}       iconVariant="warning" delay={0.05} />
        <MetricCard title="Payées"            value={stats.paid}                       icon={CheckCircle}                    iconVariant="green" delay={0.1}           />
        <MetricCard title="Échouées"          value={stats.failed}                     icon={XCircle}                        iconVariant="red"  delay={0.15}           />
        <MetricCard title="Total commissions" value={stats.total}                      icon={FileText}                       iconVariant="blue" delay={0.2}            />
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="teqa-card" style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--teqa-hint)", pointerEvents: "none" }} />
            <input placeholder="Order ID, titre de l'offre…" value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="teqa-input" style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ position: "relative", minWidth: 200 }}>
            <Filter size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--teqa-hint)", pointerEvents: "none" }} />
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
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

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="teqa-card">
          <TeqaEmpty icon={TrendingUp} title="Aucune commission trouvée"
            subtitle="Vos commissions apparaîtront ici après chaque collaboration complétée" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="teqa-card data-table-shell" style={{ overflow: "hidden", padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table className="teqa-table">
              <thead>
                <tr>
                  <th>Commande</th>
                  <th>Offre</th>
                  <th>Montant</th>
                  <th>Ma commission</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>—</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {paginated.map((c, idx) => (
                    <motion.tr key={c.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                      style={{ transition: "background 0.15s", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--teqa-surface2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td><span style={{ fontSize: 12, color: "var(--teqa-muted)" }}>{c.order_reference || (c.order_id ? "Commande liée" : "—")}</span></td>
                      <td><p style={{ fontSize: 13, fontWeight: 500, color: "var(--teqa-text)", margin: 0, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.collaboration?.offer?.titre || "—"}</p></td>
                      <td><span style={{ fontSize: 13, fontWeight: 500, color: "var(--teqa-text)" }}>{fmt(c.commission_total, c.currency)}</span></td>
                      <td><span style={{ fontSize: 14, fontWeight: 700, color: "var(--teqa-green)" }}>{fmt(c.commission_provider, c.currency)}</span></td>
                      <td><StatusBadge status={c.status} /></td>
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
          <TeqaPagination currentPage={currentPage} totalPages={totalPages} total={filtered.length} itemsPerPage={ITEMS_PER_PAGE} onPage={setCurrentPage} />
        </motion.div>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedCommission && (
          <TeqaModal
            open={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title="Détails de la commission"
            subtitle={selectedCommission.order_reference || (selectedCommission.order_id ? "Commande liée" : "Sans commande")}
            icon={TrendingUp}
            iconVariant="green"
            accentColor="var(--teqa-green)"
            footer={
              <>
                <button onClick={() => { setShowDetailsModal(false); setShowAttemptsModal(true); }} className="btn-outline">
                  Toutes les tentatives ({paymentAttempts.length})
                </button>
                <button onClick={() => setShowDetailsModal(false)} className="btn-primary">Fermer</button>
              </>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <InfoRow label="Offre">
                <p style={{ fontSize: 14, fontWeight: 500, color: "var(--teqa-text)", margin: 0 }}>
                  {selectedCommission.collaboration?.offer?.titre || "—"}
                </p>
              </InfoRow>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <InfoRow label="Montant total">
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--teqa-text)", margin: 0 }}>{fmt(selectedCommission.commission_total, selectedCommission.currency)}</p>
                </InfoRow>
                <InfoRow label="Ma commission" variant="green">
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--teqa-green)", margin: 0 }}>{fmt(selectedCommission.commission_provider, selectedCommission.currency)}</p>
                </InfoRow>
                <InfoRow label="Frais SaaS">
                  <p style={{ fontSize: 13, color: "var(--teqa-text)", margin: 0 }}>{fmt(selectedCommission.commission_saas, selectedCommission.currency)}</p>
                </InfoRow>
                <InfoRow label="Final store">
                  <p style={{ fontSize: 13, color: "var(--teqa-text)", margin: 0 }}>{fmt(selectedCommission.commission_final_store, selectedCommission.currency)}</p>
                </InfoRow>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <InfoRow label="Statut"><StatusBadge status={selectedCommission.status} /></InfoRow>
                <InfoRow label="Créé le">
                  <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>{fmtDate(selectedCommission.created_at)}</p>
                </InfoRow>
                {selectedCommission.paid_at && (
                  <InfoRow label="Payé le" variant="green">
                    <p style={{ fontSize: 12, color: "var(--teqa-green)", margin: 0 }}>{fmtDate(selectedCommission.paid_at)}</p>
                  </InfoRow>
                )}
              </div>

              {/* Aperçu tentatives */}
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <IconBox icon={Zap} variant="warning" size={13} boxSize={26} />
                  <p style={{ fontSize: 13, fontWeight: 600, color: "var(--teqa-text)", margin: 0 }}>Tentatives de paiement</p>
                </div>
                {paymentAttempts.slice(0, 3).length === 0 ? (
                  <div className="surface-card-muted" style={{ textAlign: "center", fontSize: 13 }}>Aucune tentative enregistrée</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {paymentAttempts.slice(0, 3).map((a, i) => (
                      <AttemptItem key={a.id} attempt={a} idx={i} currency={selectedCommission.currency} formatPrice={fmt} formatDate={fmtDate} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TeqaModal>
        )}
      </AnimatePresence>

      {/* All Attempts Modal */}
      <AnimatePresence>
        {showAttemptsModal && selectedCommission && (
          <TeqaModal
            open={showAttemptsModal}
            onClose={() => setShowAttemptsModal(false)}
            title="Historique de paiement"
            subtitle={selectedCommission.order_reference || "Commission"}
            icon={Clock}
            iconVariant="warning"
            accentColor="var(--teqa-warning)"
            maxWidth={560}
            footer={<button onClick={() => setShowAttemptsModal(false)} className="btn-primary">Fermer</button>}
          >
            {loadingAttempts ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
                <Loader2 size={22} style={{ color: "var(--teqa-green)" }} className="animate-spin" />
              </div>
            ) : paymentAttempts.length === 0 ? (
              <TeqaEmpty icon={AlertTriangle} title="Aucune tentative enregistrée" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {paymentAttempts.map((a, i) => (
                  <AttemptItem key={a.id} attempt={a} idx={i} currency={selectedCommission.currency} formatPrice={fmt} formatDate={fmtDate} />
                ))}
              </div>
            )}
          </TeqaModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyCommissions;