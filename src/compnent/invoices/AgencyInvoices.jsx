// AgencyInvoices.jsx
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FileText, RefreshCw, Loader2, CheckCircle, XCircle, Clock,
  Eye, Download, Search, Receipt, Wallet, Copy, Check, Calendar,
} from "lucide-react";
import { GetInvoices, DownloadInvoicePDF, GetInvoiceStats, GetTransferDetails } from "../../api/auth";
import {
  IconBox, MetricCard, TeqaModal, TeqaToast, TeqaLoader,
  TeqaError, TeqaEmpty, TeqaPagination, InfoRow,
} from "../../components/ui/teqa-shared";

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */

const INVOICE_TYPE_CONFIG = {
  PROVIDER_CREDIT:  { label: "Reçu de paiement", iconVariant: "green",   icon: CheckCircle },
  PROVIDER_INVOICE: { label: "Facture provider",  iconVariant: "neutral", icon: FileText    },
};

const INVOICE_STATUS = {
  pending:   { label: "En attente", badgeClass: "badge badge-neutral", icon: Clock,       spinning: false },
  paid:      { label: "Payé",       badgeClass: "badge badge-green",   icon: CheckCircle, spinning: false },
  failed:    { label: "Échoué",     badgeClass: "badge badge-red",     icon: XCircle,     spinning: false },
  cancelled: { label: "Annulé",     badgeClass: "badge badge-neutral", icon: XCircle,     spinning: false },
  refunded:  { label: "Remboursé",  badgeClass: "badge badge-neutral", icon: RefreshCw,   spinning: false },
};

const ITEMS_PER_PAGE = 10;
const fmt = (price, currency = "MAD") => `${parseFloat(price || 0).toLocaleString("fr-MA")} ${currency}`;
const fmtDate = (v) => {
  if (!v) return "—";
  try {
    const d = new Date(v), now = new Date();
    const diff = Math.floor((now - d) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Hier";
    if (diff < 7)  return `Il y a ${diff} jours`;
    return new Intl.DateTimeFormat("fr-FR", { year: "numeric", month: "short", day: "numeric" }).format(d);
  } catch { return v; }
};
const fmtFull = (v) => {
  if (!v) return "—";
  try { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "medium" }).format(new Date(v)); }
  catch { return v; }
};

/* ─────────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────────── */

const StatusBadge = ({ status }) => {
  const c = INVOICE_STATUS[status] || INVOICE_STATUS.pending;
  return (
    <span className={c.badgeClass} style={{ gap: 5 }}>
      <c.icon size={11} />
      {c.label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const c = INVOICE_TYPE_CONFIG[type] || INVOICE_TYPE_CONFIG.PROVIDER_INVOICE;
  return (
    <span className={`badge badge-${c.iconVariant === "green" ? "green" : "neutral"}`} style={{ gap: 5 }}>
      <c.icon size={11} />
      {c.label}
    </span>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

const AgencyInvoices = () => {
  const [invoices,          setInvoices]          = useState([]);
  const [stats,             setStats]             = useState(null);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  const [searchTerm,        setSearchTerm]        = useState("");
  const [typeFilter,        setTypeFilter]        = useState("all");
  const [statusFilter,      setStatusFilter]      = useState("all");
  const [currentPage,       setCurrentPage]       = useState(1);
  const [selectedInvoice,   setSelectedInvoice]   = useState(null);
  const [transferDetails,   setTransferDetails]   = useState(null);
  const [showDetails,       setShowDetails]       = useState(false);
  const [showTransfer,      setShowTransfer]      = useState(false);
  const [downloading,       setDownloading]       = useState(false);
  const [loadingTransfer,   setLoadingTransfer]   = useState(false);
  const [toast,             setToast]             = useState(null);
  const [copiedId,          setCopiedId]          = useState(null);

  const showToast = (msg, type = "info") => setToast({ message: msg, type });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast("Copié !", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  /* ---------- fetch ---------- */
  const fetchInvoices = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (typeFilter !== "all")   params.invoice_type = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const [invRes, statsRes] = await Promise.all([
        GetInvoices(params),
        GetInvoiceStats().catch(() => ({ data: null })),
      ]);

      const data = invRes.data?.results || (Array.isArray(invRes.data) ? invRes.data : []);
      setInvoices(data);

      if (statsRes.data?.success !== false && statsRes.data) {
        setStats(statsRes.data);
      } else if (data.length > 0) {
        setStats({
          total_invoices: data.length,
          total_amount:   data.reduce((s, i) => s + parseFloat(i.amount), 0),
          paid_amount:    data.filter(i => i.status === "paid").reduce((s, i) => s + parseFloat(i.amount), 0),
          currency:       data[0]?.currency || "MAD",
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les factures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, [typeFilter, statusFilter]);

  const fetchTransfer = async (invoiceId) => {
    setLoadingTransfer(true);
    try {
      const res = await GetTransferDetails(invoiceId);
      setTransferDetails(res.data?.success ? res.data.transfer : null);
    } catch { setTransferDetails(null); }
    finally { setLoadingTransfer(false); }
  };

  const handleDownload = async (invoice) => {
    setDownloading(true);
    try {
      const res = await DownloadInvoicePDF(invoice.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = `invoice_${invoice.invoice_number}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
      showToast("Facture téléchargée", "success");
    } catch { showToast("Erreur de téléchargement", "error"); }
    finally { setDownloading(false); }
  };

  const openDetails = async (invoice) => {
    setSelectedInvoice(invoice);
    await fetchTransfer(invoice.id);
    setShowDetails(true);
  };

  /* ---------- filter / paginate ---------- */
  const filtered = invoices.filter(inv => {
    const q = searchTerm.toLowerCase();
    return !q || inv.invoice_number?.toLowerCase().includes(q) || inv.order_id?.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  useEffect(() => { if (currentPage > totalPages) setCurrentPage(totalPages); }, [currentPage, totalPages]);

  /* ---------- render ---------- */
  if (loading) return <TeqaLoader label="Chargement des factures…" />;
  if (error && invoices.length === 0) return <TeqaError message={error} onRetry={fetchInvoices} />;

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
            <IconBox icon={FileText} variant="green" size={18} boxSize={38} />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--teqa-text)", margin: 0 }}>
                Mes Factures
              </h1>
              <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>Gérez et suivez toutes vos factures</p>
            </div>
          </div>
          <button onClick={fetchInvoices} className="btn-outline" style={{ gap: 6 }}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
        </motion.div>

        {/* Metrics */}
        {stats && stats.total_invoices > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            <MetricCard title="Montant total" value={fmt(stats.total_amount, stats.currency)} sub={`${stats.total_invoices} factures`} icon={Wallet} iconVariant="green" delay={0} />
            <MetricCard title="Payé"          value={fmt(stats.paid_amount, stats.currency)}  icon={CheckCircle} iconVariant="green" delay={0.05} />
            <MetricCard title="En attente"    value={fmt(stats.total_amount - stats.paid_amount, stats.currency)} icon={Clock} iconVariant="warning" delay={0.1} />
            <MetricCard title="Total factures" value={stats.total_invoices} icon={FileText} iconVariant="blue" delay={0.15} />
          </div>
        )}

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="teqa-card" style={{ padding: "12px 14px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--teqa-hint)", pointerEvents: "none" }} />
              <input placeholder="N° facture, order ID…" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="teqa-input" style={{ paddingLeft: 36 }} />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="teqa-input" style={{ minWidth: 160, cursor: "pointer", appearance: "none" }}>
              <option value="all">Tous les types</option>
              <option value="PROVIDER_CREDIT">Reçus de paiement</option>
              <option value="PROVIDER_INVOICE">Factures provider</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="teqa-input" style={{ minWidth: 160, cursor: "pointer", appearance: "none" }}>
              <option value="all">Tous les statuts</option>
              <option value="paid">Payé</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoué</option>
              <option value="cancelled">Annulé</option>
              <option value="refunded">Remboursé</option>
            </select>
          </div>
        </motion.div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="teqa-card">
            <TeqaEmpty icon={FileText} title="Aucune facture trouvée"
              subtitle={searchTerm ? "Aucun résultat pour votre recherche" : "Vos factures apparaîtront ici lors des paiements"} />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="teqa-card data-table-shell" style={{ overflow: "hidden", padding: 0 }}>
            <div style={{ overflowX: "auto" }}>
              <table className="teqa-table">
                <thead>
                  <tr>
                    <th>N° Facture</th>
                    <th>Type</th>
                    <th>Commande</th>
                    <th>Montant</th>
                    <th>Statut</th>
                    <th>Date</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {paginated.map((inv, idx) => (
                      <motion.tr key={inv.id}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                        style={{ transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--teqa-surface2)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <code style={{ fontSize: 11, fontFamily: "monospace", color: "var(--teqa-text)", background: "var(--teqa-surface2)", padding: "2px 6px", borderRadius: 4 }}>
                              {inv.invoice_number}
                            </code>
                            <button onClick={() => copyToClipboard(inv.invoice_number)} className="icon-button" style={{ width: 22, height: 22, opacity: 0.6 }}>
                              {copiedId === inv.invoice_number ? <Check size={10} style={{ color: "var(--teqa-green)" }} /> : <Copy size={10} />}
                            </button>
                          </div>
                        </td>
                        <td><TypeBadge type={inv.invoice_type} /></td>
                        <td><span style={{ fontSize: 12, color: "var(--teqa-muted)" }}>{inv.order_reference || (inv.order_id ? "Commande liée" : "—")}</span></td>
                        <td><span style={{ fontSize: 14, fontWeight: 600, color: "var(--teqa-text)" }}>{fmt(inv.amount, inv.currency)}</span></td>
                        <td><StatusBadge status={inv.status} /></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--teqa-muted)" }}>
                            <Calendar size={11} style={{ color: "var(--teqa-hint)" }} />
                            {fmtDate(inv.issued_at || inv.created_at)}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                            <button onClick={() => openDetails(inv)} className="icon-button" style={{ width: 30, height: 30 }} title="Voir détails">
                              <Eye size={14} style={{ color: "var(--teqa-muted)" }} />
                            </button>
                            <button onClick={() => handleDownload(inv)} disabled={downloading} className="icon-button"
                              style={{ width: 30, height: 30, opacity: downloading ? 0.5 : 1 }} title="Télécharger">
                              {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={14} style={{ color: "var(--teqa-muted)" }} />}
                            </button>
                          </div>
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
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && selectedInvoice && (
          <TeqaModal
            open={showDetails}
            onClose={() => setShowDetails(false)}
            title="Détails de la facture"
            subtitle={selectedInvoice.invoice_number}
            icon={FileText}
            iconVariant="green"
            accentColor="var(--teqa-green)"
            footer={
              <>
                <button onClick={() => handleDownload(selectedInvoice)} disabled={downloading} className="btn-outline" style={{ gap: 6 }}>
                  {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={14} />} Télécharger
                </button>
                {transferDetails && (
                  <button onClick={() => setShowTransfer(true)} className="btn-outline" style={{ gap: 6 }}>
                    <Wallet size={14} /> Voir le transfert
                  </button>
                )}
                <button onClick={() => setShowDetails(false)} className="btn-primary">Fermer</button>
              </>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <InfoRow label="Type de facture"><TypeBadge type={selectedInvoice.invoice_type} /></InfoRow>
                <InfoRow label="Statut"><StatusBadge status={selectedInvoice.status} /></InfoRow>
              </div>

              <InfoRow label="Montant" variant="green">
                <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--teqa-green)", margin: 0 }}>
                  {fmt(selectedInvoice.amount, selectedInvoice.currency)}
                </p>
              </InfoRow>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <InfoRow label="Date d'émission">
                  <p style={{ fontSize: 13, color: "var(--teqa-text)", margin: 0 }}>{fmtFull(selectedInvoice.issued_at || selectedInvoice.created_at)}</p>
                </InfoRow>
                {selectedInvoice.paid_at && (
                  <InfoRow label="Date de paiement" variant="green">
                    <p style={{ fontSize: 13, color: "var(--teqa-green)", margin: 0 }}>{fmtFull(selectedInvoice.paid_at)}</p>
                  </InfoRow>
                )}
                {selectedInvoice.due_date && (
                  <InfoRow label="Date d'échéance" variant="warning">
                    <p style={{ fontSize: 13, color: "var(--teqa-warning)", margin: 0 }}>{fmtFull(selectedInvoice.due_date)}</p>
                  </InfoRow>
                )}
              </div>

              <InfoRow label="Commande">
                <p style={{ fontSize: 13, color: "var(--teqa-text)", margin: 0 }}>
                  {selectedInvoice.order_reference || (selectedInvoice.order_id ? "Commande liée" : "—")}
                </p>
              </InfoRow>

              {selectedInvoice.notes && (
                <InfoRow label="Notes">
                  <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: 0 }}>{selectedInvoice.notes}</p>
                </InfoRow>
              )}
            </div>
          </TeqaModal>
        )}
      </AnimatePresence>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransfer && transferDetails && (
          <TeqaModal
            open={showTransfer}
            onClose={() => setShowTransfer(false)}
            title="Détails du transfert"
            icon={Wallet}
            iconVariant="blue"
            accentColor="var(--teqa-blue)"
            maxWidth={480}
            footer={<button onClick={() => setShowTransfer(false)} className="btn-primary">Fermer</button>}
          >
            {loadingTransfer ? (
              <TeqaLoader label="Chargement du transfert…" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <InfoRow label="Montant">
                  <p style={{ fontSize: 18, fontWeight: 700, color: "var(--teqa-text)", margin: 0 }}>{fmt(transferDetails.amount, transferDetails.currency)}</p>
                </InfoRow>
                <InfoRow label="Statut"><StatusBadge status={transferDetails.status} /></InfoRow>
                <InfoRow label="Référence">
                  <code style={{ fontSize: 12, fontFamily: "monospace", color: "var(--teqa-muted)" }}>{transferDetails.reference || "—"}</code>
                </InfoRow>
                <InfoRow label="Date">
                  <p style={{ fontSize: 13, color: "var(--teqa-text)", margin: 0 }}>{fmtFull(transferDetails.created_at)}</p>
                </InfoRow>
                {transferDetails.note && (
                  <InfoRow label="Note">
                    <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: 0 }}>{transferDetails.note}</p>
                  </InfoRow>
                )}
              </div>
            )}
          </TeqaModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgencyInvoices;