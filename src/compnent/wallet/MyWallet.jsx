// MyWallet.jsx
import { useState, useEffect } from "react";
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
  Copy,
  Check,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Receipt,
  History,
  Download,
  PieChart
} from "lucide-react";
import { GetWallets, GetMyTransactions, GetTransactionStats } from "../../api/auth";
import CreateWalletModal from "./CreateWalletModal";
import TransactionDetailsModal from "./TransactionDetailsModal";

/* =========================================================
   CONSTANTS
========================================================= */

const TRANSACTION_TYPE_CONFIG = {
  commission_payment: { label: "Commission", icon: TrendingUp, color: "blue", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  saas_fee: { label: "Frais SaaS", icon: CreditCard, color: "purple", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  store_debit: { label: "Débit Store", icon: ArrowUpRight, color: "red", bgColor: "bg-red-100 dark:bg-red-900/30" },
  provider_credit: { label: "Crédit Provider", icon: ArrowDownRight, color: "green", bgColor: "bg-green-100 dark:bg-green-900/30" },
  deposit: { label: "Dépôt", icon: TrendingUp, color: "green", bgColor: "bg-green-100 dark:bg-green-900/30" },
  withdrawal: { label: "Retrait", icon: TrendingDown, color: "red", bgColor: "bg-red-100 dark:bg-red-900/30" },
  transfer: { label: "Transfert", icon: ArrowUpRight, color: "gray", bgColor: "bg-gray-100 dark:bg-gray-800" }
};

const TRANSACTION_STATUS_CONFIG = {
  pending: { label: "En attente", color: "yellow", icon: Clock, bgColor: "bg-yellow-100 dark:bg-yellow-900/30", textColor: "text-yellow-700 dark:text-yellow-400" },
  success: { label: "Succès", color: "green", icon: CheckCircle, bgColor: "bg-green-100 dark:bg-green-900/30", textColor: "text-green-700 dark:text-green-400" },
  failed: { label: "Échoué", color: "red", icon: XCircle, bgColor: "bg-red-100 dark:bg-red-900/30", textColor: "text-red-700 dark:text-red-400" }
};

const ITEMS_PER_PAGE = 10;

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
  const [copied, setCopied] = useState(false);
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
      // Fetch wallets
      const walletsRes = await GetWallets();
      let walletsData = [];
      if (walletsRes.data?.results) {
        walletsData = walletsRes.data.results;
      } else if (Array.isArray(walletsRes.data)) {
        walletsData = walletsRes.data;
      }
      
      setWallets(walletsData);
      
      if (walletsData.length > 0 && !selectedWallet) {
        setSelectedWallet(walletsData[0]);
      }
      
      // Fetch transactions
      if (walletsData.length > 0) {
        const transactionsRes = await GetMyTransactions();
        if (transactionsRes.data?.success) {
          setTransactions(transactionsRes.data.transactions || []);
          setStats(transactionsRes.data.statistics);
        }
      }
      
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError(err.response?.data?.message || "Impossible de charger les données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* =========================================================
     FILTERS & PAGINATION
  ========================================================= */
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.counterparty_name?.toLowerCase().includes(searchTerm.toLowerCase());
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
      
      if (diffDays === 0) return "Aujourd'hui";
      if (diffDays === 1) return "Hier";
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price, currency = "MAD") => {
    return `${parseFloat(price).toLocaleString('fr-FR')} ${currency}`;
  };

  const formatFullDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Intl.DateTimeFormat('fr-FR', {
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

  const renderStatusBadge = (status) => {
    const config = TRANSACTION_STATUS_CONFIG[status] || TRANSACTION_STATUS_CONFIG.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon size={12} />
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
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.bgColor}`}>
          <Icon size={14} className={`text-${config.color}-600`} />
        </div>
        <div>
          <p className="text-sm font-medium">{config.label}</p>
          <p className="text-xs text-gray-400">{isCredit ? "Réception" : "Envoi"}</p>
        </div>
      </div>
    );
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate stats
  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.solde), 0);
  const activeWallets = wallets.filter(w => w.status === "active").length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Erreur</h3>
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">Réessayer</button>
      </div>
    );
  }

  if (wallets.length === 0) {
    return (
      <div className="w-full px-[30px] py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Wallet size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Aucun Wallet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Vous n'avez pas encore de wallet. Créez-en un pour commencer.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
            >
              <Plus size={18} />
              Créer un Wallet
            </button>
          </div>
          
          <CreateWalletModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={fetchData}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-[30px] py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mon Portefeuille</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gérez votre solde et vos transactions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
          >
            <Plus size={16} />
            Nouveau Wallet
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-white/80 text-sm">Solde Total</p>
            <p className="text-2xl sm:text-3xl font-bold mt-1 break-words">{formatPrice(totalBalance, "MAD")}</p>
            <p className="text-white/60 text-xs mt-2">{activeWallets} wallet{activeWallets !== 1 ? 's' : ''} actif{activeWallets !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <ArrowUpRight size={16} className="text-red-500" />
              <span className="text-sm">Total Envoyé</span>
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white break-words">
              {stats ? formatPrice(stats.total_debit, "MAD") : "0 MAD"}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <ArrowDownRight size={16} className="text-green-500" />
              <span className="text-sm">Total Reçu</span>
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white break-words">
              {stats ? formatPrice(stats.total_credit, "MAD") : "0 MAD"}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <History size={16} className="text-purple-500" />
              <span className="text-sm">Total Transactions</span>
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{stats?.total_transactions || 0}</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats?.sent_count || 0} envois • {stats?.received_count || 0} réceptions
            </p>
          </div>
        </div>

        {/* Wallet Selector */}
        {wallets.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {wallets.map(wallet => (
              <button
                key={wallet.id}
                onClick={() => setSelectedWallet(wallet)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                  selectedWallet?.id === wallet.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {wallet.name}
              </button>
            ))}
          </div>
        )}

        {/* Selected Wallet Card */}
        {selectedWallet && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{selectedWallet.name}</h2>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-gray-400">N° Wallet:</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded break-all">
                      {selectedWallet.num_wallet}
                    </code>
                    <button 
                      onClick={() => copyToClipboard(selectedWallet.num_wallet)} 
                      className="text-gray-400 hover:text-blue-500 transition"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-500">Solde actuel</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(selectedWallet.solde, selectedWallet.currency)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-gray-400" />
                  <span className="text-gray-500">Devise: {selectedWallet.currency}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    selectedWallet.status === 'active' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {selectedWallet.status === 'active' ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "overview"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Aperçu
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 whitespace-nowrap ${
              activeTab === "transactions"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Transactions
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-800 dark:text-white">Dernières transactions</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {transactions.slice(0, 5).map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {renderTransactionType(transaction.transaction_type, transaction.direction)}
                      <div>
                        <p className="text-sm text-gray-500">{formatDate(transaction.created_at)}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className={`font-semibold ${transaction.type === "CREDIT" ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === "CREDIT" ? '+' : '-'}{formatPrice(Math.abs(parseFloat(transaction.amount)), transaction.currency)}
                      </p>
                      {renderStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <Receipt size={32} className="mx-auto mb-2 text-gray-300" />
                    <p>Aucune transaction pour le moment</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === "transactions" && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par référence ou contrepartie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="commission_payment">Commission</option>
                <option value="saas_fee">Frais SaaS</option>
                <option value="deposit">Dépôt</option>
                <option value="withdrawal">Retrait</option>
                <option value="transfer">Transfert</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="success">Succès</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoué</option>
              </select>
              
              <button
                onClick={fetchData}
                className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Transactions Table */}
            {filteredTransactions.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Aucune transaction</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? "Aucun résultat pour votre recherche" : "Vos transactions apparaîtront ici"}
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Montant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">Contrepartie</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden lg:table-cell">Référence</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Date</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Détails</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {paginatedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                          <td className="px-4 py-3">
                            {renderTransactionType(transaction.transaction_type, transaction.direction)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`font-semibold ${transaction.type === "CREDIT" ? 'text-green-600' : 'text-red-600'}`}>
                              {transaction.type === "CREDIT" ? '+' : '-'}{formatPrice(Math.abs(parseFloat(transaction.amount)), transaction.currency)}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">
                              {transaction.counterparty_name || transaction.counterparty_wallet?.slice(0, 12) || "—"}
                            </p>
                            <p className="text-xs text-gray-400 font-mono">{transaction.counterparty_type || ""}</p>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <code className="text-xs text-gray-500">{transaction.reference?.slice(0, 16) || "—"}</code>
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
                              className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-xs text-gray-500">
                      {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} sur {filteredTransactions.length}
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border disabled:opacity-50"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm">{currentPage}</span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border disabled:opacity-50"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Refresh Button */}
        <div className="flex justify-end">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Create Wallet Modal */}
      <CreateWalletModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={fetchData}
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
      />
    </div>
  );
};

export default MyWallet;