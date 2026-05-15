// MyCommissions.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Wallet,
  AlertTriangle,
  Info,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { GetCommissions, GetPaymentAttempts } from "../../api/auth";

/* =========================================================
   CONSTANTS
========================================================= */

const COMMISSION_STATUS_CONFIG = {
  pending_payment: { 
    label: "Pending Payment", 
    icon: Clock,
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    textColor: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-500/20",
    gradient: "from-amber-500 to-orange-500"
  },
  processing_payment: { 
    label: "Processing", 
    icon: RefreshCw,
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    textColor: "text-blue-700 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-500/20",
    gradient: "from-blue-500 to-indigo-500"
  },
  paid: { 
    label: "Paid", 
    icon: CheckCircle,
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    textColor: "text-emerald-700 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-500/20",
    gradient: "from-emerald-500 to-green-500"
  },
  payment_failed: { 
    label: "Payment Failed", 
    icon: XCircle,
    bgColor: "bg-rose-50 dark:bg-rose-500/10",
    textColor: "text-rose-700 dark:text-rose-400",
    borderColor: "border-rose-200 dark:border-rose-500/20",
    gradient: "from-rose-500 to-red-500"
  },
  cancelled: { 
    label: "Cancelled", 
    icon: XCircle,
    bgColor: "bg-slate-100 dark:bg-slate-800",
    textColor: "text-slate-600 dark:text-slate-400",
    borderColor: "border-slate-200 dark:border-slate-700",
    gradient: "from-slate-500 to-gray-500"
  }
};

const ITEMS_PER_PAGE = 10;

/* =========================================================
   TOAST COMPONENT
========================================================= */

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    success: { icon: CheckCircle, gradient: "from-emerald-500 to-green-500" },
    error: { icon: AlertCircle, gradient: "from-rose-500 to-red-500" },
    info: { icon: Info, gradient: "from-blue-500 to-indigo-500" }
  };
  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 50, y: -20 }}
      className="fixed top-20 right-4 z-50"
    >
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${config.gradient}`}>
          <Icon size={16} className="text-white" />
        </div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{message}</p>
      </div>
    </motion.div>
  );
};

/* =========================================================
   STAT CARD COMPONENT
========================================================= */

const StatCard = ({ title, value, subValue, icon: Icon, gradient, trend }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    className={`rounded-2xl bg-gradient-to-r ${gradient} p-5 shadow-lg`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-white/70 text-xs uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
        {subValue && <p className="text-white/60 text-xs mt-1">{subValue}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <ArrowUpRight size={12} className="text-white/80" />
            ) : (
              <ArrowDownRight size={12} className="text-white/80" />
            )}
            <span className="text-xs text-white/80">{trend}</span>
          </div>
        )}
      </div>
      {Icon && (
        <div className="p-2 rounded-xl bg-white/10">
          <Icon size={20} className="text-white/80" />
        </div>
      )}
    </div>
  </motion.div>
);

/* =========================================================
   STATUS BADGE COMPONENT
========================================================= */

const StatusBadge = ({ status }) => {
  const config = COMMISSION_STATUS_CONFIG[status] || COMMISSION_STATUS_CONFIG.pending_payment;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <Icon size={12} className={status === "processing_payment" ? "animate-spin" : ""} />
      {config.label}
    </span>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const MyCommissions = () => {
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
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

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
      showToast("Commissions refreshed", "success");
    } catch (err) {
      console.warn("Error fetching commissions:", err);
      setError(err.response?.data?.message || "Failed to load commissions");
      showToast(err.response?.data?.message || "Failed to load commissions", "error");
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
      console.warn("Error fetching payment attempts:", err);
      setPaymentAttempts([]);
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

  const formatPrice = (price, currency = "MAD") => {
    return `${parseFloat(price).toLocaleString()} ${currency}`;
  };

  const openDetails = async (commission) => {
    setSelectedCommission(commission);
    await fetchPaymentAttempts(commission.id);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mb-4"
        >
          <div className="w-full h-full rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-blue-500 dark:border-t-blue-400" />
        </motion.div>
        <p className="text-gray-500 dark:text-gray-400">Loading commissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-8 text-center">
        <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-300 mb-2">Error</h3>
        <p className="text-rose-700 dark:text-rose-400">{error}</p>
        <button 
          onClick={fetchCommissions} 
          className="mt-4 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          My Commissions
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Track your earnings and commission payments
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <StatCard 
          title="Total Earned"
          value={formatPrice(stats.totalEarned, "MAD")}
          subValue={`${stats.paid} paid commissions`}
          icon={Wallet}
          gradient="from-blue-500 to-indigo-600"
          trend="+12%"
        />
        
        <StatCard 
          title="Pending"
          value={stats.pending}
          subValue={formatPrice(stats.pendingAmount, "MAD")}
          icon={Clock}
          gradient="from-amber-500 to-orange-600"
          trend="-3%"
        />
        
        <StatCard 
          title="Paid"
          value={stats.paid}
          icon={CheckCircle}
          gradient="from-emerald-500 to-green-600"
          trend="+8%"
        />
        
        <StatCard 
          title="Failed"
          value={stats.failed}
          icon={XCircle}
          gradient="from-rose-500 to-red-600"
        />
        
        <StatCard 
          title="Total Commissions"
          value={stats.total}
          icon={FileText}
          gradient="from-purple-500 to-pink-600"
        />
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID or offer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        
        <div className="relative min-w-[200px]">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="processing_payment">Processing</option>
            <option value="paid">Paid</option>
            <option value="payment_failed">Payment Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ChevronLeft size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchCommissions}
          className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </motion.button>
      </motion.div>

      {/* Commissions Table */}
      {filteredCommissions.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
              <TrendingUp size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No commissions found</h3>
            <p className="text-gray-500 dark:text-gray-400">When you complete collaborations, commissions will appear here</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Commission</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <AnimatePresence>
                  {paginatedCommissions.map((commission, idx) => (
                    <motion.tr 
                      key={commission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                    >
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {commission.order_reference || (commission.order_id ? "Linked order" : "—")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[150px]">
                          {commission.collaboration?.offer?.titre || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(commission.commission_total, commission.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {formatPrice(commission.commission_provider, commission.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={commission.status} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-gray-500">{formatDate(commission.created_at)}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openDetails(commission)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                          title="View details"
                        >
                          <Eye size={16} />
                        </motion.button>
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
                {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredCommissions.length)} of {filteredCommissions.length}
              </p>
              <div className="flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </motion.button>
                <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium">
                  {currentPage}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={14} />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Commission Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedCommission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
            >
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                
                {/* Header */}
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${COMMISSION_STATUS_CONFIG[selectedCommission.status]?.bgColor}`}>
                      {selectedCommission.status === "paid" ? <CheckCircle size={20} className="text-emerald-600" /> :
                       selectedCommission.status === "pending_payment" ? <Clock size={20} className="text-amber-600" /> :
                       selectedCommission.status === "payment_failed" ? <AlertTriangle size={20} className="text-rose-600" /> :
                       <TrendingUp size={20} className="text-blue-600" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Commission Details</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedCommission.order_reference || (selectedCommission.order_id ? "Linked order" : "No linked order")}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDetailsModal(false)} 
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <XCircle size={18} className="text-gray-500" />
                  </button>
                </div>
                
                {/* Body */}
                <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
                  {/* Offer Info */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-100 dark:border-blue-500/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Offer</p>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                      {selectedCommission.collaboration?.offer?.titre || "—"}
                    </p>
                  </div>
                  
                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        {formatPrice(selectedCommission.commission_total, selectedCommission.currency)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Your Commission</p>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                        {formatPrice(selectedCommission.commission_provider, selectedCommission.currency)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400">SaaS Fee</p>
                      <p className="text-md font-medium text-gray-700 dark:text-gray-300 mt-1">
                        {formatPrice(selectedCommission.commission_saas, selectedCommission.currency)}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Store Final</p>
                      <p className="text-md font-medium text-gray-700 dark:text-gray-300 mt-1">
                        {formatPrice(selectedCommission.commission_final_store, selectedCommission.currency)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status & Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <div className="mt-1">
                        <StatusBadge status={selectedCommission.status} />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                        {formatDate(selectedCommission.created_at)}
                      </p>
                    </div>
                    {selectedCommission.paid_at && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 col-span-2">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">Paid At</p>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mt-1">
                          {formatDate(selectedCommission.paid_at)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Payment Attempts Preview */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-yellow-500" />
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Attempts</p>
                      </div>
                      <button
                        onClick={() => setShowAttemptsModal(true)}
                        className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                      >
                        View All ({paymentAttempts.length})
                      </button>
                    </div>
                    <div className="space-y-2">
                      {paymentAttempts.slice(0, 3).map((attempt, idx) => (
                        <div key={attempt.id} className={`p-3 rounded-xl ${attempt.status === "success" ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20'}`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {attempt.status === "success" ? (
                                <CheckCircle size={14} className="text-emerald-600" />
                              ) : (
                                <XCircle size={14} className="text-rose-600" />
                              )}
                              <span className="text-xs font-medium">
                                Attempt #{idx + 1}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(attempt.attempted_at)}</span>
                          </div>
                          {attempt.error_message && (
                            <p className="text-xs text-rose-600 mt-2">{attempt.error_message}</p>
                          )}
                          <div className="flex justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <span>Required: {formatPrice(attempt.required_amount)}</span>
                            {attempt.available_balance && (
                              <span>Available: {formatPrice(attempt.available_balance)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {paymentAttempts.length === 0 && (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No payment attempts recorded
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setShowAttemptsModal(true);
                    }}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
                  >
                    View All Attempts
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Attempts Modal */}
      <AnimatePresence>
        {showAttemptsModal && selectedCommission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAttemptsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            >
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                      <Clock size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Payment History</h3>
                      <p className="text-xs text-gray-500">
                        {selectedCommission.order_reference || (selectedCommission.order_id ? "Linked order" : "Commission")}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowAttemptsModal(false)} 
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <XCircle size={18} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="p-5 overflow-y-auto max-h-[60vh]">
                  {loadingAttempts ? (
                    <div className="flex justify-center py-8">
                      <Loader2 size={24} className="animate-spin text-blue-500" />
                    </div>
                  ) : paymentAttempts.length === 0 ? (
                    <div className="text-center py-8">
                      <Info size={48} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500">No payment attempts recorded</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentAttempts.map((attempt, idx) => (
                        <motion.div
                          key={attempt.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`p-4 rounded-xl border ${attempt.status === "success" 
                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-500/10' 
                            : 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-500/10'}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              {attempt.status === "success" ? (
                                <CheckCircle size={18} className="text-emerald-600" />
                              ) : (
                                <XCircle size={18} className="text-rose-600" />
                              )}
                              <span className="font-semibold text-gray-800 dark:text-white">Attempt #{idx + 1}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                attempt.status === "success" 
                                  ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-300' 
                                  : 'bg-rose-200 text-rose-800 dark:bg-rose-500/30 dark:text-rose-300'
                              }`}>
                                {attempt.status === "success" ? "Success" : "Failed"}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{formatDate(attempt.attempted_at)}</span>
                          </div>
                          
                          {attempt.error_code && (
                            <div className="mb-3 p-2 rounded-lg bg-rose-100 dark:bg-rose-500/20">
                              <span className="text-xs font-medium text-rose-700 dark:text-rose-400">Error: {attempt.error_code}</span>
                              {attempt.error_message && (
                                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{attempt.error_message}</p>
                              )}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-3 text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div>
                              <span className="text-xs text-gray-500">Required Amount:</span>
                              <p className="font-semibold text-gray-800 dark:text-white mt-1">
                                {formatPrice(attempt.required_amount)}
                              </p>
                            </div>
                            {attempt.available_balance && (
                              <div>
                                <span className="text-xs text-gray-500">Available Balance:</span>
                                <p className="font-semibold text-gray-800 dark:text-white mt-1">
                                  {formatPrice(attempt.available_balance)}
                                </p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                  <button
                    onClick={() => setShowAttemptsModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyCommissions;
