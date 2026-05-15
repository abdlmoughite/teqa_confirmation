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
  DollarSign,
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
  Download,
  PieChart,
  Shield,
  AlertTriangle,
  Zap
} from "lucide-react";
import { GetWalletSummary, GetMyTransactions, GetTransactionStats } from "../../api/auth";
import CreateWalletModal from "./CreateWalletModal";
import TransactionDetailsModal from "./TransactionDetailsModal";
import { usePublicEntities } from "../../hooks/usePublicEntities";

/* =========================================================
   CONSTANTS
========================================================= */

const TRANSACTION_TYPE_CONFIG = {
  commission_payment: { label: "Commission", icon: TrendingUp, color: "blue", bgColor: "bg-blue-100 dark:bg-blue-500/10" },
  saas_fee: { label: "SaaS Fee", icon: CreditCard, color: "purple", bgColor: "bg-purple-100 dark:bg-purple-500/10" },
  store_debit: { label: "Store Debit", icon: ArrowUpRight, color: "red", bgColor: "bg-red-100 dark:bg-red-500/10" },
  provider_credit: { label: "Provider Credit", icon: ArrowDownRight, color: "green", bgColor: "bg-green-100 dark:bg-green-500/10" },
  deposit: { label: "Deposit", icon: TrendingUp, color: "emerald", bgColor: "bg-emerald-100 dark:bg-emerald-500/10" },
  withdrawal: { label: "Withdrawal", icon: TrendingDown, color: "rose", bgColor: "bg-rose-100 dark:bg-rose-500/10" },
  transfer: { label: "Transfer", icon: ArrowUpRight, color: "gray", bgColor: "bg-gray-100 dark:bg-gray-800" }
};

const TRANSACTION_STATUS_CONFIG = {
  pending: { label: "Pending", color: "amber", icon: Clock, bgColor: "bg-amber-100 dark:bg-amber-500/10", textColor: "text-amber-700 dark:text-amber-400", borderColor: "border-amber-200 dark:border-amber-500/20" },
  success: { label: "Success", color: "emerald", icon: CheckCircle, bgColor: "bg-emerald-100 dark:bg-emerald-500/10", textColor: "text-emerald-700 dark:text-emerald-400", borderColor: "border-emerald-200 dark:border-emerald-500/20" },
  failed: { label: "Failed", color: "rose", icon: XCircle, bgColor: "bg-rose-100 dark:bg-rose-500/10", textColor: "text-rose-700 dark:text-rose-400", borderColor: "border-rose-200 dark:border-rose-500/20" }
};

const ITEMS_PER_PAGE = 10;

const formatOwnerType = (type) => {
  if (!type) return "Wallet account";
  return String(type).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
};

/* =========================================================
   STAT CARD COMPONENT
========================================================= */

const StatCard = ({ title, value, subValue, icon: Icon, gradient }) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -2 }}
    className={`rounded-2xl bg-gradient-to-r ${gradient} p-5 shadow-lg`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-white/70 text-xs uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
        {subValue && <p className="text-white/60 text-xs mt-1">{subValue}</p>}
      </div>
      {Icon && <Icon size={20} className="text-white/50" />}
    </div>
  </motion.div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const MyWallet = () => {
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  /* =========================================================
     FETCH DATA
  ========================================================= */
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [walletSummaryRes, transactionsRes, statsRes] = await Promise.all([
        GetWalletSummary(),
        GetMyTransactions(),
        GetTransactionStats().catch(() => ({ data: null })),
      ]);

      const walletsData = walletSummaryRes.data?.wallets || [];
      
      setWallets(walletsData);
      
      if (walletsData.length > 0 && !selectedWallet) {
        setSelectedWallet(walletsData[0]);
      }

      if (transactionsRes.data?.success) {
        setTransactions(transactionsRes.data.transactions || []);
        setStats({
          ...(statsRes.data?.success ? statsRes.data : {}),
          ...(transactionsRes.data.statistics || {}),
          current_balance: transactionsRes.data.current_balance,
        });
      }
      
    } catch (err) {
      console.warn("Error fetching wallet data:", err);
      setError(err.response?.data?.message || "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const publicEntityRefs = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.counterparty_type && transaction.counterparty_wallet)
        .map((transaction) => ({
          type: transaction.counterparty_type,
          id: transaction.counterparty_wallet,
        })),
    [transactions]
  );

  const { getEntityName, getEntitySubtitle } = usePublicEntities(publicEntityRefs);

  const getCounterpartyName = (transaction) => {
    if (!transaction) return "Counterparty";
    return (
      transaction.counterparty_name ||
      getEntityName(transaction.counterparty_type, transaction.counterparty_wallet, "Counterparty")
    );
  };

  const getCounterpartySubtitle = (transaction) => {
    if (!transaction) return "";
    return (
      getEntitySubtitle(transaction.counterparty_type, transaction.counterparty_wallet, "") ||
      formatOwnerType(transaction.counterparty_type)
    );
  };

  /* =========================================================
     FILTERS & PAGINATION
  ========================================================= */
  const filteredTransactions = transactions.filter(t => {
    const counterpartyName = getCounterpartyName(t);
    const matchesSearch = 
      t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counterpartyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || t.transaction_type === typeFilter;
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* =========================================================
     UTILITIES
  ========================================================= */
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price, currency = "MAD") => {
    return `${parseFloat(price).toLocaleString('en-US')} ${currency}`;
  };

  const renderStatusBadge = (status) => {
    const config = TRANSACTION_STATUS_CONFIG[status] || TRANSACTION_STATUS_CONFIG.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
        <Icon size={12} className={status === "pending" ? "animate-spin" : ""} />
        {config.label}
      </span>
    );
  };

  const renderTransactionType = (type, direction) => {
    const config = TRANSACTION_TYPE_CONFIG[type] || TRANSACTION_TYPE_CONFIG.transfer;
    const Icon = config.icon;
    const isCredit = direction === "RECEIVED";
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${config.bgColor}`}>
          <Icon size={14} className={`text-${config.color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{config.label}</p>
          <p className="text-xs text-gray-500">{isCredit ? "Received" : "Sent"}</p>
        </div>
      </div>
    );
  };

  // Calculate stats
  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.solde), 0);
  const hasExistingWallet = wallets.length > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mb-4"
        >
          <div className="w-full h-full rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-blue-500" />
        </motion.div>
        <p className="text-gray-500 dark:text-gray-400">Loading wallet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-8 text-center">
        <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-300 mb-2">Error</h3>
        <p className="text-rose-700 dark:text-rose-400">{error}</p>
        <button onClick={fetchData} className="mt-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all">
          Try Again
        </button>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="w-full px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center shadow-sm"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
              <Wallet size={40} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Wallet Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Create your first wallet to start managing your funds and track transactions.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Create Your First Wallet
            </button>
          </motion.div>
          
          <CreateWalletModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchData}
            hasExistingWallet={hasExistingWallet}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              My Wallet
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your balance and transactions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={hasExistingWallet}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium shadow-md transition-all ${
              hasExistingWallet 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg'
            }`}
            title={hasExistingWallet ? "Only one wallet allowed per user" : ""}
          >
            <Plus size={16} />
            New Wallet
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard 
            title="Total Balance" 
            value={formatPrice(totalBalance, "MAD")} 
            subValue={`${wallets.length} wallet${wallets.length !== 1 ? 's' : ''} active`}
            icon={Wallet}
            gradient="from-blue-500 to-indigo-600"
          />
          
          <StatCard 
            title="Total Sent" 
            value={stats ? formatPrice(stats.total_debit, "MAD") : "0 MAD"} 
            icon={ArrowUpRight}
            gradient="from-rose-500 to-red-600"
          />
          
          <StatCard 
            title="Total Received" 
            value={stats ? formatPrice(stats.total_credit, "MAD") : "0 MAD"} 
            icon={ArrowDownRight}
            gradient="from-emerald-500 to-green-600"
          />
          
          <StatCard 
            title="Total Transactions" 
            value={stats?.total_transactions || 0} 
            subValue={`${stats?.sent_count || 0} sent • ${stats?.received_count || 0} received`}
            icon={History}
            gradient="from-purple-500 to-pink-600"
          />
        </motion.div>

        {/* Wallet Card */}
        {selectedWallet && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            <div className="p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center">
                      <Wallet size={18} className="text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedWallet.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          {formatOwnerType(selectedWallet.owner_type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Current Balance</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(selectedWallet.solde, selectedWallet.currency)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Currency: {selectedWallet.currency}</p>
                </div>
              </div>
            </div>
            
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">Wallet owner: {formatOwnerType(selectedWallet.owner_type)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-emerald-500" />
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  selectedWallet.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                }`}>
                  {selectedWallet.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 ${
              activeTab === "overview"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 ${
              activeTab === "transactions"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Recent Transactions</h3>
                </div>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.slice(0, 5).map((transaction, idx) => (
                  <motion.div 
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {renderTransactionType(transaction.transaction_type, transaction.direction)}
                      <div>
                        <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className={`font-bold text-lg ${transaction.type === "CREDIT" ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {transaction.type === "CREDIT" ? '+' : '-'}{formatPrice(Math.abs(parseFloat(transaction.amount)), transaction.currency)}
                      </p>
                      {renderStatusBadge(transaction.status)}
                    </div>
                  </motion.div>
                ))}
                {transactions.length === 0 && (
                  <div className="p-8 text-center">
                    <Receipt size={40} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500">No transactions yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <>
            {/* Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm"
            >
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by reference or counterparty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                
                <div className="relative min-w-[160px]">
                  <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All types</option>
                    <option value="commission_payment">Commission</option>
                    <option value="saas_fee">SaaS Fee</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="transfer">Transfer</option>
                  </select>
                  <ChevronLeft size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" />
                </div>
                
                <div className="relative min-w-[160px]">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All statuses</option>
                    <option value="success">Success</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <button
                  onClick={fetchData}
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
            </motion.div>

            {/* Transactions Table */}
            {filteredTransactions.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                    <Receipt size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No transactions found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? "No results for your search" : "Your transactions will appear here"}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
              >
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Counterparty</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      <AnimatePresence>
                        {paginatedTransactions.map((transaction, idx) => (
                          <motion.tr 
                            key={transaction.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                          >
                            <td className="px-4 py-3">
                              {renderTransactionType(transaction.transaction_type, transaction.direction)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-bold ${transaction.type === "CREDIT" ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {transaction.type === "CREDIT" ? '+' : '-'}{formatPrice(Math.abs(parseFloat(transaction.amount)), transaction.currency)}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[150px]">
                                {getCounterpartyName(transaction)}
                              </p>
                              <p className="text-xs text-gray-400">{getCounterpartySubtitle(transaction)}</p>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <code className="text-xs text-gray-500 font-mono">{transaction.reference?.slice(0, 16) || "—"}</code>
                            </td>
                            <td className="px-4 py-3">
                              {renderStatusBadge(transaction.status)}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell">
                              <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setShowDetailsModal(true);
                                }}
                                className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                              >
                                <Eye size={16} />
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
                  <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3 bg-gray-50 dark:bg-gray-800/30">
                    <p className="text-xs text-gray-500">
                      {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} of {filteredTransactions.length}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-all"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium">
                        {currentPage}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-all"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Create Wallet Modal */}
      <CreateWalletModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchData}
        hasExistingWallet={hasExistingWallet}
      />

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={showDetailsModal}
        transaction={selectedTransaction}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTransaction(null);
        }}
        formatDate={formatFullDate}
        formatPrice={formatPrice}
        renderStatusBadge={renderStatusBadge}
        renderTransactionType={renderTransactionType}
        getCounterpartyName={getCounterpartyName}
        getCounterpartySubtitle={getCounterpartySubtitle}
      />
    </div>
  );
};

export default MyWallet;
