// CreateOffer.jsx - Version ultra compacte
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddOffer } from "../../api/auth";
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
  Clock,
  Shield,
  Star,
  Eye,
  Zap
} from "lucide-react";

const CURRENCIES = [
  { value: "MAD", symbol: "د.م.", label: "MAD - Moroccan Dirham" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "emerald", icon: CheckCircle },
  { value: "inactive", label: "Inactive", color: "gray", icon: XCircle },
  { value: "draft", label: "Draft", color: "amber", icon: FileText },
];

const validateForm = (form) => {
  const errors = {};
  if (!form.titre?.trim()) errors.titre = "Title required";
  else if (form.titre.length < 3) errors.titre = "Min 3 characters";
  else if (form.titre.length > 100) errors.titre = "Max 100 characters";

  if (!form.description?.trim()) errors.description = "Description required";
  else if (form.description.length < 10) errors.description = "Min 10 characters";
  else if (form.description.length > 300) errors.description = "Max 300 characters";

  if (!form.prix) errors.prix = "Price required";
  else if (isNaN(form.prix) || form.prix <= 0) errors.prix = "Positive number required";
  else if (form.prix > 9999999) errors.prix = "Price too high";

  return errors;
};

const CreateOffer = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    titre: "",
    description: "",
    prix: "",
    currency: "MAD",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (apiError) setApiError(null);
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(validateForm(form));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouched(allTouched);
    
    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    setApiError(null);

    try {
      const payload = {
        titre: form.titre.trim(),
        description: form.description.trim(),
        prix: parseFloat(form.prix).toString(),
        currency: "MAD",
        status: form.status,
      };

      const response = await AddOffer(payload);
      
      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setTimeout(() => navigate("/offers"), 1500);
      } else {
        throw new Error("Failed to create offer");
      }
    } catch (err) {
      setApiError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusPreviewClass = (status) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'inactive': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      case 'draft': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusButtonClass = (option, isActive) => {
    if (!isActive) {
      return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700';
    }
    switch (option.value) {
      case 'active': return 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500';
      case 'inactive': return 'border-gray-500 bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      case 'draft': return 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500';
      default: return 'border-gray-300 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="bg-gray-10 dark:bg-gray-600 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {/* Header compact */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/offers")}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <ArrowLeft size={18} className="text-gray-500 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Create Offer</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Fill the details below</p>
            </div>
          </div>
          
          {success && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
              <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs text-emerald-700 dark:text-emerald-400">Created!</span>
            </div>
          )}
          
          {apiError && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 dark:bg-red-500/20 rounded-lg">
              <AlertCircle size={12} className="text-red-600 dark:text-red-400" />
              <span className="text-xs text-red-700 dark:text-red-400">Error</span>
            </div>
          )}
        </div>

        {/* Grid 2 colonnes compact */}
        <div className="grid md:grid-cols-2 gap-4">
          
          {/* Formulaire */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-emerald-500" />
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Offer Details</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-3 space-y-3">
              {/* Title */}
              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titre"
                  placeholder="Offer title"
                  value={form.titre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`
                    w-full px-3 py-1.5 text-xs rounded-lg border transition-all
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-1 focus:ring-emerald-500
                    ${touched.titre && errors.titre 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-700'
                    }
                  `}
                />
                {touched.titre && errors.titre && (
                  <p className="mt-0.5 text-[10px] text-red-500">{errors.titre}</p>
                )}
                <p className="mt-0.5 text-[10px] text-gray-400">{form.titre.length}/100</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Describe your offer..."
                  value={form.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  className={`
                    w-full px-3 py-1.5 text-xs rounded-lg border transition-all resize-none
                    bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                    focus:outline-none focus:ring-1 focus:ring-emerald-500
                    ${touched.description && errors.description 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-700'
                    }
                  `}
                />
                {touched.description && errors.description && (
                  <p className="mt-0.5 text-[10px] text-red-500">{errors.description}</p>
                )}
                <p className="mt-0.5 text-[10px] text-gray-400">{form.description.length}/300</p>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price <span className="text-red-500">*</span>
                  </label>
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
                      w-full px-3 py-1.5 text-xs rounded-lg border transition-all
                      bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                      focus:outline-none focus:ring-1 focus:ring-emerald-500
                      ${touched.prix && errors.prix 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-700'
                      }
                    `}
                  />
                  {touched.prix && errors.prix && (
                    <p className="mt-0.5 text-[10px] text-red-500">{errors.prix}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    disabled
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  >
                    <option>MAD</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Status
                </label>
                <div className="flex gap-1.5">
                  {STATUS_OPTIONS.map(option => {
                    const Icon = option.icon;
                    const isActive = form.status === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, status: option.value }))}
                        className={`
                          flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md border text-[10px] font-medium transition
                          ${getStatusButtonClass(option, isActive)}
                        `}
                      >
                        <Icon size={10} />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-md font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition disabled:opacity-50 flex items-center justify-center gap-1.5 text-xs mt-2"
              >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {loading ? "Creating..." : "Create Offer"}
              </button>
            </form>
          </div>

          {/* Preview compact */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Eye size={12} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">Preview</span>
                </div>
                <Zap size={10} className="text-emerald-400" />
              </div>
            </div>
            
            <div className="p-3 space-y-3">
              {/* Offer Card */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {form.titre || "Your Offer"}
                    </h3>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <Star size={10} className="text-gray-300 dark:text-gray-600" />
                    </div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${getStatusPreviewClass(form.status)}`}>
                    {form.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                  {form.description || "No description yet"}
                </p>
              </div>

              {/* Price */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500">Price</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {form.prix ? `${parseFloat(form.prix).toLocaleString()}` : "0"}
                      <span className="text-[10px] font-normal ml-0.5">MAD</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <Clock size={10} />
                    <span className="text-[10px]">3-5 days</span>
                  </div>
                </div>
              </div>

              {/* Features row */}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded">
                  <Shield size={10} className="text-emerald-500" />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">Secure</span>
                </div>
                <div className="flex-1 flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-gray-800/50 rounded">
                  <CheckCircle size={10} className="text-emerald-500" />
                  <span className="text-[10px] text-gray-600 dark:text-gray-400">Support</span>
                </div>
              </div>

              {/* Seller */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">YS</span>
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-gray-900 dark:text-white">Your Store</p>
                  <p className="text-[9px] text-gray-500">Provider</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOffer;