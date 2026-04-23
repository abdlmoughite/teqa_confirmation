// AgencyCommissions.jsx
import { useState, useEffect } from "react";
import {
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  Info,
  Wallet,
  Receipt
} from "lucide-react";
import { GetCommissions, GetPaymentAttempts } from "../../api/auth";

/* =========================================================
   CONSTANTS
========================================================= */

const COMMISSION_STATUS_CONFIG = {
  pending_payment: { 
    label: "En attente", 
    color: "yellow", 
    icon: Clock,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-700 dark:text-yellow-400"
  },
  processing_payment: { 
    label: "En traitement", 
    color: "blue", 
    icon: RefreshCw,
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-700 dark:text-blue-400"
  },
  paid: { 
    label: "Payé", 
    color: "green", 
    icon: CheckCircle,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-400"
  },
  payment_failed: { 
    label: "Échoué", 
    color: "red", 
    icon: XCircle,
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-700 dark:text-red-400"
  },
  cancelled: { 
    label: "Annulé", 
    color: "gray", 
    icon: XCircle,
    bgColor: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-600 dark:text-gray-400"
  }
};

const ITEMS_PER_PAGE = 10;

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AgencyCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [paymentAttempts, setPaymentAttempts] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAttemptsModal, setShowAttemptsModal] = useState(false);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  /* =========================================================
     FETCH DATA
  ========================================================= */
  const fetchCommissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      const response = await GetCommissions(params);
      let commissionsData = [];
      if (response.data?.results) {
        commissionsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        commissionsData = response.data;
      }
      setCommissions(commissionsData);
      
    } catch (err) {
      console.error("Error fetching commissions:", err);
      setError(err.response?.data?.message || "Impossible de charger les commissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [statusFilter]);

  /* =========================================================
     FETCH PAYMENT ATTEMPTS
  ========================================================= */
  const fetchPaymentAttempts = async (commissionId) => {
    setLoadingAttempts(true);
    try {
      const response = await GetPaymentAttempts(commissionId);
      let attemptsData = [];
      if (response.data?.results) {
        attemptsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        attemptsData = response.data;
      }
      setPaymentAttempts(attemptsData);
    } catch (err) {
      console.error("Error fetching payment attempts:", err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  /* =========================================================
     FILTERS & PAGINATION
  ========================================================= */
  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = 
      commission.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.collaboration?.offer?.titre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredCommissions.length / ITEMS_PER_PAGE);
  const paginatedCommissions = filteredCommissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* =========================================================
     STATS
  ========================================================= */
  const stats = {
    total: commissions.length,
    pending: commissions.filter(c => c.status === "pending_payment").length,
    paid: commissions.filter(c => c.status === "paid").length,
    failed: commissions.filter(c => c.status === "payment_failed").length,
    totalEarned: commissions.filter(c => c.status === "paid").reduce((sum, c) => sum + parseFloat(c.commission_provider), 0),
    pendingAmount: commissions.filter(c => c.status === "pending_payment").reduce((sum, c) => sum + parseFloat(c.commission_provider), 0)
  };

  /* =========================================================
     UTILITIES
  ========================================================= */
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
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

  const renderStatusBadge = (status) => {
    const config = COMMISSION_STATUS_CONFIG[status] || COMMISSION_STATUS_CONFIG.pending_payment;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const openDetails = async (commission) => {
    setSelectedCommission(commission);
    await fetchPaymentAttempts(commission.id);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Chargement des commissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Erreur</h3>
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button onClick={fetchCommissions} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mes Commissions</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Suivez vos gains et paiements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-white/80 text-sm">Total gagné</p>
          <p className="text-2xl font-bold mt-1">{formatPrice(stats.totalEarned, "MAD")}</p>
          <p className="text-white/60 text-xs mt-1">{stats.paid} commissions payées</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <Clock size={16} className="text-yellow-500" />
            <span className="text-sm">En attente</span>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.pending}</p>
          <p className="text-xs text-gray-400 mt-1">{formatPrice(stats.pendingAmount, "MAD")} en attente</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm">Payées</span>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.paid}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <XCircle size={16} className="text-red-500" />
            <span className="text-sm">Échouées</span>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.failed}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
            <FileText size={16} className="text-purple-500" />
            <span className="text-sm">Total commissions</span>
          </div>
          <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par commande ou offre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending_payment">En attente</option>
          <option value="processing_payment">En traitement</option>
          <option value="paid">Payé</option>
          <option value="payment_failed">Échoué</option>
        </select>
        
        <button
          onClick={fetchCommissions}
          className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Commissions Table */}
      {filteredCommissions.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Aucune commission trouvée</h3>
          <p className="text-gray-500 dark:text-gray-400">Les commissions apparaîtront ici après vos collaborations</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Commande</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Offre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Montant total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Votre commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono">{commission.order_id?.slice(0, 8)}...</code>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[150px]">
                        {commission.collaboration?.offer?.titre || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold">{formatPrice(commission.commission_total, commission.currency)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-green-600">{formatPrice(commission.commission_provider, commission.currency)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {renderStatusBadge(commission.status)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-gray-500">{formatDate(commission.created_at)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openDetails(commission)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                        title="Voir les détails"
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
                {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredCommissions.length)} sur {filteredCommissions.length}
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

      {/* Commission Details Modal */}
      {showDetailsModal && selectedCommission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Wallet size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Détails de la commission</h3>
                  <p className="text-xs text-gray-500">Commande: {selectedCommission.order_id?.slice(0, 8)}...</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
              {/* Offer Info */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Offre</p>
                <p className="font-medium">{selectedCommission.collaboration?.offer?.titre || "—"}</p>
              </div>
              
              {/* Amounts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Montant total</p>
                  <p className="text-lg font-bold">{formatPrice(selectedCommission.commission_total, selectedCommission.currency)}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400 mb-1">Votre commission</p>
                  <p className="text-lg font-bold text-green-600">{formatPrice(selectedCommission.commission_provider, selectedCommission.currency)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Frais SaaS</p>
                  <p className="text-md">{formatPrice(selectedCommission.commission_saas, selectedCommission.currency)}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Montant final store</p>
                  <p className="text-md">{formatPrice(selectedCommission.commission_final_store, selectedCommission.currency)}</p>
                </div>
              </div>
              
              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Statut</p>
                  {renderStatusBadge(selectedCommission.status)}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Date de création</p>
                  <p className="text-sm">{formatDate(selectedCommission.created_at)}</p>
                </div>
                {selectedCommission.paid_at && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg col-span-2">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Date de paiement</p>
                    <p className="text-sm">{formatDate(selectedCommission.paid_at)}</p>
                  </div>
                )}
              </div>
              
              {/* Payment Attempts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tentatives de paiement</p>
                  <button
                    onClick={() => setShowAttemptsModal(true)}
                    className="text-xs text-blue-500 hover:text-blue-600"
                  >
                    Voir tout ({paymentAttempts.length})
                  </button>
                </div>
                <div className="space-y-2">
                  {paymentAttempts.slice(0, 3).map((attempt, idx) => (
                    <div key={attempt.id} className={`p-2 rounded-lg ${attempt.status === "success" ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          {attempt.status === "success" ? (
                            <CheckCircle size={12} className="text-green-600" />
                          ) : (
                            <XCircle size={12} className="text-red-600" />
                          )}
                          <span className="text-xs font-medium">
                            Tentative #{idx + 1}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(attempt.attempted_at)}</span>
                      </div>
                      {attempt.error_message && (
                        <p className="text-xs text-red-600 mt-1">{attempt.error_message}</p>
                      )}
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Requis: {formatPrice(attempt.required_amount)}</span>
                        {attempt.available_balance && (
                          <span>Disponible: {formatPrice(attempt.available_balance)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {paymentAttempts.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">Aucune tentative enregistrée</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowAttemptsModal(true);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Voir toutes les tentatives
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Attempts Modal */}
      {showAttemptsModal && selectedCommission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Clock size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Historique des paiements</h3>
                  <p className="text-xs text-gray-500">Commission: {selectedCommission.order_id?.slice(0, 8)}...</p>
                </div>
              </div>
              <button onClick={() => setShowAttemptsModal(false)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {loadingAttempts ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-500" /></div>
              ) : paymentAttempts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Info size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>Aucune tentative de paiement enregistrée</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentAttempts.map((attempt, idx) => (
                    <div key={attempt.id} className={`p-3 rounded-lg border ${attempt.status === "success" ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {attempt.status === "success" ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : (
                            <XCircle size={16} className="text-red-600" />
                          )}
                          <span className="font-medium">Tentative #{idx + 1}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${attempt.status === "success" ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {attempt.status === "success" ? "Succès" : "Échec"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{formatDate(attempt.attempted_at)}</span>
                      </div>
                      
                      {attempt.error_code && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-red-600">Erreur: {attempt.error_code}</span>
                          {attempt.error_message && (
                            <p className="text-xs text-red-600 mt-1">{attempt.error_message}</p>
                          )}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <span className="text-gray-500">Montant requis:</span>
                          <p className="font-medium">{formatPrice(attempt.required_amount)}</p>
                        </div>
                        {attempt.available_balance && (
                          <div>
                            <span className="text-gray-500">Solde disponible:</span>
                            <p className="font-medium">{formatPrice(attempt.available_balance)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setShowAttemptsModal(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyCommissions;