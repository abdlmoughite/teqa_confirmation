// CollaborationDetails.jsx
import { useState, useEffect, useMemo } from "react";
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
  X,
  Power
} from "lucide-react";
import {
  ActivateCollaboration,
  DeactivateCollaboration,
  GetCollaboration,
  GetCollaborationThread,
  RespondToCollaboration,
} from "../../api/auth";
import { useToast } from "../../context/ToastContext";
import { usePublicEntities } from "../../hooks/usePublicEntities";

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
  inactive: {
    label: "Inactive",
    color: "orange",
    icon: Power,
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
    textColor: "text-orange-700 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800"
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
  const toast = useToast();
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
  const [actionableCollabId, setActionableCollabId] = useState(null);
  const [profileTarget, setProfileTarget] = useState(null);

  const publicEntityRefs = useMemo(() => {
    const refs = [];
    if (collaboration) {
      refs.push(
        { type: "STORE", id: collaboration.store_id },
        { type: collaboration.provider_type, id: collaboration.provider_id },
        {
          type: collaboration.deactivated_by_role,
          id: collaboration.deactivated_by_owner_id,
        }
      );
    }
    allThreadCollabs.forEach((item) => {
      refs.push({
        type: item.created_by_role === "STORE" ? "STORE" : item.provider_type,
        id: item.created_by_role === "STORE" ? item.store_id : item.provider_id,
      });
    });
    return refs;
  }, [allThreadCollabs, collaboration]);

  const { getEntity, getEntityName, getEntitySubtitle, getEntityAvatar } = usePublicEntities(publicEntityRefs);

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
      collabData = {
        ...collabData,
        offer: collabData.offer_details || collabData.offer,
      };
      setCollaboration(collabData);
      
      // Set initial counter price from offer
      if (collabData.offer?.prix) {
        setCounterPrice(collabData.offer.prix.toString());
      }
      
      const threadResponse = await GetCollaborationThread(collabData.id).catch(() => ({ data: null }));
      const threadItems = threadResponse.data?.items || [collabData];
      const threadCollabs = threadItems.map((threadItem) => ({
        ...threadItem,
        offer: threadItem.offer_details || threadItem.offer,
      }));
      
      // Sort by date (oldest first for timeline)
      threadCollabs.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateA - dateB;
      });
      
      setAllThreadCollabs(threadCollabs);

      const latestPending = [...threadCollabs].reverse().find((item) => item.status === "pending");
      if (collabData.status === "pending") {
        setActionableCollabId(collabData.id);
      } else if (latestPending) {
        setActionableCollabId(latestPending.id);
      } else {
        setActionableCollabId(null);
      }
      
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn("Error fetching collaboration:", err);
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
    const hasActiveInThread = allThreadCollabs.some((item) => item.status === "active");
    if (hasActiveInThread) {
      setError("Une collaboration de ce groupe est déjà active. Vous ne pouvez plus répondre aux autres demandes.");
      return;
    }

    const targetCollabId = actionableCollabId || collaboration?.id;
    if (!targetCollabId) {
      setError("No actionable collaboration found.");
      return;
    }

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
        if (!message || !message.trim()) {
          setCounterError("Please add a message for your counter offer");
          setActionLoading(false);
          return;
        }
        payload.price_finale = parseFloat(priceFinale);
        payload.message = message.trim();
      }
      
      await RespondToCollaboration(targetCollabId, payload);
      await fetchCollaboration();
      
      if (action === "counter") {
        setShowCounterModal(false);
        setCounterMessage("");
        setCounterError("");
      }
      toast.success(
        action === "counter" ? "Counter offer sent." : `Collaboration ${action}ed successfully.`,
        "Response saved"
      );
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn("Error responding:", err);
      const message = err.response?.data?.detail || err.message || "Failed to process response";
      setError(message);
      toast.error(message, "Response failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!collaboration?.id || collaboration.status !== "active") {
      return;
    }

    setActionLoading(true);
    try {
      await DeactivateCollaboration(collaboration.id);
      await fetchCollaboration();
      toast.success("Collaboration deactivated.", "Status updated");
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to deactivate collaboration";
      setError(message);
      toast.error(message, "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!collaboration?.id || collaboration.status !== "inactive") {
      return;
    }

    setActionLoading(true);
    try {
      await ActivateCollaboration(collaboration.id);
      await fetchCollaboration();
      toast.success("Collaboration reactivated.", "Status updated");
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to activate collaboration";
      setError(message);
      toast.error(message, "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  /* =========================================================
     UTILITIES
  ========================================================= */
  const canRespond = () => {
    const hasActiveInThread = allThreadCollabs.some((item) => item.status === "active");
    return Boolean(actionableCollabId) && !hasActiveInThread;
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
      return {
        type: "store",
        label: getEntityName("STORE", collab.store_id, "Store"),
        subtitle: getEntitySubtitle("STORE", collab.store_id, "Store"),
        avatar: getEntityAvatar("STORE", collab.store_id),
        icon: Store,
        color: "blue",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-700 dark:text-blue-300",
      };
    }
    return {
      type: "agency",
      label: getEntityName(collab.provider_type, collab.provider_id, "Provider"),
      subtitle: getEntitySubtitle(collab.provider_type, collab.provider_id, "Provider"),
      avatar: getEntityAvatar(collab.provider_type, collab.provider_id),
      icon: User,
      color: "green",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-700 dark:text-green-300",
    };
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
  const hasActiveInThread = allThreadCollabs.some((item) => item.status === "active");
  const storeName = getEntityName("STORE", collaboration.store_id, "Store");
  const storeSubtitle = getEntitySubtitle("STORE", collaboration.store_id, "Store");
  const storeAvatar = getEntityAvatar("STORE", collaboration.store_id);
  const providerName = getEntityName(collaboration.provider_type, collaboration.provider_id, "Provider");
  const providerSubtitle = getEntitySubtitle(collaboration.provider_type, collaboration.provider_id, collaboration.provider_type?.replace("_", " "));
  const deactivatedByName = getEntityName(
    collaboration.deactivated_by_role,
    collaboration.deactivated_by_owner_id,
    collaboration.deactivated_by_role
  );

  return (
    <div className="page-shell px-1 py-2">
      {/* Header */}
      <div className="page-header-card sticky top-0 z-10">
        <div className="px-1 py-1">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Link to="/collaborations" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <ArrowLeft size={20} className="text-white dark:text-black" />
              </Link>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                    {collaboration.offer?.titre || "Collaboration"}
                  </h1>
                  {renderStatusBadge(collaboration.status, "md")}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Store: {storeName} - Provider: {providerName}
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

      <div className="px-1 py-2">
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
                    <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                      <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg bg-blue-100 text-sm font-semibold text-blue-700">
                        {storeAvatar ? (
                          <img src={storeAvatar} alt={storeName} className="h-full w-full object-cover" />
                        ) : (
                          storeName?.charAt(0) || "S"
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{storeName}</p>
                        <p className="truncate text-xs text-gray-500">{storeSubtitle}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfileTarget({ type: "STORE", id: collaboration.store_id })}
                        className="ml-auto rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "history" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="card-header">
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-primary-600 dark:text-primary-400" />
                    <h2 className="font-semibold text-app-strong">Historique complet COD</h2>
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
                    <div className="space-y-4">
                      <div className="space-y-4">
                        {allThreadCollabs.map((collab, idx) => {
                          const isLast = idx === allThreadCollabs.length - 1;
                          const isFirst = idx === 0;
                          const sender = getSenderInfo(collab);
                          const isInitial = collab.kind === "initial";
                          const isCounter = collab.kind === "counter";
                          const isCurrent = collab.id === collaboration.id;
                          const initials = (sender.label || collab.created_by_role || "C").slice(0, 2).toUpperCase();
                          
                          return (
                            <div key={collab.id} className={`collab-timeline-item ${isCurrent ? "current" : ""}`}>
                              {/* Timeline dot */}
                              <div className="profile-avatar-initials !h-9 !w-9 !overflow-hidden !rounded-full !text-xs">
                                {sender.avatar ? (
                                  <img src={sender.avatar} alt={sender.label} className="h-full w-full object-cover" />
                                ) : (
                                  initials
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 rounded-[var(--radius-lg)] border border-app bg-app-surface p-4 shadow-card">
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-gray-500">
                                      {isInitial ? '📋 Initial Request' : isCounter ? `🔄 Counter Offer #${idx}` : `📝 Update #${idx}`}
                                    </span>
                                    <span className="badge badge-primary">{isFirst ? `Root parent: ${sender.label}` : sender.label}</span>
                                    {renderStatusBadge(collab.status, "sm")}
                                    {isCurrent ? <span className="badge badge-info">Actuelle</span> : null}
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
                        : collaboration.status === "inactive"
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700'
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
              <div className="card">
                <div className="card-body">
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

            {!needsAction && collaboration.status === "pending" && hasActiveInThread && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl shadow-sm border border-amber-200 dark:border-amber-800 overflow-hidden">
                <div className="p-5">
                  <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} />
                    Réponse verrouillée
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Une autre collaboration de ce groupe parent est déjà active.
                  </p>
                </div>
              </div>
            )}

            {collaboration.status === "active" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-5">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Power size={16} />
                    Gestion collaboration
                  </h3>
                  <button
                    onClick={handleDeactivate}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                    Désactiver cette collaboration active
                  </button>
                </div>
              </div>
            )}

            {collaboration.status === "inactive" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-orange-200 dark:border-orange-800 overflow-hidden">
                <div className="p-5 space-y-2">
                  <h3 className="font-semibold text-orange-700 dark:text-orange-300 mb-1 flex items-center gap-2">
                    <Power size={16} />
                    Collaboration inactive
                  </h3>
                  <p className="text-xs text-gray-500">
                    This collaboration was deactivated.
                  </p>
                  {collaboration.deactivated_at && (
                    <p className="text-xs text-gray-500">
                      Deactivated at: {formatDate(collaboration.deactivated_at)}
                    </p>
                  )}
                  <button
                    onClick={handleActivate}
                    disabled={actionLoading}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Réactiver cette collaboration
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Messagerie
                </h3>
                <Link
                  to={`/messages?receiver_type=STORE&receiver_id=${collaboration.store_id}&collaboration_id=${collaboration.id}&offer_id=${collaboration.offer?.id || ""}&subject=${encodeURIComponent(collaboration.offer?.titre || "Collaboration chat")}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition"
                >
                  <MessageSquare size={16} />
                  Ouvrir la conversation
                </Link>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase">Provider Type</span>
                  <span className="text-sm font-medium">{collaboration.provider_type?.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase">Provider</span>
                  <span className="text-right text-xs font-medium">
                    {providerName}
                    <span className="block text-[11px] text-gray-400">{providerSubtitle}</span>
                    <button
                      type="button"
                      onClick={() => setProfileTarget({ type: collaboration.provider_type, id: collaboration.provider_id })}
                      className="mt-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
                    >
                      View
                    </button>
                  </span>
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
                {collaboration.deactivated_by_role && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 uppercase">Deactivated By</span>
                    <span className="text-right text-xs font-medium">
                      {deactivatedByName}
                      <span className="block text-[11px] text-gray-400">{collaboration.deactivated_by_role}</span>
                    </span>
                  </div>
                )}
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
                    {(collaboration.source_ids || []).map((source, idx) => (
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
      <PublicEntityProfileModal
        target={profileTarget}
        entity={profileTarget ? getEntity(profileTarget.type, profileTarget.id) : null}
        fallbackName={profileTarget ? getEntityName(profileTarget.type, profileTarget.id) : ""}
        onClose={() => setProfileTarget(null)}
      />

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
                  Message <span className="text-red-500">*</span>
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

const PublicEntityProfileModal = ({ target, entity, fallbackName, onClose }) => {
  if (!target) return null;

  const profile = entity?.profile || {};
  const user = entity?.user || {};
  const displayName = entity?.display_name || fallbackName || "Profile";
  const subtitle = entity?.subtitle || user.role?.replace("_", " ") || "Profile";
  const avatar = entity?.avatar || user.avatar;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            Close
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
              {avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : displayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-gray-900 dark:text-white">{displayName}</p>
              <p className="truncate text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>

          {!entity ? (
            <div className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
              Profile details are not available yet.
            </div>
          ) : (
            <div className="mt-5 space-y-3 text-sm">
              <ProfileLine label="Name" value={displayName} />
              <ProfileLine label="Role" value={user.role?.replace("_", " ")} />
              <ProfileLine label="City" value={user.city} />
              <ProfileLine label="Country" value={user.country} />
              <ProfileLine label="Activity" value={profile.activity_sector || profile.industry || profile.skills} />
              <ProfileLine label="Status" value={profile.availability_status || (profile.is_verified_agency ? "Verified" : null)} />
              <ProfileLine label="Website" value={profile.website || profile.portfolio_url} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileLine = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-800 dark:text-gray-100">{value}</span>
    </div>
  );
};

export default CollaborationDetails;
