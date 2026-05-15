// MyInvoices.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingUp,
  Wallet,
  Calendar,
  DollarSign,
  Zap,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { GetInvoices, DownloadInvoicePDF } from "../../api/auth";

/* =========================================================
   CONSTANTS
========================================================= */

const INVOICE_TYPE_CONFIG = {
  PROVIDER_RECEIPT: { label: "Payment Receipt", color: "emerald", icon: CheckCircle, description: "Payment receipt received", bgColor: "bg-emerald-100 dark:bg-emerald-500/10", textColor: "text-emerald-700 dark:text-emerald-400" },
  PROVIDER_INVOICE: { label: "Provider Invoice", color: "orange", icon: FileText, description: "Your issued invoice", bgColor: "bg-orange-100 dark:bg-orange-500/10", textColor: "text-orange-700 dark:text-orange-400" }
};

const INVOICE_STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, bgColor: "bg-amber-100 dark:bg-amber-500/10", textColor: "text-amber-700 dark:text-amber-400", borderColor: "border-amber-200 dark:border-amber-500/20" },
  paid: { label: "Paid", icon: CheckCircle, bgColor: "bg-emerald-100 dark:bg-emerald-500/10", textColor: "text-emerald-700 dark:text-emerald-400", borderColor: "border-emerald-200 dark:border-emerald-500/20" },
  failed: { label: "Failed", icon: XCircle, bgColor: "bg-rose-100 dark:bg-rose-500/10", textColor: "text-rose-700 dark:text-rose-400", borderColor: "border-rose-200 dark:border-rose-500/20" },
  cancelled: { label: "Cancelled", icon: XCircle, bgColor: "bg-slate-100 dark:bg-slate-800", textColor: "text-slate-600 dark:text-slate-400", borderColor: "border-slate-200 dark:border-slate-700" },
  refunded: { label: "Refunded", icon: RefreshCw, bgColor: "bg-amber-100 dark:bg-amber-500/10", textColor: "text-amber-700 dark:text-amber-400", borderColor: "border-amber-200 dark:border-amber-500/20" }
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
    info: { icon: FileText, gradient: "from-blue-500 to-indigo-500" }
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
   STATUS BADGE
========================================================= */

const StatusBadge = ({ status }) => {
  const config = INVOICE_STATUS_CONFIG[status] || INVOICE_STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}>
      <Icon size={12} className={status === "pending" ? "animate-spin" : ""} />
      {config.label}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const config = INVOICE_TYPE_CONFIG[type] || INVOICE_TYPE_CONFIG.PROVIDER_INVOICE;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

/* =========================================================
   STAT CARD
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

const MyInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    showToast("Copied to clipboard", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (typeFilter !== "all") params.invoice_type = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      
      const response = await GetInvoices(params);
      let invoicesData = [];
      if (response.data?.results) {
        invoicesData = response.data.results;
      } else if (Array.isArray(response.data)) {
        invoicesData = response.data;
      }
      setInvoices(invoicesData);
      
    } catch (err) {
      console.warn("Error fetching invoices:", err);
      setError(err.response?.data?.message || "Failed to load invoices");
      showToast(err.response?.data?.message || "Failed to load invoices", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [typeFilter, statusFilter]);

  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
    paidAmount: invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
    pendingAmount: invoices.filter(inv => inv.status === "pending").reduce((sum, inv) => sum + parseFloat(inv.amount), 0),
    currency: invoices[0]?.currency || "MAD"
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.commission_details?.order_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

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

  const handleDownloadPDF = async (invoice) => {
    setDownloading(true);
    try {
      const response = await DownloadInvoicePDF(invoice.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoice.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast("Invoice downloaded successfully", "success");
    } catch (err) {
      console.warn("Error downloading invoice:", err);
      showToast("Failed to download invoice", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="w-full h-full rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-blue-500 dark:border-t-blue-400" />
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error && invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 p-8 text-center">
        <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-300 mb-2">Error</h3>
        <p className="text-rose-700 dark:text-rose-400">{error}</p>
        <button onClick={fetchInvoices} className="mt-4 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all">
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
          My Invoices
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage and track all your invoices</p>
      </motion.div>

      {/* Stats Cards */}
      {invoices.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard 
            title="Total Amount" 
            value={formatPrice(stats.totalAmount, stats.currency)} 
            subValue={`${stats.total} invoices`}
            icon={Wallet}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard 
            title="Paid" 
            value={formatPrice(stats.paidAmount, stats.currency)} 
            icon={CheckCircle}
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard 
            title="Pending" 
            value={formatPrice(stats.pendingAmount, stats.currency)} 
            icon={Clock}
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard 
            title="Total Invoices" 
            value={stats.total} 
            icon={FileText}
            gradient="from-purple-500 to-pink-600"
          />
        </motion.div>
      )}

      {/* Filters */}
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
              type="text"
              placeholder="Search by invoice number or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="relative min-w-[180px]">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="PROVIDER_RECEIPT">Payment Receipts</option>
              <option value="PROVIDER_INVOICE">Provider Invoices</option>
            </select>
            <ChevronLeft size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" />
          </div>

          <div className="relative min-w-[180px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <button
            onClick={fetchInvoices}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </motion.div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center shadow-sm"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No invoices found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? "No results for your search" : "When you receive payments, invoices will appear here"}
            </p>
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
            <table className="w-full min-width-[900px]">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <AnimatePresence>
                  {paginatedInvoices.map((invoice, idx) => (
                    <motion.tr 
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono font-medium text-gray-800 dark:text-white">
                            {invoice.invoice_number}
                          </code>
                          <button
                            onClick={() => copyToClipboard(invoice.invoice_number)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          >
                            {copiedId === invoice.invoice_number ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} className="text-gray-400" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <TypeBadge type={invoice.invoice_type} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500">
                          {invoice.commission_details?.order_reference || (invoice.commission_details?.order_id ? "Linked order" : "—")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatPrice(invoice.amount, invoice.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs text-gray-500">{formatDate(invoice.created_at)}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowDetailsModal(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                            title="View details"
                          >
                            <Eye size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownloadPDF(invoice)}
                            disabled={downloading}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all disabled:opacity-50"
                            title="Download"
                          >
                            <Download size={16} />
                          </motion.button>
                        </div>
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
                {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} of {filteredInvoices.length}
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

      {/* Invoice Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedInvoice && (
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
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice Details</h3>
                      <p className="text-xs text-gray-500 font-mono">{selectedInvoice.invoice_number}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowDetailsModal(false)} 
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <XCircle size={18} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
                  {/* Type and Status */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Invoice Type</p>
                      <TypeBadge type={selectedInvoice.invoice_type} />
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      <StatusBadge status={selectedInvoice.status} />
                    </div>
                  </div>
                  
                  {/* Amount */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Amount</p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                      {formatPrice(selectedInvoice.amount, selectedInvoice.currency)}
                    </p>
                  </div>
                  
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Issue Date</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatFullDate(selectedInvoice.created_at)}
                      </p>
                    </div>
                    {selectedInvoice.paid_at && (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Paid Date</p>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          {formatFullDate(selectedInvoice.paid_at)}
                        </p>
                      </div>
                    )}
                    {selectedInvoice.due_date && (
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                        <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Due Date</p>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                          {formatFullDate(selectedInvoice.due_date)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Order */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order</p>
                    <p className="text-sm text-gray-800 dark:text-white">
                      {selectedInvoice.commission_details?.order_reference || (selectedInvoice.commission_details?.order_id ? "Linked order" : "—")}
                    </p>
                  </div>
                  
                  {/* Notes */}
                  {selectedInvoice.notes && (
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedInvoice.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                  <button
                    onClick={() => handleDownloadPDF(selectedInvoice)}
                    disabled={downloading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
                  >
                    {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Download PDF
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
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

export default MyInvoices;
