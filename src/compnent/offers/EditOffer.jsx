// EditOffer.jsx - Version avec couleurs adaptées
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  FileText,
  DollarSign,
  Globe,
  CheckCircle,
  AlertCircle,
  XCircle,
  Save,
  Loader2,
  ArrowLeft,
  Trash2,
  Eye,
  Clock,
  Zap,
  Shield,
  AlertTriangle,
  X,
  Check
} from "lucide-react";
import { GetOffer, UpdateOffer, DeleteOffer, CheckDeleteOffer } from "../../api/auth";

/* =========================================================
   CONSTANTS
========================================================= */

const CURRENCIES = [
  { value: "MAD", symbol: "د.م.", label: "MAD - Moroccan Dirham" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "emerald", icon: CheckCircle },
  { value: "inactive", label: "Inactive", color: "slate", icon: XCircle },
  { value: "archived", label: "Archived", color: "amber", icon: Clock },
];

/* =========================================================
   TOAST COMPONENT
========================================================= */

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    error: { icon: AlertCircle, gradient: "from-red-500 to-rose-500" },
    warning: { icon: AlertTriangle, gradient: "from-amber-500 to-orange-500" },
    success: { icon: CheckCircle, gradient: "from-emerald-500 to-green-500" }
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
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border shadow-xl max-w-md backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 border-gray-200 dark:border-gray-800">
        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${config.gradient}`}>
          <Icon size={18} className="text-white" />
        </div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{message}</p>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <X size={16} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </motion.div>
  );
};

/* =========================================================
   PREVIEW CARD COMPONENT
========================================================= */

const PreviewCard = ({ form, statusColor }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden sticky top-6 shadow-lg"
  >
    <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye size={16} className="text-emerald-500" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Live Preview
          </h3>
        </div>
        <Zap size={14} className="text-emerald-400" />
      </div>
    </div>
    
    <div className="p-5 space-y-4">
      {/* Title Preview */}
      <div>
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</span>
        <p className="font-semibold text-gray-900 dark:text-white mt-1 text-lg">
          {form.titre || "—"}
        </p>
      </div>
      
      {/* Description Preview */}
      <div>
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</span>
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {form.description || "—"}
          </p>
        </div>
      </div>
      
      {/* Price & Status Preview */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {form.prix ? parseFloat(form.prix).toLocaleString() : "0"}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {CURRENCIES.find(c => c.value === form.currency)?.symbol || form.currency}
            </span>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusColor}`}>
          {STATUS_OPTIONS.find(s => s.value === form.status)?.label || form.status}
        </div>
      </div>
    </div>
  </motion.div>
);

/* =========================================================
   VALIDATION SCHEMA
========================================================= */

const validateForm = (form) => {
  const errors = {};

  if (!form.titre?.trim()) {
    errors.titre = "Title is required";
  } else if (form.titre.length < 3) {
    errors.titre = "Title must be at least 3 characters";
  } else if (form.titre.length > 100) {
    errors.titre = "Title must not exceed 100 characters";
  }

  if (!form.description?.trim()) {
    errors.description = "Description is required";
  } else if (form.description.length < 10) {
    errors.description = "Description must be at least 10 characters";
  } else if (form.description.length > 2000) {
    errors.description = "Description must not exceed 2000 characters";
  }

  if (!form.prix && form.prix !== 0) {
    errors.prix = "Price is required";
  } else if (isNaN(form.prix) || form.prix <= 0) {
    errors.prix = "Price must be a positive number";
  } else if (form.prix > 9999999) {
    errors.prix = "Price is too high";
  }

  return errors;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const EditOffer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    titre: "",
    description: "",
    prix: "",
    currency: "MAD",
    status: "active",
  });
  
  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteCheck, setDeleteCheck] = useState(null);
  const [checkingDelete, setCheckingDelete] = useState(false);

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
    setApiError(null);
    
    try {
      const response = await GetOffer(id);
      let offerData = response.data || response;
      
      if (offerData) {
        setForm({
          titre: offerData.titre || "",
          description: offerData.description || "",
          prix: offerData.prix || "",
          currency: offerData.currency || "MAD",
          status: offerData.status || "active",
        });
        setOriginalData(offerData);
      }
    } catch (err) {
      console.warn("Error fetching offer:", err);
      setApiError(err.response?.data?.message || err.message || "Failed to load offer");
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
     CHECK IF FORM HAS CHANGES
  ========================================================= */
  const hasChanges = () => {
    if (!originalData) return false;
    return (
      form.titre !== originalData.titre ||
      form.description !== originalData.description ||
      parseFloat(form.prix) !== parseFloat(originalData.prix) ||
      form.currency !== originalData.currency ||
      form.status !== originalData.status
    );
  };

  /* =========================================================
     HANDLE INPUT
  ========================================================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    if (apiError) setApiError(null);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
  };

  /* =========================================================
     SUBMIT UPDATE
  ========================================================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasChanges()) {
      showToast("No changes to save", "warning");
      return;
    }
    
    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) {
      const firstError = document.querySelector('.input-error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSaving(true);
    setApiError(null);

    try {
      const payload = {
        titre: form.titre.trim(),
        description: form.description.trim(),
        prix: parseFloat(form.prix),
        currency: form.currency,
        status: form.status,
      };

      const response = await UpdateOffer(id, payload);
      
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setOriginalData({ ...originalData, ...payload });
        showToast("Offer updated successfully!", "success");
        
        setTimeout(() => {
          setSuccess(false);
          navigate("/offers");
        }, 2000);
      } else {
        throw new Error(response.data?.message || "Failed to update offer");
      }
    } catch (err) {
      console.warn("API Error:", err);
      const errorMessage = err.response?.data?.message || err.message || "Network error. Please try again.";
      setApiError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     GET STATUS COLOR
  ========================================================= */
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
      case 'archived': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <div className="w-full h-full rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-emerald-500 dark:border-t-emerald-400" />
          </motion.div>
          <p className="text-gray-500 dark:text-gray-400">Loading offer...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */
  if (apiError && !loading && !originalData) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <AlertCircle size={32} className="text-red-500 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Offer</h2>
            <p className="text-red-700 dark:text-red-400 mb-6">{apiError}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchOffer}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all shadow-md"
              >
                Try Again
              </button>
              <Link
                to="/offers"
                className="px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all shadow-md"
              >
                Back to Offers
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN RENDER
  ========================================================= */
  return (
    <div className="bg-gray-10 dark:bg-gray-600 min-h-screen">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        {/* Header */}
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Edit Offer
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Update your offer information
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPreview(!showPreview)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                <Eye size={16} />
                {showPreview ? "Hide Preview" : "Show Preview"}
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-emerald-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Offer Information
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Edit the details of your offer
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag size={14} className="inline mr-1.5" />
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titre"
                  placeholder="e.g., Premium Web Development Service"
                  value={form.titre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`
                    w-full px-4 py-2.5 rounded-xl border transition-all duration-200
                    bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                    ${touched.titre && errors.titre 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600'
                    }
                  `}
                  autoFocus
                />
                {touched.titre && errors.titre && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle size={12} /> {errors.titre}
                  </motion.p>
                )}
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {form.titre.length}/100 characters
                  </p>
                  {form.titre.length > 80 && form.titre.length <= 100 && (
                    <p className="text-xs text-amber-500">Getting long</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText size={14} className="inline mr-1.5" />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Describe your offer in detail..."
                  value={form.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={6}
                  className={`
                    w-full px-4 py-2.5 rounded-xl border transition-all duration-200 resize-none
                    bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white
                    placeholder:text-gray-400 dark:placeholder:text-gray-500
                    focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                    ${touched.description && errors.description 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600'
                    }
                  `}
                />
                {touched.description && errors.description && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                  >
                    <AlertCircle size={12} /> {errors.description}
                  </motion.p>
                )}
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {form.description.length}/2000 characters
                  </p>
                  {form.description.length > 1500 && (
                    <p className="text-xs text-amber-500">Getting long</p>
                  )}
                </div>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DollarSign size={14} className="inline mr-1.5" />
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">MAD</span>
                    <input
                      type="number"
                      name="prix"
                      placeholder="0.00"
                      value={form.prix}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      step="0.01"
                      min="0"
                      className={`
                        w-full pl-16 pr-4 py-2.5 rounded-xl border transition-all duration-200
                        bg-white dark:bg-gray-800
                        text-gray-900 dark:text-white
                        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                        ${touched.prix && errors.prix 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-600'
                        }
                      `}
                    />
                  </div>
                  {touched.prix && errors.prix && (
                    <motion.p 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                    >
                      <AlertCircle size={12} /> {errors.prix}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Globe size={14} className="inline mr-1.5" />
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700
                      bg-gray-100 dark:bg-gray-800/50
                      text-gray-500 dark:text-gray-400
                      cursor-not-allowed opacity-75"
                  >
                    {CURRENCIES.map(currency => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    Currency cannot be changed
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {STATUS_OPTIONS.map(option => {
                    const Icon = option.icon;
                    const isSelected = form.status === option.value;
                    
                    return (
                      <motion.label
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                          cursor-pointer transition-all duration-200 border-2
                          ${isSelected
                            ? getStatusColor(option.value)
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={isSelected}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <Icon size={14} className={isSelected ? 'currentColor' : 'text-gray-500 dark:text-gray-400'} />
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </motion.label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Link
                  to="/offers"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center font-medium"
                >
                  Cancel
                </Link>
                <motion.button
                  type="submit"
                  whileHover={(!saving && hasChanges()) ? { scale: 1.02 } : {}}
                  whileTap={(!saving && hasChanges()) ? { scale: 0.98 } : {}}
                  disabled={saving || !hasChanges()}
                  className={`
                    flex-1 py-2.5 rounded-xl font-medium text-white
                    transition-all duration-200 flex items-center justify-center gap-2
                    ${saving || !hasChanges()
                      ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  {saving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
              
              {/* Changes indicator */}
              <AnimatePresence>
                {hasChanges() && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs text-amber-600 dark:text-amber-400 text-center mt-2 flex items-center justify-center gap-1"
                  >
                    <AlertTriangle size={12} />
                    You have unsaved changes
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

          {/* Preview Section - Desktop */}
          <div className="hidden lg:block">
            <PreviewCard form={form} statusColor={getStatusColor(form.status)} />
          </div>
        </div>

        {/* Preview Section - Mobile */}
        <AnimatePresence>
          {showPreview && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="lg:hidden mt-6"
            >
              <PreviewCard form={form} statusColor={getStatusColor(form.status)} />
            </motion.div>
          )}
        </AnimatePresence>
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
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Delete Offer</h3>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Are you sure you want to delete "<span className="font-semibold text-gray-900 dark:text-white">{originalData?.titre}</span>"?
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

export default EditOffer;