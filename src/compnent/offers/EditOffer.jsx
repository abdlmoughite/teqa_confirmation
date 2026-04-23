// EditOffer.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Clock
} from "lucide-react";
import { GetOffer, UpdateOffer, DeleteOffer } from "../../api/auth";

/* =========================================================
   CONSTANTS
========================================================= */

const CURRENCIES = [
  { value: "MAD", symbol: "د.م.", label: "MAD - Moroccan Dirham" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "green", icon: CheckCircle },
  { value: "inactive", label: "Inactive", color: "gray", icon: XCircle },
  { value: "archived", label: "Archived", color: "yellow", icon: Clock },
];

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

  if (!form.prix) {
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
      console.log("Offer data:", response);
      
      let offerData = null;
      if (response.data) {
        offerData = response.data;
      } else if (response) {
        offerData = response;
      }
      
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
      console.error("Error fetching offer:", err);
      setApiError(err.response?.data?.message || err.message || "Failed to load offer");
    } finally {
      setLoading(false);
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
      setApiError("No changes to save");
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
        
        setTimeout(() => {
          setSuccess(false);
          navigate("/offers");
        }, 2000);
      } else {
        throw new Error(response.data?.message || "Failed to update offer");
      }
    } catch (err) {
      console.error("API Error:", err);
      setApiError(err.response?.data?.message || err.message || "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     HANDLE DELETE
  ========================================================= */
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await DeleteOffer(id);
      navigate("/offers");
    } catch (err) {
      console.error("Error deleting offer:", err);
      setApiError(err.response?.data?.message || err.message || "Failed to delete offer");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     PREVIEW COMPONENT
  ========================================================= */
  const PreviewCard = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-blue-100 dark:border-gray-700 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Live Preview
        </h3>
        <Eye size={14} className="text-blue-400" />
      </div>
      
      <div className="space-y-4">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Title</span>
          <p className="font-semibold text-gray-800 dark:text-white mt-1">
            {form.titre || "—"}
          </p>
        </div>
        
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Description</span>
          <div className="mt-1 p-3 bg-white dark:bg-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {form.description || "—"}
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-blue-100 dark:border-gray-700">
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400">Price</span>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {form.prix ? `${parseFloat(form.prix).toLocaleString()} ${CURRENCIES.find(c => c.value === form.currency)?.symbol || form.currency}` : "—"}
            </p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            form.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            form.status === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
          }`}>
            {form.status}
          </div>
        </div>
      </div>
    </div>
  );

  /* =========================================================
     RENDER STATUS BADGE
  ========================================================= */
  const renderStatusBadge = (status) => {
    const config = STATUS_OPTIONS.find(s => s.value === status);
    if (!config) return null;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
        status === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' :
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      }`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading offer...</p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR STATE
  ========================================================= */
  if (apiError && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Error Loading Offer</h2>
            <p className="text-red-700 dark:text-red-400 mb-4">{apiError}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={fetchOffer}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                Try Again
              </button>
              <Link
                to="/offers"
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Back to Offers
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN RENDER
  ========================================================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link
                to="/offers"
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  Edit Offer
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Update your offer information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Eye size={16} />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-slide-down">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">Success!</h3>
                <p className="text-sm text-green-700 dark:text-green-400">Offer updated successfully! Redirecting...</p>
              </div>
            </div>
          </div>
        )}

        {/* API Error Alert */}
        {apiError && !success && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Offer Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Edit the details of your offer
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Tag size={14} className="inline mr-1" />
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
                    w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                    bg-white dark:bg-gray-800
                    text-gray-800 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${touched.titre && errors.titre 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                    }
                  `}
                  autoFocus
                />
                {touched.titre && errors.titre && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.titre}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {form.titre.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FileText size={14} className="inline mr-1" />
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
                    w-full px-4 py-2.5 rounded-lg border transition-all duration-200 resize-none
                    bg-white dark:bg-gray-800
                    text-gray-800 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${touched.description && errors.description 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                    }
                  `}
                />
                {touched.description && errors.description && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  {form.description.length}/2000 characters
                </p>
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DollarSign size={14} className="inline mr-1" />
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
                      w-full px-4 py-2.5 rounded-lg border transition-all duration-200
                      bg-white dark:bg-gray-800
                      text-gray-800 dark:text-white
                      focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${touched.prix && errors.prix 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'
                      }
                    `}
                  />
                  {touched.prix && errors.prix && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.prix}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Globe size={14} className="inline mr-1" />
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700
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
                  <p className="mt-1 text-xs text-gray-400">
                    Currency cannot be changed
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex gap-3">
                  {STATUS_OPTIONS.map(option => {
                    const Icon = option.icon;
                    const colorMap = {
                      green: "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                      gray: "border-gray-500 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
                      yellow: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                    };
                    
                    return (
                      <label
                        key={option.value}
                        className={`
                          flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
                          cursor-pointer transition-all duration-200 border-2
                          ${form.status === option.value
                            ? colorMap[option.color]
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          checked={form.status === option.value}
                          onChange={handleChange}
                          className="hidden"
                        />
                        <Icon size={16} />
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Link
                  to="/offers"
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving || !hasChanges()}
                  className={`
                    flex-1 py-2.5 rounded-lg font-medium text-white
                    transition-all duration-200 transform
                    flex items-center justify-center gap-2
                    ${saving || !hasChanges()
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-[1.02]'
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
                </button>
              </div>
              
              {/* Changes indicator */}
              {hasChanges() && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 text-center mt-2">
                  You have unsaved changes
                </p>
              )}
            </form>
          </div>

          {/* Preview Section - Desktop */}
          <div className="hidden lg:block">
            <PreviewCard />
          </div>
        </div>

        {/* Preview Section - Mobile */}
        {showPreview && (
          <div className="lg:hidden mt-6">
            <PreviewCard />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl animate-slide-down">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Delete Offer</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              Are you sure you want to delete "<span className="font-medium">{originalData?.titre}</span>"?
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              This action cannot be undone. All data will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditOffer;