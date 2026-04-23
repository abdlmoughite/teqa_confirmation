// CreateOffer.jsx - Version compacte avec données réelles
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
  Star
} from "lucide-react";

const CURRENCIES = [
  { value: "MAD", symbol: "د.م.", label: "MAD - Moroccan Dirham" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "green", icon: CheckCircle },
  { value: "inactive", label: "Inactive", color: "gray", icon: XCircle },
  { value: "draft", label: "Draft", color: "yellow", icon: FileText },
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header compact */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/offers")}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-2 transition"
          >
            <ArrowLeft size={12} />
            Back
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">Create Offer</h1>
        </div>

        {/* Messages compacts */}
        {success && (
          <div className="mb-3 p-2 bg-green-100 dark:bg-green-900/30 border border-green-300 rounded-lg text-center">
            <p className="text-xs text-green-700">✓ Created! Redirecting...</p>
          </div>
        )}
        
        {apiError && (
          <div className="mb-3 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 rounded-lg text-center">
            <p className="text-xs text-red-700">✗ {apiError}</p>
          </div>
        )}

        {/* Grid compact */}
        <div className="grid md:grid-cols-2 gap-4">
          
          {/* Formulaire compact */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 pb-1 border-b border-gray-200 dark:border-gray-800">
              Details
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="titre"
                  placeholder="Offer title"
                  value={form.titre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {touched.titre && errors.titre && <p className="mt-0.5 text-xs text-red-500">{errors.titre}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  placeholder="Describe your offer"
                  value={form.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={2}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                {touched.description && errors.description && <p className="mt-0.5 text-xs text-red-500">{errors.description}</p>}
                <p className="mt-0.5 text-xs text-gray-400">{form.description.length}/300</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
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
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {touched.prix && errors.prix && <p className="mt-0.5 text-xs text-red-500">{errors.prix}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    disabled
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  >
                    <option>MAD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map(option => {
                    const Icon = option.icon;
                    const isActive = form.status === option.value;
                    return (
                      <label
                        key={option.value}
                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md cursor-pointer border text-xs transition ${
                          isActive
                            ? option.value === 'active' ? 'border-green-500 bg-green-50 text-green-700' :
                              option.value === 'inactive' ? 'border-gray-500 bg-gray-50 text-gray-700' :
                              'border-yellow-500 bg-yellow-50 text-yellow-700'
                            : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <input type="radio" name="status" value={option.value} checked={isActive} onChange={handleChange} className="hidden" />
                        <Icon size={12} />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-1.5 rounded-md font-medium text-white bg-blue-500 hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-1 text-sm mt-2"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {loading ? "Creating..." : "Create Offer"}
              </button>
            </form>
          </div>

          {/* Preview compact avec données réelles */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 pb-1 border-b border-gray-200 dark:border-gray-800">
              Preview
            </h2>
            
            <div className="space-y-3">
              {/* Carte offre */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                      {form.titre || "Offer title"}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <Star size={10} className="fill-yellow-400 text-yellow-400" />
                      <Star size={10} className="text-gray-300" />
                      <span className="text-[10px] text-gray-400 ml-1">(0)</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    form.status === 'active' ? 'bg-green-100 text-green-700' :
                    form.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {form.status}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  {form.description || "No description yet"}
                </p>
              </div>

              {/* Prix */}
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500">Price</p>
                    <p className="text-lg font-bold text-blue-600">
                      {form.prix ? `${parseFloat(form.prix).toLocaleString()} MAD` : "0 MAD"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500">Delivery</p>
                    <p className="text-xs font-medium flex items-center gap-1">
                      <Clock size={10} /> 3-5 days
                    </p>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-gray-800 rounded">
                  <Shield size={10} className="text-green-500" />
                  <span className="text-[10px] text-gray-600">Secure</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-gray-50 dark:bg-gray-800 rounded">
                  <Clock size={10} className="text-blue-500" />
                  <span className="text-[10px] text-gray-600">Support 24/7</span>
                </div>
              </div>

              {/* Seller info (statique mais réaliste) */}
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">JD</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-800 dark:text-white">Your Store</p>
                  <p className="text-[10px] text-gray-500">Provider</p>
                </div>
                <CheckCircle size={10} className="text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOffer;