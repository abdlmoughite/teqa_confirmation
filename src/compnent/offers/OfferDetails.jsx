// OfferDetails.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building2,
  Globe,
  Tag,
  FileText,
  Loader2,
  AlertCircle,
  Share2,
  Copy,
  Check,
  Shield,
  AlertTriangle,
  X,
  Heart,
  Eye,
  Zap,
  TrendingUp,
  Layers,
  Hash,
  ExternalLink
} from "lucide-react";
import { GetOffer, DeleteOffer, CheckDeleteOffer } from "../../api/auth";
import { usePublicEntities } from "../../hooks/usePublicEntities";

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_CONFIG = {
  active: { 
    label: "Active", 
    color: "emerald", 
    icon: CheckCircle,
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    textColor: "text-emerald-700 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-500/20"
  },
  inactive: { 
    label: "Inactive", 
    color: "slate", 
    icon: XCircle,
    bgColor: "bg-slate-100 dark:bg-slate-800",
    textColor: "text-slate-600 dark:text-slate-400",
    borderColor: "border-slate-200 dark:border-slate-700"
  },
  archived: { 
    label: "Archived", 
    color: "amber", 
    icon: Clock,
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
    textColor: "text-amber-700 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-500/20"
  }
};

const PROVIDER_CONFIG = {
  AGENCY_OWNER: { 
    label: "Agency Owner", 
    icon: Building2, 
    color: "blue",
    bgColor: "bg-blue-50 dark:bg-blue-500/10",
    textColor: "text-blue-700 dark:text-blue-400"
  },
  AGENCY_AGENT: { 
    label: "Agency Agent", 
    icon: User, 
    color: "purple",
    bgColor: "bg-purple-50 dark:bg-purple-500/10",
    textColor: "text-purple-700 dark:text-purple-400"
  }
};

/* =========================================================
   TOAST COMPONENT
========================================================= */

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    error: {
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-500",
      borderColor: "border-red-200 dark:border-red-800"
    },
    warning: {
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-500",
      borderColor: "border-amber-200 dark:border-amber-800"
    },
    success: {
      icon: CheckCircle,
      gradient: "from-emerald-500 to-green-500",
      borderColor: "border-emerald-200 dark:border-emerald-800"
    }
  };

  const config = typeConfig[type] || typeConfig.error;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 50, y: -20 }}
      className="fixed top-20 right-4 z-50"
    >
      <div className={`flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border ${config.borderColor} shadow-xl max-w-md backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95`}>
        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${config.gradient} bg-opacity-10`}>
          <Icon size={18} className="text-white" />
        </div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{message}</p>
        <button 
          onClick={onClose} 
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={16} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

/* =========================================================
   STAT CARD COMPONENT
========================================================= */

const StatCard = ({ icon: Icon, label, value, gradient }) => (
  <motion.div 
    whileHover={{ scale: 1.02, y: -2 }}
    className={`p-4 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/70 text-xs uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
      </div>
      <Icon size={28} className="text-white/50" />
    </div>
  </motion.div>
);

/* =========================================================
   INFO ROW COMPONENT
========================================================= */

const InfoRow = ({ icon: Icon, label, value, copyable = false }) => (
  <div className="group flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
    <Icon size={18} className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-0.5 break-all">
        {value || "—"}
      </p>
    </div>
    {copyable && value && (
      <button
        onClick={() => navigator.clipboard.writeText(value)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
      >
        <Copy size={14} className="text-gray-400" />
      </button>
    )}
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const OfferDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteCheck, setDeleteCheck] = useState(null);
  const [checkingDelete, setCheckingDelete] = useState(false);

  const publicEntityRefs = useMemo(() => {
    if (!offer) return [];
    return [
      { type: offer.provider_type, id: offer.provider_id },
      { type: "USER", id: offer.created_by_user_id },
    ];
  }, [offer]);

  const { getEntityName, getEntitySubtitle, getEntityAvatar } = usePublicEntities(publicEntityRefs);

  /* =========================================================
     TOAST HELPERS
  ========================================================= */
  const showToast = (message, type = "error") => {
    setToast({ message, type });
  };

  /* =========================================================
     FETCH OFFER DATA
  ========================================================= */
  useEffect(() => {
    fetchOffer();
  }, [id]);

  const fetchOffer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await GetOffer(id);
      let offerData = response.data || response;
      setOffer(offerData);
    } catch (err) {
      console.warn("Error fetching offer:", err);
      setError(err.response?.data?.message || err.message || "Failed to load offer");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     CHECK DELETE AVAILABILITY
  ========================================================= */
  const checkDeleteAvailability = async () => {
    setCheckingDelete(true);
    
    try {
      const response = await CheckDeleteOffer(id);
      const checkData = response.data || response;
      setDeleteCheck(checkData);
      
      if (checkData.can_delete === true) {
        setShowDeleteModal(true);
      } else {
        showToast(checkData.message || "Cette offre ne peut pas être supprimée", "error");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Impossible de vérifier si l'offre peut être supprimée";
      showToast(errorMessage, "error");
    } finally {
      setCheckingDelete(false);
    }
  };

  /* =========================================================
     HANDLE DELETE
  ========================================================= */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await DeleteOffer(id);
      showToast("Offre supprimée avec succès", "success");
      setTimeout(() => navigate("/offers"), 1500);
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.message || err.message || "Failed to delete offer";
      showToast(errorMessage, "error");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     FORMAT DATE
  ========================================================= */
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  /* =========================================================
     RENDER STATUS BADGE
  ========================================================= */
  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${config.borderColor} ${config.bgColor} ${config.textColor}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="w-full h-full rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-blue-500 dark:border-t-blue-400" />
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400">Loading offer details...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */
  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Offer Not Found</h2>
            <p className="text-red-700 dark:text-red-400 mb-6">{error || "The offer you're looking for doesn't exist or has been removed."}</p>
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowLeft size={18} />
              Back to Offers
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN RENDER
  ========================================================= */
  const providerName = getEntityName(offer.provider_type, offer.provider_id, "Provider");
  const providerSubtitle = getEntitySubtitle(
    offer.provider_type,
    offer.provider_id,
    PROVIDER_CONFIG[offer.provider_type]?.label || "Provider"
  );
  const providerAvatar = getEntityAvatar(offer.provider_type, offer.provider_id);
  const createdByName = getEntityName("USER", offer.created_by_user_id, "User");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/offers")}
                className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
              >
                <ArrowLeft size={20} />
              </motion.button>
              
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    {offer.titre}
                  </h1>
                  {renderStatusBadge(offer.status)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Hash size={14} className="text-gray-400" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                    ID: {offer.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
                {copied ? "Copied!" : "Share"}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/edit-offer/${offer.id}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Edit size={16} />
                Edit
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={checkDeleteAvailability}
                disabled={checkingDelete}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                {checkingDelete ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          <StatCard 
            icon={DollarSign} 
            label="Price" 
            value={`${parseFloat(offer.prix).toLocaleString()} ${offer.currency}`}
            gradient="from-blue-500 to-indigo-600"
          />
          <StatCard 
            icon={TrendingUp} 
            label="Provider" 
            value={providerName}
            gradient="from-purple-500 to-pink-600"
          />
          <StatCard 
            icon={Calendar} 
            label="Created At" 
            value={formatDate(offer.created_at).split(',')[0]}
            gradient="from-emerald-500 to-teal-600"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
                <div className="flex items-center gap-2">
                  <FileText size={20} className="text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Description</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {offer.description || "No description provided"}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Additional Information Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
                <div className="flex items-center gap-2">
                  <Layers size={20} className="text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Additional Information</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-3">
                  <InfoRow icon={Building2} label="Provider" value={providerName} />
                  <InfoRow icon={Shield} label="Provider Profile" value={providerSubtitle} />
                  <InfoRow icon={User} label="Created By" value={createdByName} />
                  <InfoRow icon={Clock} label="Last Updated" value={formatDate(offer.updated_at)} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Price Details Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-white/80">
                    <Package size={20} />
                    <span className="text-sm font-medium">Offer Details</span>
                  </div>
                  <Zap size={24} className="text-white/40" />
                </div>
                <div className="text-white">
                  <p className="text-5xl font-bold mb-1">
                    {parseFloat(offer.prix).toLocaleString()}
                  </p>
                  <p className="text-sm text-white/80">
                    {offer.currency} - {offer.currency === "MAD" ? "Moroccan Dirham" : "Currency"}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">Currency Code</span>
                    <span className="text-white font-mono">{offer.currency}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Zap size={16} className="text-yellow-500" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    to={`/edit-offer/${offer.id}`}
                    className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">Edit Offer</span>
                    <Edit size={16} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                  </Link>
                  <button
                    onClick={checkDeleteAvailability}
                    disabled={checkingDelete}
                    className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
                  >
                    <span className="text-sm text-red-600 dark:text-red-400">Delete Offer</span>
                    {checkingDelete ? <Loader2 size={16} className="animate-spin text-red-400" /> : <Trash2 size={16} className="text-red-400 group-hover:text-red-500 transition-colors" />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Meta Info Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Globe size={16} className="text-blue-500" />
                  Provider Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/50">
                    <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg bg-blue-100 text-sm font-semibold text-blue-700">
                      {providerAvatar ? (
                        <img src={providerAvatar} alt={providerName} className="h-full w-full object-cover" />
                      ) : (
                        providerName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{providerName}</p>
                      <p className="truncate text-xs text-gray-500">{providerSubtitle}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Created At</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{formatDate(offer.created_at)}</p>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Currency</p>
                    <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                      <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{offer.currency}</span>
                      <span className="text-xs text-gray-500">- {offer.currency === "MAD" ? "Moroccan Dirham" : "Currency"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && deleteCheck?.can_delete === true && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500" />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                      <Trash2 size={22} className="text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Delete Offer</h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Are you sure you want to delete "<span className="font-semibold text-gray-900 dark:text-white">{offer.titre}</span>"?
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-6 flex items-center gap-1">
                    <AlertTriangle size={14} />
                    This action cannot be undone. All data will be permanently removed.
                  </p>
                  
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowDeleteModal(false);
                        setDeleteCheck(null);
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                      {deleting && <Loader2 size={16} className="animate-spin" />}
                      Delete Permanently
                    </motion.button>
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

export default OfferDetails;
