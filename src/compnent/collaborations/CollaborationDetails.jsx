// CollaborationDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Handshake,
  ArrowLeft,
  CheckCircle,
  XCircle,
  MessageSquare,
  DollarSign,
  Calendar,
  Building2,
  Package,
  Clock,
  Send,
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  History,
  User,
  Store,
  ArrowRight,
  Reply,
  Eye,
  FileText,
  Info,
  Check,
  X
} from "lucide-react";
import { GetCollaboration, RespondToCollaboration, GetCollaborations } from "../../api/auth";

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_CONFIG = {
  pending: { 
    label: "Pending", 
    color: "yellow", 
    icon: Clock,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-700 dark:text-yellow-400",
    borderColor: "border-yellow-200 dark:border-yellow-800"
  },
  active: { 
    label: "Active", 
    color: "green", 
    icon: CheckCircle,
    bgColor: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-700 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800"
  },
  rejected: { 
    label: "Rejected", 
    color: "red", 
    icon: XCircle,
    bgColor: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-700 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800"
  },
  countered: { 
    label: "Countered", 
    color: "purple", 
    icon: TrendingUp,
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-700 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800"
  },
  cancelled: { 
    label: "Cancelled", 
    color: "gray", 
    icon: XCircle,
    bgColor: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-600 dark:text-gray-400",
    borderColor: "border-gray-200 dark:border-gray-700"
  }
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const CollaborationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [collaboration, setCollaboration] = useState(null);
  const [allThreadCollabs, setAllThreadCollabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMessage, setCounterMessage] = useState("");
  const [counterError, setCounterError] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  /* =========================================================
     FETCH COLLABORATION AND THREAD
  ========================================================= */
  const fetchCollaboration = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get current collaboration
      const response = await GetCollaboration(id);
      let collabData = response.data || response;
      setCollaboration(collabData);
      
      // Set initial counter price from offer
      if (collabData.offer?.prix) {
        setCounterPrice(collabData.offer.prix.toString());
      }
      
      // Fetch all collaborations to get the complete thread
      const allResponse = await GetCollaborations({});
      let allData = [];
      if (allResponse.data?.results) {
        allData = allResponse.data.results;
      } else if (Array.isArray(allResponse.data)) {
        allData = allResponse.data;
      } else if (allResponse.data?.data) {
        allData = allResponse.data.data;
      }
      
      // Find root ID
      let rootId = collabData.root_collaboration?.id || collabData.id;
      if (collabData.root_collaboration && typeof collabData.root_collaboration === 'object') {
        rootId = collabData.root_collaboration.id;
      }
      
      // Get all collaborations in this thread
      const threadCollabs = allData.filter(c => {
        let cRootId = c.root_collaboration?.id || c.id;
        if (c.root_collaboration && typeof c.root_collaboration === 'object') {
          cRootId = c.root_collaboration.id;
        }
        return cRootId === rootId || c.id === rootId;
      });
      
      // Sort by date (oldest first for timeline)
      threadCollabs.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateA - dateB;
      });
      
      setAllThreadCollabs(threadCollabs);
      
    } catch (err) {
      console.error("Error fetching collaboration:", err);
      setError(err.response?.data?.detail || err.message || "Failed to load collaboration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaboration();
  }, [id]);

  /* =========================================================
     HANDLE RESPONSE
  ========================================================= */
  const handleResponse = async (action, priceFinale = null, message = null) => {
    setActionLoading(true);
    setError(null);
    
    try {
      const payload = { action };
      if (action === "counter") {
        if (!priceFinale || priceFinale <= 0) {
          setCounterError("Please enter a valid price");
          setActionLoading(false);
          return;
        }
        payload.price_finale = parseFloat(priceFinale);
        if (message) payload.message = message;
      }
      
      await RespondToCollaboration(id, payload);
      await fetchCollaboration();
      
      if (action === "counter") {
        setShowCounterModal(false);
        setCounterMessage("");
        setCounterError("");
      }
    } catch (err) {
      console.error("Error responding:", err);
      setError(err.response?.data?.detail || err.message || "Failed to process response");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     UTILITIES
  ========================================================= */
  const canRespond = () => {
    if (!collaboration) return false;
    return collaboration.status === "pending" || collaboration.status === "countered";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
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

  const formatShortDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price, currency) => {
    return `${parseFloat(price).toLocaleString()} ${currency || 'MAD'}`;
  };

  const renderStatusBadge = (status, size = "sm") => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    const padding = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
    const textSize = size === "sm" ? "text-xs" : "text-sm";
    
    return (
      <span className={`inline-flex items-center gap-1.5 ${padding} rounded-full ${textSize} font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon size={size === "sm" ? 12 : 14} />
        {config.label}
      </span>
    );
  };

  const getSenderInfo = (collab) => {
    if (collab.created_by_role === "STORE") {
      return { type: "store", label: "Store", icon: Store, color: "blue", bgColor: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-700 dark:text-blue-300" };
    }
    return { type: "agency", label: "You", icon: User, color: "green", bgColor: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-700 dark:text-green-300" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading collaboration...</p>
        </div>
      </div>
    );
  }

  if (error || !collaboration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-300 mb-2">Error</h2>
            <p className="text-red-700 dark:text-red-400 mb-4">{error || "Collaboration not found"}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={fetchCollaboration} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
                Try Again
              </button>
              <Link to="/collaborations" className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition">
                Back to Collaborations
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isStoreRequest = collaboration.created_by_role === "STORE";
  const currentSender = getSenderInfo(collaboration);
  const needsAction = canRespond();

  return (
    <div className="max-w-6xl mx-auto space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link to="/collaborations" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </Link>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                    {collaboration.offer?.titre || "Collaboration"}
                  </h1>
                  {renderStatusBadge(collaboration.status, "md")}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                  ID: {collaboration.id?.slice(0, 8)}...
                </p>
              </div>
            </div>
            <button
              onClick={fetchCollaboration}
              className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              activeTab === "details"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Package size={14} className="inline mr-1" />
            Offer Details
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
              activeTab === "history"
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <History size={14} className="inline mr-1" />
            Complete History ({allThreadCollabs.length})
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "details" && (
              <>
                {/* Current Collaboration Card */}
                <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border overflow-hidden ${
                  needsAction ? 'border-l-4 border-l-yellow-500' : 'border-gray-200 dark:border-gray-800'
                }`}>
                  <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentSender.bgColor}`}>
                          <currentSender.icon size={16} className={`text-${currentSender.color}-600`} />
                        </div>
                        <span className={`text-sm font-medium ${currentSender.textColor}`}>
                          {currentSender.label} • {collaboration.kind === "initial" ? "Initial Request" : "Counter Offer"}
                        </span>
                      </div>
                      {renderStatusBadge(collaboration.status)}
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    {/* Message */}
                    {collaboration.message && (
                      <div className={`p-3 rounded-lg ${currentSender.bgColor}`}>
                        <p className={`text-sm italic ${currentSender.textColor}`}>
                          "{collaboration.message}"
                        </p>
                      </div>
                    )}
                    
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Proposed Price</span>
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(collaboration.price_finale, collaboration.currency)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Acceptance Status */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-xs text-gray-500">Store</span>
                        <div className="flex items-center gap-1">
                          {collaboration.accepted_by_store ? (
                            <>
                              <CheckCircle size={14} className="text-green-500" />
                              <span className="text-xs text-green-600">Accepted</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} className="text-yellow-500" />
                              <span className="text-xs text-yellow-600">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <span className="text-xs text-gray-500">You</span>
                        <div className="flex items-center gap-1">
                          {collaboration.accepted_by_provider ? (
                            <>
                              <CheckCircle size={14} className="text-green-500" />
                              <span className="text-xs text-green-600">Accepted</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} className="text-yellow-500" />
                              <span className="text-xs text-yellow-600">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Dates */}
                    <div className="pt-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between">
                        <span>Created: {formatDate(collaboration.created_at)}</span>
                        {collaboration.responded_at && (
                          <span>Responded: {formatDate(collaboration.responded_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offer Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Package size={18} className="text-blue-500" />
                      <h2 className="font-semibold text-gray-800 dark:text-white">Related Offer</h2>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 dark:text-white">{collaboration.offer?.titre}</h3>
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {collaboration.offer?.description || "No description"}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <DollarSign size={14} className="text-gray-400" />
                      <span className="font-medium">Base Price: {formatPrice(collaboration.offer?.prix, collaboration.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Store Info */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <Building2 size={18} className="text-blue-500" />
                      <h2 className="font-semibold text-gray-800 dark:text-white">Store Information</h2>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Store ID</p>
                      <p className="text-sm font-mono">{collaboration.store_id}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "history" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-blue-500" />
                    <h2 className="font-semibold text-gray-800 dark:text-white">Complete Thread History</h2>
                    <span className="text-xs text-gray-400">(Parent → Last)</span>
                  </div>
                </div>
                
                <div className="p-5">
                  {allThreadCollabs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <History size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>No history available</p>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                      
                      <div className="space-y-4">
                        {allThreadCollabs.map((collab, idx) => {
                          const isLast = idx === allThreadCollabs.length - 1;
                          const isFirst = idx === 0;
                          const sender = getSenderInfo(collab);
                          const isInitial = collab.kind === "initial";
                          const isCounter = collab.kind === "counter";
                          
                          return (
                            <div key={collab.id} className="relative flex gap-3">
                              {/* Timeline dot */}
                              <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${sender.bgColor}`}>
                                <sender.icon size={16} className={`text-${sender.color}-600`} />
                              </div>
                              
                              {/* Content */}
                              <div className={`flex-1 p-3 rounded-lg ${
                                isLast 
                                  ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm' 
                                  : 'bg-gray-50 dark:bg-gray-800/50'
                              }`}>
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-gray-500">
                                      {isInitial ? '📋 Initial Request' : isCounter ? `🔄 Counter Offer #${idx}` : `📝 Update #${idx}`}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${sender.bgColor} ${sender.textColor}`}>
                                      {sender.label}
                                    </span>
                                    {renderStatusBadge(collab.status, "sm")}
                                  </div>
                                  <span className="text-xs text-gray-400" title={formatDate(collab.created_at)}>
                                    {formatShortDate(collab.created_at)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-3 text-sm mb-2">
                                  <div className="flex items-center gap-1">
                                    <DollarSign size={12} className="text-gray-400" />
                                    <span className="font-semibold text-gray-800">
                                      {formatPrice(collab.price_finale, collab.currency)}
                                    </span>
                                  </div>
                                  {collab.accepted_by_store && (
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                      <Check size={10} /> Store accepted
                                    </span>
                                  )}
                                  {collab.accepted_by_provider && (
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                      <Check size={10} /> You accepted
                                    </span>
                                  )}
                                </div>
                                
                                {collab.message && (
                                  <div className={`p-2 rounded-lg text-sm ${sender.bgColor}`}>
                                    <p className={`italic ${sender.textColor}`}>"{collab.message}"</p>
                                  </div>
                                )}
                                
                                {/* Assignment sources */}
                                {collab.assignement_source && (
                                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                    <FileText size={10} />
                                    <span>Sources: {collab.assignement_source}</span>
                                  </div>
                                )}
                                
                                {/* Arrow indicator for flow */}
                                {!isLast && (
                                  <div className="mt-2 flex justify-center">
                                    <ArrowRight size={14} className="text-gray-300" />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Current Status Summary */}
                  <div className="mt-6 pt-4 text-center border-t border-gray-200 dark:border-gray-700">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      collaboration.status === "active" 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700' 
                        : collaboration.status === "pending" 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700'
                        : collaboration.status === "countered"
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600'
                    }`}>
                      <Info size={14} />
                      <span className="text-sm font-medium">
                        Current Status: {collaboration.status === "active" ? "✓ Active Collaboration" : 
                          collaboration.status === "pending" ? "⏳ Awaiting Response" : 
                          collaboration.status === "countered" ? "🔄 Counter Offer Sent" : 
                          collaboration.status === "rejected" ? "✗ Rejected" : collaboration.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Actions & Info */}
          <div className="space-y-6">
            {/* Current Offer Card */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg overflow-hidden">
              <div className="p-5">
                <p className="text-white/80 text-sm mb-1">Current Offer</p>
                <p className="text-3xl font-bold text-white">
                  {formatPrice(collaboration.price_finale, collaboration.currency)}
                </p>
                <p className="text-white/60 text-xs mt-2">
                  {collaboration.kind === "initial" ? "Initial proposal" : "Counter offer"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {needsAction && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-5">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Reply size={16} />
                    Respond to Request
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleResponse("accept")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      Accept Collaboration
                    </button>
                    <button
                      onClick={() => setShowCounterModal(true)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
                    >
                      <TrendingUp size={16} />
                      Make Counter Offer
                    </button>
                    <button
                      onClick={() => handleResponse("reject")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      Decline Request
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase">Provider Type</span>
                  <span className="text-sm font-medium">{collaboration.provider_type?.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase">Provider ID</span>
                  <span className="text-xs font-mono">{collaboration.provider_id?.slice(0, 12)}...</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase">Store Acceptance</span>
                  {collaboration.accepted_by_store ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Clock size={16} className="text-yellow-500" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase">Your Acceptance</span>
                  {collaboration.accepted_by_provider ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <Clock size={16} className="text-yellow-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Assignment Sources */}
            {collaboration.assignement_source && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-2">
                    <FileText size={12} />
                    Assignment Sources
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {collaboration.get_source_ids?.().map((source, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Counter Offer Modal */}
      {showCounterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Make Counter Offer</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Your Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    step="0.01"
                    value={counterPrice}
                    onChange={(e) => { setCounterPrice(e.target.value); setCounterError(""); }}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your price"
                  />
                </div>
                {counterError && <p className="text-xs text-red-500 mt-1">{counterError}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Explain your counter offer..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCounterModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResponse("counter", counterPrice, counterMessage)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send Counter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationDetails;