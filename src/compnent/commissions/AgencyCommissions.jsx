import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Wallet2,
  XCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  Zap,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  User,
  Building2
} from "lucide-react";
import { GetCommissionStats, GetCommissions, GetPaymentAttempts } from "../../api/auth";

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_META = {
  pending_payment: {
    label: "Pending payment",
    icon: Clock3,
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
    gradient: "from-amber-500 to-orange-500"
  },
  processing_payment: {
    label: "Processing",
    icon: RefreshCw,
    chip: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
    gradient: "from-blue-500 to-indigo-500"
  },
  paid: {
    label: "Paid",
    icon: CheckCircle2,
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
    gradient: "from-emerald-500 to-green-500"
  },
  payment_failed: {
    label: "Payment failed",
    icon: XCircle,
    chip: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20",
    gradient: "from-rose-500 to-red-500"
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    chip: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
    gradient: "from-slate-500 to-gray-500"
  },
};

const ITEMS_PER_PAGE = 10;

/* =========================================================
   UTILITY FUNCTIONS
========================================================= */

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const formatMoney = (value, currency = "MAD") =>
  `${Number.parseFloat(value || 0).toLocaleString("fr-FR")} ${currency}`;

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/* =========================================================
   COMPONENTS
========================================================= */

const StatusChip = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.pending_payment;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.chip}`}>
      <Icon size={12} className={status === "processing_payment" ? "animate-spin" : ""} />
      {meta.label}
    </span>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, trend, trendValue }) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -2 }}
    className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {sub && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{sub}</p>}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <ArrowUpRight size={12} className="text-emerald-500" />
            ) : (
              <ArrowDownRight size={12} className="text-rose-500" />
            )}
            <span className={`text-xs ${trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      {Icon && (
        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
          <Icon size={20} className="text-blue-500" />
        </div>
      )}
    </div>
  </motion.div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    success: { icon: CheckCircle2, gradient: "from-emerald-500 to-green-500" },
    error: { icon: AlertCircle, gradient: "from-rose-500 to-red-500" }
  };
  const config = typeConfig[type];
  const Icon = config?.icon || CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 50, y: -20 }}
      className="fixed top-20 right-4 z-50"
    >
      <div className={`flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-900 border shadow-xl border-gray-200 dark:border-gray-800`}>
        <div className={`p-1 rounded-lg bg-gradient-to-r ${config?.gradient}`}>
          <Icon size={14} className="text-white" />
        </div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{message}</p>
      </div>
    </motion.div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AgencyCommissions = () => {
  const [commissions, setCommissions] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [activeCommission, setActiveCommission] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const fetchData = async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;

      const [commRes, statsRes] = await Promise.allSettled([
        GetCommissions(params),
        GetCommissionStats(),
      ]);

      if (commRes.status !== "fulfilled") {
        throw commRes.reason;
      }

      const commRaw = toArray(commRes.value?.data || commRes.value);
      setCommissions(commRaw);

      if (statsRes.status === "fulfilled" && statsRes.value?.data?.success) {
        setStatsData(statsRes.value.data);
      } else {
        setStatsData(null);
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data?.message || "Impossible de charger les commissions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  // Filter commissions
  const filteredCommissions = useMemo(() => {
    let filtered = [...commissions];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(commission => 
        commission.order_id?.toLowerCase().includes(q) ||
        commission.collaboration?.offer?.titre?.toLowerCase().includes(q) ||
        commission.provider_type?.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [commissions, searchTerm]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCommissions.length / ITEMS_PER_PAGE));
  const paginatedCommissions = filteredCommissions.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  // Stats calculation
  const stats = useMemo(() => {
    const paid = commissions.filter((c) => c.status === "paid");
    const pending = commissions.filter((c) => c.status === "pending_payment");
    const failed = commissions.filter((c) => c.status === "payment_failed");

    return {
      count: commissions.length,
      paidCount: paid.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      paidAmount: paid.reduce((sum, c) => sum + Number.parseFloat(c.commission_provider || 0), 0),
      pendingAmount: pending.reduce((sum, c) => sum + Number.parseFloat(c.commission_provider || 0), 0),
      totalAmount: commissions.reduce((sum, c) => sum + Number.parseFloat(c.commission_provider || 0), 0),
    };
  }, [commissions]);

  const openCommissionDetails = async (commission) => {
    setActiveCommission(commission);
    setOpenModal(true);
    setAttemptsLoading(true);
    setAttempts([]);

    try {
      const response = await GetPaymentAttempts(commission.id);
      setAttempts(toArray(response?.data || response));
    } catch {
      setAttempts([]);
    } finally {
      setAttemptsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="w-full h-full rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-blue-500 dark:border-t-blue-400" />
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400">Loading commissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Commissions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage and track all your commission earnings
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchData({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard 
            label="Total Commissions" 
            value={formatMoney(stats.totalAmount)} 
            sub={`${stats.count} total`}
            icon={Wallet2}
          />
          <StatCard 
            label="Available" 
            value={formatMoney(stats.paidAmount)} 
            sub={`${stats.paidCount} paid`}
            icon={CheckCircle2}
            trend="up"
            trendValue="+12%"
          />
          <StatCard 
            label="Pending" 
            value={formatMoney(stats.pendingAmount)} 
            sub={`${stats.pendingCount} awaiting`}
            icon={Clock3}
            trend="down"
            trendValue="-3%"
          />
          <StatCard 
            label="Failed" 
            value={`${stats.failedCount}`} 
            sub="Payment failed"
            icon={XCircle}
          />
        </motion.div>

        {/* Filters Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by order ID, offer title or provider..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative min-w-[200px]">
              <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">All statuses</option>
                <option value="pending_payment">Pending payment</option>
                <option value="processing_payment">Processing</option>
                <option value="paid">Paid</option>
                <option value="payment_failed">Payment failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-4"
            >
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Commissions List - Simple Table */}
        {filteredCommissions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center shadow-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                <Wallet2 size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No commissions found for this filter.</p>
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
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Offer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Date</th>
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
                        transition={{ delay: idx * 0.02 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {commission.order_reference || (commission.order_id ? "Linked order" : "—")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[200px]">
                            {commission.collaboration?.offer?.titre || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {commission.provider_type === "AGENCY_OWNER" ? (
                              <Building2 size={12} className="text-purple-500" />
                            ) : (
                              <User size={12} className="text-blue-500" />
                            )}
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {commission.provider_type === "AGENCY_OWNER" ? "Agency Owner" : "Agency Agent"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatMoney(commission.commission_total, commission.currency)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            {formatMoney(commission.commission_provider, commission.currency)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusChip status={commission.status} />
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-xs text-gray-500">{formatDateTime(commission.created_at)}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openCommissionDetails(commission)}
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
                  {((page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(page * ITEMS_PER_PAGE, filteredCommissions.length)} of {filteredCommissions.length}
                </p>
                <div className="flex gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={14} />
                  </motion.button>
                  <span className="px-3 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium">
                    {page}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={14} />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Payment Attempts Modal */}
      <AnimatePresence>
        {openModal && activeCommission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setOpenModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl"
            >
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
                <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                      <Wallet2 size={18} className="text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Commission Details</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activeCommission.order_reference || (activeCommission.order_id ? "Linked order" : "No linked order")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenModal(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <XCircle size={18} className="text-gray-500" />
                  </button>
                </div>

                <div className="max-h-[65vh] overflow-y-auto p-5 space-y-4">
                  {/* Offer Info */}
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 p-4 border border-blue-100 dark:border-blue-500/20">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Offer</p>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                      {activeCommission?.collaboration?.offer?.titre || "-"}
                    </p>
                  </div>

                  {/* Amounts Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="mt-1 font-bold text-gray-900 dark:text-white text-lg">
                        {formatMoney(activeCommission.commission_total, activeCommission.currency)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Provider Commission</p>
                      <p className="mt-1 font-bold text-emerald-700 dark:text-emerald-400 text-lg">
                        {formatMoney(activeCommission.commission_provider, activeCommission.currency)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">SaaS Fee</p>
                      <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                        {formatMoney(activeCommission.commission_saas, activeCommission.currency)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatDateTime(activeCommission.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Payment Attempts */}
                  <div>
                    <p className="mb-3 text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <Zap size={14} className="text-yellow-500" />
                      Payment Attempts
                    </p>
                    {attemptsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-blue-500" />
                      </div>
                    ) : attempts.length === 0 ? (
                      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">No payment attempts yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {attempts.map((attempt, idx) => (
                          <motion.div
                            key={attempt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`rounded-xl border p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${
                              attempt.status === "success" 
                                ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-500/5" 
                                : "border-rose-200 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-500/5"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${
                                  attempt.status === "success" 
                                    ? "bg-emerald-100 dark:bg-emerald-500/20" 
                                    : "bg-rose-100 dark:bg-rose-500/20"
                                }`}>
                                  {attempt.status === "success" ? (
                                    <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <XCircle size={14} className="text-rose-600 dark:text-rose-400" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Attempt #{idx + 1}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDateTime(attempt.attempted_at)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                  {formatMoney(attempt.required_amount, activeCommission.currency)}
                                </p>
                                {attempt.error_message && (
                                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 max-w-[200px] truncate">
                                    {attempt.error_message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgencyCommissions;
