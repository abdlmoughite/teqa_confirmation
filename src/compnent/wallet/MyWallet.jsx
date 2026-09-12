import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
  AlertCircle,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Receipt,
  History,
  Shield,
  Zap,
  Banknote,
  X,
  Send,
  Building2,
  Phone,
  User,
} from "lucide-react";

import { GetWalletSummary, GetMyTransactions, GetTransactionStats, GetWithdrawalRequests, CreateWithdrawalRequest, CancelWithdrawalRequest } from "../../api/auth";
import TeqaLoader from "../shared/TeqaLoader";
import CreateWalletModal from "./CreateWalletModal";
import TransactionDetailsModal from "./TransactionDetailsModal";
import { usePublicEntities } from "../../hooks/usePublicEntities";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS (TEQA icon system)

   Règle icons :
   - Taille standard : 16px (row), 18px (card), 22px (header)
   - Container : border-radius 8px, padding 8px, fond dim
   - Couleur icône = couleur TEQA token (pas Tailwind)
   - Direction CREDIT → vert, DEBIT → rouge
   - Type icône → bleu (neutre/info)
   - Status icône → selon statut
───────────────────────────────────────────────────────────── */

const ICON_CONTAINERS = {
  green:   { bg: "var(--teqa-green-dim)", color: "var(--teqa-green)" },
  blue:    { bg: "var(--teqa-blue-dim)",  color: "var(--teqa-blue)"  },
  red:     { bg: "var(--teqa-red-dim)",   color: "var(--teqa-red)"   },
  warning: { bg: "rgba(217,119,6,0.12)", color: "var(--teqa-warning)"},
  neutral: { bg: "var(--teqa-surface3)",  color: "var(--teqa-muted)" },
};

/* Icône dans un container carré arrondi */
const IconBox = ({ icon: Icon, variant = "neutral", size = 16, boxSize = 34 }) => {
  const { bg, color } = ICON_CONTAINERS[variant] || ICON_CONTAINERS.neutral;
  return (
    <div style={{
      width: boxSize, height: boxSize, borderRadius: 8, flexShrink: 0,
      background: bg, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <Icon size={size} style={{ color }} />
    </div>
  );
};

const TRANSACTION_TYPE_CONFIG = {
  commission_payment: { label: "Commission",      icon: TrendingUp,    iconVariant: "blue"    },
  saas_fee:           { label: "SaaS Fee",        icon: CreditCard,    iconVariant: "neutral"  },
  store_debit:        { label: "Store Debit",     icon: ArrowUpRight,  iconVariant: "red"      },
  provider_credit:    { label: "Provider Credit", icon: ArrowDownRight,iconVariant: "green"    },
  deposit:            { label: "Deposit",         icon: TrendingUp,    iconVariant: "green"    },
  withdrawal:         { label: "Withdrawal",      icon: TrendingDown,  iconVariant: "red"      },
  transfer:           { label: "Transfer",        icon: ArrowUpRight,  iconVariant: "neutral"  },
};

const TRANSACTION_STATUS_CONFIG = {
  pending: { label: "En attente", icon: Clock,        badgeClass: "badge badge-neutral" },
  success: { label: "Succès",     icon: CheckCircle,  badgeClass: "badge badge-green"   },
  failed:  { label: "Échoué",     icon: XCircle,      badgeClass: "badge badge-red"     },
};

const ITEMS_PER_PAGE = 10;

const WITHDRAWAL_STATUS_CONFIG = {
  pending:   { label: "En attente",  icon: Clock,       badgeClass: "badge badge-neutral", variant: "warning" },
  approved:  { label: "Approuvé",    icon: CheckCircle, badgeClass: "badge badge-green",   variant: "green"   },
  rejected:  { label: "Refusé",      icon: XCircle,     badgeClass: "badge badge-red",     variant: "red"     },
  paid:      { label: "Payé",        icon: Banknote,    badgeClass: "badge badge-green",   variant: "green"   },
  cancelled: { label: "Annulé",      icon: XCircle,     badgeClass: "badge badge-neutral", variant: "neutral" },
};
const PAYOUT_LABELS = { bank_transfer: "Virement bancaire", cash_plus: "Cash Plus" };

const formatOwnerType = (type) =>
  !type ? "Wallet account"
        : String(type).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/* ─────────────────────────────────────────────────────────────
   HELPERS DE FORMATAGE
───────────────────────────────────────────────────────────── */

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date  = new Date(dateString);
    const now   = new Date();
    const diffD = Math.floor((now - date) / 86400000);
    if (diffD === 0) return "Today";
    if (diffD === 1) return "Yesterday";
    if (diffD < 7)  return `${diffD} days ago`;
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
  } catch { return dateString; }
};

const formatFullDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(dateString));
  } catch { return dateString; }
};

const formatPrice = (price, currency = "MAD") =>
  `${parseFloat(price || 0).toLocaleString("fr-MA")} ${currency}`;

/* ─────────────────────────────────────────────────────────────
   SOUS-COMPOSANTS UI
───────────────────────────────────────────────────────────── */

/* Carte de métrique TEQA (remplace le StatCard gradient) */
const MetricCard = ({ title, value, sub, icon: Icon, iconVariant = "green", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="teqa-card teqa-stat"
    style={{ display: "flex", flexDirection: "column", gap: 0 }}
  >
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
      <p className="teqa-stat__label">{title}</p>
      <IconBox icon={Icon} variant={iconVariant} size={15} boxSize={30} />
    </div>
    <p className="teqa-stat__value">{value}</p>
    {sub && <p className="teqa-stat__delta teqa-stat__delta--neutral">{sub}</p>}
  </motion.div>
);

/* Badge statut */
const StatusBadge = ({ status }) => {
  const config = TRANSACTION_STATUS_CONFIG[status] || TRANSACTION_STATUS_CONFIG.pending;
  const Icon   = config.icon;
  return (
    <span className={config.badgeClass} style={{ gap: 5 }}>
      <Icon size={11} style={{ flexShrink: 0 }} className={status === "pending" ? "animate-spin" : ""} />
      {config.label}
    </span>
  );
};

/* Cellule type de transaction */
const TransactionTypeCell = ({ type, direction }) => {
  const config  = TRANSACTION_TYPE_CONFIG[type] || TRANSACTION_TYPE_CONFIG.transfer;
  const isCredit = direction === "RECEIVED";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <IconBox icon={config.icon} variant={config.iconVariant} size={15} boxSize={32} />
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--teqa-text)", margin: 0 }}>
          {config.label}
        </p>
        <p style={{ fontSize: 11, color: "var(--teqa-muted)", margin: 0 }}>
          {isCredit ? "Reçu" : "Envoyé"}
        </p>
      </div>
    </div>
  );
};

/* Montant coloré */
const AmountCell = ({ transaction }) => {
  const isCredit = transaction.type === "CREDIT";
  return (
    <span style={{
      fontSize: 14, fontWeight: 600,
      color: isCredit ? "var(--teqa-green)" : "var(--teqa-red)",
    }}>
      {isCredit ? "+" : "−"}{formatPrice(Math.abs(parseFloat(transaction.amount)), transaction.currency)}
    </span>
  );
};

/* Ligne transaction (overview) */
const TransactionRow = ({ transaction, getCounterpartyName, onClick, delay = 0 }) => {
  const config  = TRANSACTION_TYPE_CONFIG[transaction.transaction_type] || TRANSACTION_TYPE_CONFIG.transfer;
  const isCredit = transaction.type === "CREDIT";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", cursor: "pointer",
        borderBottom: "0.5px solid var(--teqa-border)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--teqa-surface2)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconBox icon={config.icon} variant={config.iconVariant} size={15} boxSize={34} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--teqa-text)", margin: "0 0 2px" }}>
            {config.label}
          </p>
          <p style={{ fontSize: 11, color: "var(--teqa-muted)", margin: 0 }}>
            {getCounterpartyName(transaction)} · {formatDate(transaction.created_at)}
          </p>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", color: isCredit ? "var(--teqa-green)" : "var(--teqa-red)" }}>
          {isCredit ? "+" : "−"}{formatPrice(Math.abs(parseFloat(transaction.amount)), transaction.currency)}
        </p>
        <StatusBadge status={transaction.status} />
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   COMPOSANT PRINCIPAL
───────────────────────────────────────────────────────────── */

const MyWallet = () => {
  const [wallets,             setWallets]             = useState([]);
  const [selectedWallet,      setSelectedWallet]      = useState(null);
  const [transactions,        setTransactions]        = useState([]);
  const [stats,               setStats]               = useState(null);
  const [loading,             setLoading]             = useState(true);
  const [error,               setError]               = useState(null);
  const [activeTab,           setActiveTab]           = useState("overview");
  const [showCreateModal,     setShowCreateModal]     = useState(false);
  const [showDetailsModal,    setShowDetailsModal]    = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm,          setSearchTerm]          = useState("");
  const [typeFilter,          setTypeFilter]          = useState("all");
  const [statusFilter,        setStatusFilter]        = useState("all");
  const [currentPage,         setCurrentPage]         = useState(1);

  /* ── Withdrawals state ── */
  const [withdrawals,          setWithdrawals]          = useState([]);
  const [withdrawalsLoading,   setWithdrawalsLoading]   = useState(false);
  const [showWithdrawalModal,  setShowWithdrawalModal]  = useState(false);
  const [wForm,                setWForm]                = useState({ amount: "", payout_method: "bank_transfer", rib: "", beneficiary_name: "", full_name: "", cin_number: "", phone_number: "" });
  const [wError,               setWError]               = useState("");
  const [wSubmitting,          setWSubmitting]          = useState(false);

  /* ---------- fetch ---------- */
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletRes, txRes, statsRes] = await Promise.all([
        GetWalletSummary(),
        GetMyTransactions(),
        GetTransactionStats().catch(() => ({ data: null })),
      ]);

      const walletsData = walletRes.data?.wallets || [];
      setWallets(walletsData);
      if (walletsData.length > 0 && !selectedWallet) setSelectedWallet(walletsData[0]);

      if (txRes.data?.success) {
        setTransactions(txRes.data.transactions || []);
        setStats({
          ...(statsRes.data?.success ? statsRes.data : {}),
          ...(txRes.data.statistics || {}),
          current_balance: txRes.data.current_balance,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fetchWithdrawals = async () => {
    setWithdrawalsLoading(true);
    try {
      const res = await GetWithdrawalRequests();
      setWithdrawals(res.data?.results || res.data || []);
    } catch { /* silent */ }
    finally { setWithdrawalsLoading(false); }
  };

  useEffect(() => { if (activeTab === "withdrawals") fetchWithdrawals(); }, [activeTab]);

  const handleCreateWithdrawal = async (e) => {
    e.preventDefault();
    setWError("");
    if (!wForm.amount || parseFloat(wForm.amount) <= 0) { setWError("Entrez un montant valide"); return; }
    const payload = { amount: parseFloat(wForm.amount), payout_method: wForm.payout_method };
    if (wForm.payout_method === "bank_transfer") {
      if (!wForm.rib || !wForm.beneficiary_name) { setWError("RIB et nom du bénéficiaire requis"); return; }
      payload.rib = wForm.rib;
      payload.beneficiary_name = wForm.beneficiary_name;
    } else {
      if (!wForm.full_name || !wForm.cin_number || !wForm.phone_number) { setWError("Nom, CIN et téléphone requis"); return; }
      payload.full_name = wForm.full_name;
      payload.cin_number = wForm.cin_number;
      payload.phone_number = wForm.phone_number;
    }
    setWSubmitting(true);
    try {
      await CreateWithdrawalRequest(payload);
      setShowWithdrawalModal(false);
      setWForm({ amount: "", payout_method: "bank_transfer", rib: "", beneficiary_name: "", full_name: "", cin_number: "", phone_number: "" });
      await fetchWithdrawals();
    } catch (err) {
      setWError(err.response?.data?.detail || "Échec de la demande");
    } finally { setWSubmitting(false); }
  };

  const handleCancelWithdrawal = async (wid) => {
    try {
      await CancelWithdrawalRequest(wid);
      await fetchWithdrawals();
    } catch { /* toast could go here */ }
  };

  const publicEntityRefs = useMemo(
    () => transactions.filter((t) => t.counterparty_type && t.counterparty_wallet)
                      .map((t) => ({ type: t.counterparty_type, id: t.counterparty_wallet })),
    [transactions]
  );

  const { getEntityName, getEntitySubtitle } = usePublicEntities(publicEntityRefs);
  const getCounterpartyName     = (t) => t?.counterparty_name || getEntityName(t?.counterparty_type, t?.counterparty_wallet, "Counterparty");
  const getCounterpartySubtitle = (t) => getEntitySubtitle(t?.counterparty_type, t?.counterparty_wallet, "") || formatOwnerType(t?.counterparty_type);

  /* ---------- filters ---------- */
  const filteredTransactions = transactions.filter((t) => {
    const name = getCounterpartyName(t).toLowerCase();
    const matchSearch = t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());
    const matchType   = typeFilter   === "all" || t.transaction_type === typeFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages           = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalBalance          = wallets.reduce((s, w) => s + parseFloat(w.solde), 0);
  const hasExistingWallet     = wallets.length > 0;

  const openDetails = (tx) => { setSelectedTransaction(tx); setShowDetailsModal(true); };

  /* ---------- states ---------- */

  if (loading) {
    return <TeqaLoader label="Chargement du wallet…" />;
  }

  if (error) {
    return (
      <div className="alert-danger" style={{ borderRadius: 14, padding: 24, textAlign: "center", maxWidth: 480, margin: "40px auto" }}>
        <IconBox icon={AlertCircle} variant="red" size={22} boxSize={44} />
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--teqa-red)", margin: "12px 0 6px" }}>Erreur de chargement</p>
        <p style={{ fontSize: 13, color: "var(--teqa-red)", opacity: 0.8, margin: "0 0 16px" }}>{error}</p>
        <button onClick={fetchData} className="btn-danger" style={{ margin: "0 auto" }}>
          <RefreshCw size={14} /> Réessayer
        </button>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div style={{ padding: "24px 16px" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="teqa-card"
          style={{ maxWidth: 520, margin: "0 auto", padding: 40, textAlign: "center" }}
        >
          <IconBox icon={Wallet} variant="blue" size={26} boxSize={56} />
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--teqa-text)", margin: "16px 0 8px" }}>
            Pas encore de wallet
          </h3>
          <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: "0 0 24px" }}>
            Créez votre premier wallet pour gérer vos fonds et suivre vos transactions.
          </p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ margin: "0 auto" }}>
            <Plus size={15} /> Créer mon wallet
          </button>
        </motion.div>
        <CreateWalletModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchData} hasExistingWallet={false} />
      </div>
    );
  }

  /* ---------- main render ---------- */
  return (
    <div style={{ background: "var(--teqa-bg)", minHeight: "100vh", padding: "20px 16px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── HEADER ── */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconBox icon={Wallet} variant="green" size={18} boxSize={38} />
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--teqa-text)", margin: 0 }}>
                Mon Wallet
              </h1>
              <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>Gérez votre solde et vos transactions</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={fetchData} className="icon-button" title="Actualiser">
              <RefreshCw size={15} style={{ color: "var(--teqa-muted)" }} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={hasExistingWallet}
              className="btn-primary"
              style={{ opacity: hasExistingWallet ? 0.4 : 1, cursor: hasExistingWallet ? "not-allowed" : "pointer" }}
              title={hasExistingWallet ? "Un seul wallet par utilisateur" : ""}
            >
              <Plus size={15} /> Nouveau wallet
            </button>
          </div>
        </motion.div>

        {/* ── METRIC CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          <MetricCard title="Solde total"         value={formatPrice(totalBalance, "MAD")}         sub={`${wallets.length} wallet${wallets.length > 1 ? "s" : ""} actif`} icon={Wallet}       iconVariant="green"   delay={0}    />
          <MetricCard title="Total envoyé"        value={stats ? formatPrice(stats.total_debit, "MAD") : "—"}              icon={ArrowUpRight}   iconVariant="red"     delay={0.05} />
          <MetricCard title="Total reçu"          value={stats ? formatPrice(stats.total_credit, "MAD") : "—"}             icon={ArrowDownRight} iconVariant="green"   delay={0.1}  />
          <MetricCard title="Transactions"        value={stats?.total_transactions || 0}           sub={`${stats?.sent_count || 0} envoyées · ${stats?.received_count || 0} reçues`} icon={History} iconVariant="blue" delay={0.15} />
        </div>

        {/* ── WALLET CARD ── */}
        {selectedWallet && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="teqa-card">
            <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--teqa-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IconBox icon={Wallet} variant="green" size={18} boxSize={40} />
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--teqa-text)", margin: "0 0 2px" }}>{selectedWallet.name}</h2>
                  <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>{formatOwnerType(selectedWallet.owner_type)}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="text-label" style={{ marginBottom: 4 }}>Solde actuel</p>
                <p style={{ fontSize: 26, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--teqa-green)", margin: 0 }}>
                  {formatPrice(selectedWallet.solde, selectedWallet.currency)}
                </p>
              </div>
            </div>
            <div style={{ padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--teqa-surface2)", borderRadius: "0 0 14px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--teqa-muted)" }}>
                <CreditCard size={13} style={{ color: "var(--teqa-muted)" }} />
                {formatOwnerType(selectedWallet.owner_type)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Shield size={13} style={{ color: "var(--teqa-green)" }} />
                <span className={`badge ${selectedWallet.status === "active" ? "badge-green" : "badge-red"}`} style={{ fontSize: 10 }}>
                  {selectedWallet.status === "active" ? "Actif" : "Inactif"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TABS ── */}
        <div style={{ display: "flex", borderBottom: "0.5px solid var(--teqa-border)", gap: 0 }}>
          {[{ key: "overview", label: "Vue d'ensemble", icon: Zap }, { key: "transactions", label: "Transactions", icon: History }, { key: "withdrawals", label: "Retraits", icon: Banknote }].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 16px", fontSize: 13, fontWeight: 500,
                  color: active ? "var(--teqa-green)" : "var(--teqa-muted)",
                  background: "none", border: "none",
                  borderBottom: `2px solid ${active ? "var(--teqa-green)" : "transparent"}`,
                  cursor: "pointer", transition: "all 0.15s",
                  marginBottom: -1,
                }}
              >
                <tab.icon size={14} style={{ color: active ? "var(--teqa-green)" : "var(--teqa-hint)" }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── OVERVIEW TAB ── */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="teqa-card" style={{ overflow: "hidden" }}>
                {/* Card header */}
                <div style={{ padding: "12px 16px", borderBottom: "0.5px solid var(--teqa-border)", display: "flex", alignItems: "center", gap: 8, background: "var(--teqa-surface2)" }}>
                  <IconBox icon={Zap} variant="warning" size={13} boxSize={26} />
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--teqa-text)", margin: 0 }}>Transactions récentes</h3>
                </div>

                {transactions.length === 0 ? (
                  <div style={{ padding: 40, textAlign: "center" }}>
                    <IconBox icon={Receipt} variant="neutral" size={22} boxSize={48} />
                    <p style={{ fontSize: 13, color: "var(--teqa-muted)", marginTop: 12 }}>Aucune transaction</p>
                  </div>
                ) : (
                  transactions.slice(0, 6).map((tx, idx) => (
                    <TransactionRow
                      key={tx.id}
                      transaction={tx}
                      getCounterpartyName={getCounterpartyName}
                      onClick={() => openDetails(tx)}
                      delay={idx * 0.04}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* ── TRANSACTIONS TAB ── */}
          {activeTab === "transactions" && (
            <motion.div key="transactions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {/* Filters */}
              <div className="teqa-card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>

                  {/* Search */}
                  <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--teqa-hint)", pointerEvents: "none" }} />
                    <input
                      type="text"
                      placeholder="Référence, contrepartie…"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="teqa-input"
                      style={{ paddingLeft: 36 }}
                    />
                  </div>

                  {/* Type filter */}
                  <div style={{ position: "relative", minWidth: 160 }}>
                    <Filter size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--teqa-hint)", pointerEvents: "none" }} />
                    <select
                      value={typeFilter}
                      onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                      className="teqa-input"
                      style={{ paddingLeft: 30, cursor: "pointer", appearance: "none" }}
                    >
                      <option value="all">Tous les types</option>
                      {Object.entries(TRANSACTION_TYPE_CONFIG).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status filter */}
                  <div style={{ minWidth: 150 }}>
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                      className="teqa-input"
                      style={{ cursor: "pointer", appearance: "none" }}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="success">Succès</option>
                      <option value="pending">En attente</option>
                      <option value="failed">Échoué</option>
                    </select>
                  </div>

                  <button onClick={fetchData} className="icon-button" title="Actualiser">
                    <RefreshCw size={14} style={{ color: "var(--teqa-muted)" }} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {/* Table */}
              {filteredTransactions.length === 0 ? (
                <div className="teqa-card" style={{ padding: 40, textAlign: "center" }}>
                  <IconBox icon={Receipt} variant="neutral" size={22} boxSize={50} />
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--teqa-text)", margin: "14px 0 6px" }}>Aucune transaction trouvée</p>
                  <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: 0 }}>
                    {searchTerm ? "Aucun résultat pour votre recherche" : "Vos transactions apparaîtront ici"}
                  </p>
                </div>
              ) : (
                <div className="teqa-card data-table-shell" style={{ overflow: "hidden", padding: 0 }}>
                  <div style={{ overflowX: "auto" }}>
                    <table className="teqa-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Montant</th>
                          <th>Contrepartie</th>
                          <th>Référence</th>
                          <th>Statut</th>
                          <th>Date</th>
                          <th style={{ textAlign: "center" }}>—</th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence>
                          {paginatedTransactions.map((tx, idx) => (
                            <motion.tr
                              key={tx.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.02 }}
                              style={{ cursor: "pointer", transition: "background 0.15s" }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "var(--teqa-surface2)"}
                              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                              <td><TransactionTypeCell type={tx.transaction_type} direction={tx.direction} /></td>
                              <td><AmountCell transaction={tx} /></td>
                              <td>
                                <p style={{ fontSize: 13, color: "var(--teqa-text)", margin: "0 0 2px", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {getCounterpartyName(tx)}
                                </p>
                                <p style={{ fontSize: 11, color: "var(--teqa-muted)", margin: 0 }}>{getCounterpartySubtitle(tx)}</p>
                              </td>
                              <td>
                                <code style={{ fontSize: 11, fontFamily: "monospace", color: "var(--teqa-hint)", background: "var(--teqa-surface2)", padding: "2px 6px", borderRadius: 4 }}>
                                  {tx.reference?.slice(0, 16) || "—"}
                                </code>
                              </td>
                              <td><StatusBadge status={tx.status} /></td>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--teqa-muted)" }}>
                                  <Calendar size={11} style={{ color: "var(--teqa-hint)" }} />
                                  {formatDate(tx.created_at)}
                                </div>
                              </td>
                              <td style={{ textAlign: "center" }}>
                                <button
                                  onClick={() => openDetails(tx)}
                                  className="icon-button"
                                  style={{ width: 30, height: 30 }}
                                  title="Voir les détails"
                                >
                                  <Eye size={14} style={{ color: "var(--teqa-muted)" }} />
                                </button>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{
                      padding: "10px 16px",
                      borderTop: "0.5px solid var(--teqa-border)",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      background: "var(--teqa-surface2)",
                    }}>
                      <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} sur {filteredTransactions.length}
                      </p>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="icon-button"
                          style={{ width: 30, height: 30, opacity: currentPage === 1 ? 0.4 : 1 }}
                        >
                          <ChevronLeft size={14} />
                        </button>

                        {/* Pages numérotées */}
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          const page = i + 1;
                          const active = page === currentPage;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              style={{
                                width: 30, height: 30, borderRadius: 8, border: "0.5px solid",
                                borderColor: active ? "var(--teqa-green)" : "var(--teqa-border)",
                                background: active ? "var(--teqa-green-dim)" : "transparent",
                                color: active ? "var(--teqa-green)" : "var(--teqa-muted)",
                                fontSize: 12, fontWeight: active ? 600 : 400,
                                cursor: "pointer", transition: "all 0.15s",
                              }}
                            >
                              {page}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="icon-button"
                          style={{ width: 30, height: 30, opacity: currentPage === totalPages ? 0.4 : 1 }}
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
          {/* ── WITHDRAWALS TAB ── */}
          {activeTab === "withdrawals" && (
            <motion.div key="withdrawals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: 0 }}>
                  {withdrawals.length} demande{withdrawals.length !== 1 ? "s" : ""}
                </p>
                <button onClick={() => setShowWithdrawalModal(true)} className="btn-primary">
                  <Plus size={14} /> Nouveau retrait
                </button>
              </div>

              {withdrawalsLoading ? (
                <TeqaLoader size={0.6} />
              ) : withdrawals.length === 0 ? (
                <div className="teqa-card" style={{ padding: 40, textAlign: "center" }}>
                  <IconBox icon={Banknote} variant="neutral" size={22} boxSize={50} />
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--teqa-text)", margin: "14px 0 6px" }}>Aucune demande de retrait</p>
                  <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: "0 0 20px" }}>Créez votre première demande pour retirer des fonds</p>
                  <button onClick={() => setShowWithdrawalModal(true)} className="btn-primary" style={{ margin: "0 auto" }}>
                    <Plus size={14} /> Nouveau retrait
                  </button>
                </div>
              ) : (
                <div className="teqa-card" style={{ overflow: "hidden", padding: 0 }}>
                  {withdrawals.map((wr, idx) => {
                    const cfg = WITHDRAWAL_STATUS_CONFIG[wr.status] || WITHDRAWAL_STATUS_CONFIG.pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.div
                        key={wr.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "14px 18px",
                          borderBottom: idx < withdrawals.length - 1 ? "0.5px solid var(--teqa-border)" : "none",
                          gap: 12,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <IconBox icon={Banknote} variant={cfg.variant} size={15} boxSize={34} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--teqa-text)", margin: "0 0 2px" }}>
                              {formatPrice(wr.amount, wr.currency || "MAD")}
                            </p>
                            <p style={{ fontSize: 11, color: "var(--teqa-muted)", margin: 0 }}>
                              {PAYOUT_LABELS[wr.payout_method] || wr.payout_method} · {formatDate(wr.created_at)}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className={cfg.badgeClass} style={{ gap: 4 }}>
                            <StatusIcon size={10} />
                            {cfg.label}
                          </span>
                          {wr.status === "pending" && (
                            <button
                              onClick={() => handleCancelWithdrawal(wr.id)}
                              className="icon-button"
                              style={{ width: 28, height: 28 }}
                              title="Annuler"
                            >
                              <X size={13} style={{ color: "var(--teqa-red)" }} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", padding: 16 }}
            onClick={() => setShowWithdrawalModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -16 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "var(--teqa-surface)", border: "0.5px solid var(--teqa-border-md)", borderRadius: 18, width: "100%", maxWidth: 460, overflow: "hidden", boxShadow: "var(--shadow-lg)" }}
            >
              {/* Modal header */}
              <div style={{ borderBottom: "0.5px solid var(--teqa-border)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <IconBox icon={Banknote} variant="green" size={18} boxSize={38} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--teqa-text)", margin: 0 }}>
                    Demande de retrait
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: 0 }}>Solde dispo : {formatPrice(selectedWallet?.solde || 0, "MAD")}</p>
                </div>
                <button onClick={() => setShowWithdrawalModal(false)} className="icon-button" style={{ width: 30, height: 30 }}>
                  <X size={15} style={{ color: "var(--teqa-muted)" }} />
                </button>
              </div>

              <form onSubmit={handleCreateWithdrawal} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Amount */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "var(--teqa-muted)", display: "block", marginBottom: 6 }}>
                    Montant (MAD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={wForm.amount}
                    onChange={(e) => setWForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    className="teqa-input"
                    style={{ width: "100%" }}
                  />
                </div>

                {/* Payout method */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: "var(--teqa-muted)", display: "block", marginBottom: 6 }}>
                    Méthode de paiement
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{ value: "bank_transfer", label: "Virement bancaire", icon: Building2 }, { value: "cash_plus", label: "Cash Plus", icon: Phone }].map(({ value, label, icon: Icon }) => {
                      const selected = wForm.payout_method === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setWForm((f) => ({ ...f, payout_method: value }))}
                          style={{
                            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                            padding: "12px 8px", borderRadius: 10, cursor: "pointer", transition: "all 0.15s",
                            border: `0.5px solid ${selected ? "var(--teqa-green)" : "var(--teqa-border)"}`,
                            background: selected ? "var(--teqa-green-dim)" : "var(--teqa-bg)",
                            color: selected ? "var(--teqa-green)" : "var(--teqa-muted)",
                            fontSize: 12, fontWeight: 500,
                          }}
                        >
                          <Icon size={18} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bank transfer fields */}
                {wForm.payout_method === "bank_transfer" && (
                  <>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--teqa-muted)", display: "block", marginBottom: 6 }}>RIB *</label>
                      <input
                        type="text"
                        value={wForm.rib}
                        onChange={(e) => setWForm((f) => ({ ...f, rib: e.target.value }))}
                        placeholder="24 chiffres RIB"
                        className="teqa-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--teqa-muted)", display: "block", marginBottom: 6 }}>Nom du bénéficiaire *</label>
                      <input
                        type="text"
                        value={wForm.beneficiary_name}
                        onChange={(e) => setWForm((f) => ({ ...f, beneficiary_name: e.target.value }))}
                        placeholder="Nom complet"
                        className="teqa-input"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </>
                )}

                {/* Cash Plus fields */}
                {wForm.payout_method === "cash_plus" && (
                  <>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: "var(--teqa-muted)", display: "block", marginBottom: 6 }}>Nom complet *</label>
                      <input type="text" value={wForm.full_name} onChange={(e) => setWForm((f) => ({ ...f, full_name: e.target.value }))} placeholder="Prénom Nom" className="teqa-input" style={{ width: "100%" }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--teqa-muted)", display: "block", marginBottom: 6 }}>CIN *</label>
                        <input type="text" value={wForm.cin_number} onChange={(e) => setWForm((f) => ({ ...f, cin_number: e.target.value }))} placeholder="CIN" className="teqa-input" style={{ width: "100%" }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 500, color: "var(--teqa-muted)", display: "block", marginBottom: 6 }}>Téléphone *</label>
                        <input type="tel" value={wForm.phone_number} onChange={(e) => setWForm((f) => ({ ...f, phone_number: e.target.value }))} placeholder="+212…" className="teqa-input" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </>
                )}

                {wError && (
                  <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--teqa-red-dim)", border: "0.5px solid rgba(220,38,38,0.3)" }}>
                    <p style={{ fontSize: 12, color: "var(--teqa-red)", margin: 0 }}>{wError}</p>
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                  <button type="button" onClick={() => setShowWithdrawalModal(false)} className="btn-secondary" style={{ flex: 1 }}>
                    Annuler
                  </button>
                  <button type="submit" disabled={wSubmitting} className="btn-primary" style={{ flex: 1 }}>
                    {wSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Soumettre
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CreateWalletModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchData}
        hasExistingWallet={hasExistingWallet}
      />
      <TransactionDetailsModal
        isOpen={showDetailsModal}
        transaction={selectedTransaction}
        onClose={() => { setShowDetailsModal(false); setSelectedTransaction(null); }}
        formatDate={formatFullDate}
        formatPrice={formatPrice}
        renderStatusBadge={(status) => <StatusBadge status={status} />}
        renderTransactionType={(type, dir) => <TransactionTypeCell type={type} direction={dir} />}
        getCounterpartyName={getCounterpartyName}
        getCounterpartySubtitle={getCounterpartySubtitle}
      />
    </div>
  );
};

export default MyWallet;