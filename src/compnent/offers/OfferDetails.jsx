// OfferDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Check
} from "lucide-react";
import { GetOffer, DeleteOffer } from "../../api/auth";

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_CONFIG = {
  active: { 
    label: "Active", 
    color: "green", 
    icon: CheckCircle,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-400"
  },
  inactive: { 
    label: "Inactive", 
    color: "gray", 
    icon: XCircle,
    bgColor: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-600 dark:text-gray-400"
  },
  archived: { 
    label: "Archived", 
    color: "yellow", 
    icon: Clock,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-700 dark:text-yellow-400"
  }
};

const PROVIDER_CONFIG = {
  AGENCY_OWNER: { label: "Agency Owner", icon: Building2, color: "blue" },
  AGENCY_AGENT: { label: "Agency Agent", icon: User, color: "purple" }
};

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
      console.log("Offer details:", response);
      
      let offerData = null;
      if (response.data) {
        offerData = response.data;
      } else if (response) {
        offerData = response;
      }
      
      setOffer(offerData);
    } catch (err) {
      console.error("Error fetching offer:", err);
      setError(err.response?.data?.message || err.message || "Failed to load offer");
    } finally {
      setLoading(false);
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
      setError(err.response?.data?.message || err.message || "Failed to delete offer");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  /* =========================================================
     COPY TO CLIPBOARD
  ========================================================= */
  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        second: '2-digit'
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
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon size={16} />
        {config.label}
      </span>
    );
  };

  /* =========================================================
     RENDER PROVIDER BADGE
  ========================================================= */
  const renderProviderBadge = (providerType) => {
    const config = PROVIDER_CONFIG[providerType] || { label: providerType?.replace("_", " ") || "Unknown", icon: User, color: "gray" };
    const Icon = config.icon;
    const colorClasses = {
      blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      gray: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    };
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${colorClasses[config.color]}`}>
        <Icon size={16} />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Offer Not Found</h2>
            <p className="text-red-700 dark:text-red-400 mb-4">{error || "The offer you're looking for doesn't exist or has been removed."}</p>
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              <ArrowLeft size={16} />
              Back to Offers
            </Link>
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
      <div className="max-w-5xl mx-auto">
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
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    {offer.titre}
                  </h1>
                  {renderStatusBadge(offer.status)}
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Offer ID: {offer.id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? "Copied!" : "Share"}
              </button>
              <Link
                to={`/edit-offer/${offer.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white transition shadow-md"
              >
                <Edit size={16} />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition shadow-md"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
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
            </div>

            {/* Additional Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Tag size={20} className="text-blue-500" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Additional Information</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Provider Type</span>
                    <div className="mt-2">
                      {renderProviderBadge(offer.provider_type)}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created By</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1 font-mono">
                      {offer.created_by_user_id || "—"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Provider ID</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1 font-mono">
                      {offer.provider_id || "—"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Updated</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                      {formatDate(offer.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Price & Meta */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 text-white/80 mb-4">
                  <DollarSign size={20} />
                  <span className="text-sm font-medium">Price</span>
                </div>
                <div className="text-white">
                  <p className="text-4xl font-bold">
                    {parseFloat(offer.prix).toLocaleString()}
                  </p>
                  <p className="text-sm text-white/80 mt-1">
                    {offer.currency} - Moroccan Dirham
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Calendar size={16} />
                      <span className="text-xs uppercase tracking-wider">Created At</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(offer.created_at)}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                      <Globe size={16} />
                      <span className="text-xs uppercase tracking-wider">Currency</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {offer.currency} - {offer.currency === "MAD" ? "Moroccan Dirham" : offer.currency}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link
                    to={`/edit-offer/${offer.id}`}
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">Edit Offer</span>
                    <Edit size={16} className="text-gray-400" />
                  </Link>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    <span className="text-sm text-red-600 dark:text-red-400">Delete Offer</span>
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              Are you sure you want to delete "<span className="font-medium">{offer.titre}</span>"?
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

export default OfferDetails;