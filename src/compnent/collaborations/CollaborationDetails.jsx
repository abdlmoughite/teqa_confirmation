// CollaborationDetails.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Power,
  Zap,
  Shield,
  Star,
  Phone,
  Mail,
  MapPin,
  Globe,
  Sparkles,
  MinusCircle,
  AlarmClock,
  AlertTriangle,
} from "lucide-react";
import {
  ActivateCollaboration,
  DeactivateCollaboration,
  GetCollaboration,
  GetCollaborationThread,
  RespondToCollaboration,
  RequestCollaborationTermination,
  ConfirmCollaborationTermination,
} from "../../api/auth";
import { useToast } from "../../context/ToastContext";
import { usePublicEntities } from "../../hooks/usePublicEntities";

/* =========================================================
   CONSTANTS - Status Colors (Élégantes et distinctes)
========================================================= */

const STATUS_STYLES = {
  pending: {
    label: "Pending",
    icon: Clock,
    // Bordure latérale
    borderColor: "border-l-orange-400",
    // Badge
    badgeBg: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    badgeBorder: "border-orange-200 dark:border-orange-500/20",
    // Timeline dot
    dotBg: "bg-orange-500",
    dotBorder: "border-orange-200 dark:border-orange-500/30",
    // Texte
    textColor: "text-orange-700 dark:text-orange-400",
    // Gradients
    gradient: "from-orange-500/10 to-transparent",
    iconColor: "text-orange-500",
    // Background pour les messages
    messageBg: "bg-orange-50 dark:bg-orange-500/10",
    // Bouton gradient
    buttonGradient: "from-orange-500 to-amber-500"
  },
  active: {
    label: "Active",
    icon: CheckCircle,
    borderColor: "border-l-teal-500",
    badgeBg: "bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
    badgeBorder: "border-teal-200 dark:border-teal-500/20",
    dotBg: "bg-teal-500",
    dotBorder: "border-teal-200 dark:border-teal-500/30",
    textColor: "text-teal-700 dark:text-teal-400",
    gradient: "from-teal-500/10 to-transparent",
    iconColor: "text-teal-500",
    messageBg: "bg-teal-50 dark:bg-teal-500/10",
    buttonGradient: "from-teal-500 to-emerald-500"
  },
  inactive: {
    label: "Inactive",
    icon: Power,
    borderColor: "border-l-gray-400",
    badgeBg: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    badgeBorder: "border-gray-200 dark:border-gray-700",
    dotBg: "bg-gray-400",
    dotBorder: "border-gray-200 dark:border-gray-700",
    textColor: "text-gray-600 dark:text-gray-400",
    gradient: "from-gray-100/50 to-transparent",
    iconColor: "text-gray-400",
    messageBg: "bg-gray-50 dark:bg-gray-800/50",
    buttonGradient: "from-gray-500 to-gray-600"
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    borderColor: "border-l-rose-500",
    badgeBg: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    badgeBorder: "border-rose-200 dark:border-rose-500/20",
    dotBg: "bg-rose-500",
    dotBorder: "border-rose-200 dark:border-rose-500/30",
    textColor: "text-rose-700 dark:text-rose-400",
    gradient: "from-rose-500/10 to-transparent",
    iconColor: "text-rose-500",
    messageBg: "bg-rose-50 dark:bg-rose-500/10",
    buttonGradient: "from-rose-500 to-red-500"
  },
  countered: {
    label: "Countered",
    icon: TrendingUp,
    borderColor: "border-l-indigo-500",
    badgeBg: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
    badgeBorder: "border-indigo-200 dark:border-indigo-500/20",
    dotBg: "bg-indigo-500",
    dotBorder: "border-indigo-200 dark:border-indigo-500/30",
    textColor: "text-indigo-700 dark:text-indigo-400",
    gradient: "from-indigo-500/10 to-transparent",
    iconColor: "text-indigo-500",
    messageBg: "bg-indigo-50 dark:bg-indigo-500/10",
    buttonGradient: "from-indigo-500 to-purple-500"
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    borderColor: "border-l-stone-400",
    badgeBg: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
    badgeBorder: "border-stone-200 dark:border-stone-700",
    dotBg: "bg-stone-400",
    dotBorder: "border-stone-200 dark:border-stone-700",
    textColor: "text-stone-600 dark:text-stone-400",
    gradient: "from-stone-100/50 to-transparent",
    iconColor: "text-stone-400",
    messageBg: "bg-stone-50 dark:bg-stone-800/50",
    buttonGradient: "from-stone-500 to-stone-600"
  }
};

const getStatusStyle = (status) => {
  return STATUS_STYLES[status] || STATUS_STYLES.pending;
};

/* =========================================================
   COMPONENTS
========================================================= */

const ProfileLine = ({ label, value, icon: Icon }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800/60">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-gray-400" />}
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <span className="text-right font-medium text-gray-800 dark:text-gray-100">{value}</span>
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
  const unavailable = !entity;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                <User size={16} className="text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Profile Details</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-bold text-white shadow-md">
                {avatar ? <img src={avatar} alt={displayName} className="h-full w-full object-cover" /> : displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold text-gray-900 dark:text-white">{displayName}</p>
                <p className="truncate text-sm text-gray-500">{subtitle}</p>
              </div>
            </div>

            {unavailable ? (
              <div className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                Profile details are not available yet.
              </div>
            ) : (
              <div className="mt-5 space-y-2 text-sm">
                <ProfileLine label="Name" value={displayName} icon={User} />
                <ProfileLine label="Role" value={user.role?.replace("_", " ")} icon={Shield} />
                <ProfileLine label="Email" value={user.email} icon={Mail} />
                <ProfileLine label="Phone" value={user.phone_number} icon={Phone} />
                <ProfileLine label="City" value={user.city} icon={MapPin} />
                <ProfileLine label="Country" value={user.country} icon={Globe} />
                <ProfileLine label="Activity" value={profile.activity_sector || profile.industry || profile.skills} icon={Star} />
                <ProfileLine label="Status" value={profile.availability_status || (profile.is_verified_agency ? "Verified" : null)} icon={CheckCircle} />
                <ProfileLine label="Website" value={profile.website || profile.portfolio_url} icon={Globe} />
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-white font-medium shadow-sm hover:shadow-md transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* =========================================================
   TERMINATION MODAL
========================================================= */

const TERMINATION_REASONS = [
  { value: "voluntary_exit",      label: "Voluntary Exit" },
  { value: "breach_of_contract",  label: "Breach of Contract" },
  { value: "mutual_agreement",    label: "Mutual Agreement" },
  { value: "poor_performance",    label: "Poor Performance" },
  { value: "other",               label: "Other" },
];

const TerminationModal = ({ onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = () => {
    if (!reason) { setErr("Please select a reason"); return; }
    setErr("");
    onConfirm({ reason, note: note.trim() });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10">
            <AlertTriangle size={20} className="text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Termination</h3>
            <p className="text-xs text-gray-500">A 48h notice period will apply</p>
          </div>
          <button onClick={onClose} className="ml-auto p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
              <AlarmClock size={13} />
              Termination will be scheduled 48 hours from now. A penalty may apply per contract terms.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => { setReason(e.target.value); setErr(""); }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            >
              <option value="">Select a reason…</option>
              {TERMINATION_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Additional note <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Provide more context…"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
              Request Termination
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
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
  const [showTerminationModal, setShowTerminationModal] = useState(false);
  const [terminationLoading, setTerminationLoading] = useState(false);

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
      const response = await GetCollaboration(id);
      let collabData = response.data || response;
      collabData = {
        ...collabData,
        offer: collabData.offer_details || collabData.offer,
      };
      setCollaboration(collabData);

      if (collabData.offer?.prix) {
        setCounterPrice(collabData.offer.prix.toString());
      }

      const threadResponse = await GetCollaborationThread(collabData.id).catch(() => ({ data: null }));
      const threadItems = threadResponse.data?.items || [collabData];
      const threadCollabs = threadItems.map((threadItem) => ({
        ...threadItem,
        offer: threadItem.offer_details || threadItem.offer,
      }));

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

  const handleRequestTermination = async ({ reason, note }) => {
    if (!collaboration?.id) return;
    setTerminationLoading(true);
    try {
      await RequestCollaborationTermination(collaboration.id, { reason, note });
      setShowTerminationModal(false);
      await fetchCollaboration();
      toast.success("Termination request submitted. Scheduled in 48 hours.", "Termination scheduled");
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to request termination";
      toast.error(msg, "Termination failed");
    } finally {
      setTerminationLoading(false);
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
    const style = getStatusStyle(status);
    const Icon = style.icon;
    const padding = size === "sm" ? "px-2.5 py-1" : "px-3 py-1.5";
    const textSize = size === "sm" ? "text-xs" : "text-sm";

    return (
      <span className={`inline-flex items-center gap-1.5 ${padding} rounded-full ${textSize} font-medium border ${style.badgeBg} ${style.badgeBorder}`}>
        <Icon size={size === "sm" ? 12 : 14} className={style.iconColor} />
        {style.label}
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
      color: "emerald",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-700 dark:text-emerald-300",
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading collaboration...</p>
        </div>
      </div>
    );
  }

  if (error || !collaboration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-8 text-center">
            <AlertCircle size={48} className="text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-rose-800 dark:text-rose-300 mb-2">Error</h2>
            <p className="text-rose-700 dark:text-rose-400 mb-4">{error || "Collaboration not found"}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={fetchCollaboration} className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-lg transition shadow-sm">
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
  const providerAvatar = getEntityAvatar(collaboration.provider_type, collaboration.provider_id);
  const deactivatedByName = getEntityName(
    collaboration.deactivated_by_role,
    collaboration.deactivated_by_owner_id,
    collaboration.deactivated_by_role
  );
  const statusStyle = getStatusStyle(collaboration.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-6 px-4">
      <AnimatePresence>
        {showCounterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowCounterModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
            >
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                    <TrendingUp size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Make Counter Offer</h3>
                    <p className="text-xs text-gray-500">Propose a different price</p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Your Price <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="number"
                        step="0.01"
                        value={counterPrice}
                        onChange={(e) => { setCounterPrice(e.target.value); setCounterError(""); }}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Enter your price"
                      />
                    </div>
                    {counterError && <p className="text-xs text-red-500 mt-1.5">{counterError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={counterMessage}
                      onChange={(e) => setCounterMessage(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Explain your counter offer..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowCounterModal(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResponse("counter", counterPrice, counterMessage)}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      Send Counter
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <Link
              to="/collaborations"
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </Link>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                  {collaboration.offer?.titre || "Collaboration"}
                </h1>
                {renderStatusBadge(collaboration.status, "md")}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Store: {storeName} • Provider: {providerName}
              </p>
            </div>
          </div>
          <button
            onClick={fetchCollaboration}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "details"
                ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800"
            }`}
          >
            <Package size={14} />
            Offer Details
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800"
            }`}
          >
            <History size={14} />
            History ({allThreadCollabs.length})
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "details" && (
              <>
                {/* Current Collaboration Card */}
                <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-l-4 ${statusStyle.borderColor} border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300`}>
                  <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/30 dark:to-gray-900">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentSender.bgColor}`}>
                          <currentSender.icon size={16} className={`text-white`} />
                        </div>
                        <span className={`text-sm font-medium ${currentSender.textColor}`}>
                          {currentSender.label} • {collaboration.kind === "initial" ? "Initial Request" : "Counter Offer"}
                        </span>
                      </div>
                      {renderStatusBadge(collaboration.status)}
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {collaboration.message && (
                      <div className={`p-3 rounded-xl ${statusStyle.messageBg}`}>
                        <p className={`text-sm italic ${statusStyle.textColor}`}>
                          "{collaboration.message}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Proposed Price</span>
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                          {formatPrice(collaboration.price_finale, collaboration.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <span className="text-xs text-gray-500">Store</span>
                        <div className="flex items-center gap-1">
                          {collaboration.accepted_by_store ? (
                            <>
                              <CheckCircle size={14} className="text-teal-500" />
                              <span className="text-xs text-teal-600">Accepted</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} className="text-orange-500" />
                              <span className="text-xs text-orange-600">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <span className="text-xs text-gray-500">You</span>
                        <div className="flex items-center gap-1">
                          {collaboration.accepted_by_provider ? (
                            <>
                              <CheckCircle size={14} className="text-teal-500" />
                              <span className="text-xs text-teal-600">Accepted</span>
                            </>
                          ) : (
                            <>
                              <Clock size={14} className="text-orange-500" />
                              <span className="text-xs text-orange-600">Pending</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

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
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/30 dark:to-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                        <Package size={18} className="text-indigo-600" />
                      </div>
                      <h2 className="font-semibold text-gray-800 dark:text-white">Related Offer</h2>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">{collaboration.offer?.titre}</h3>
                    <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
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
                  <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/30 dark:to-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <Building2 size={18} className="text-white-600" />
                      </div>
                      <h2 className="font-semibold text-gray-800 dark:text-white">Store Information</h2>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 p-3">
                      <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-lg font-bold text-white shadow-md">
                        {storeAvatar ? (
                          <img src={storeAvatar} alt={storeName} className="h-full w-full object-cover" />
                        ) : (
                          storeName?.charAt(0).toUpperCase() || "S"
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">{storeName}</p>
                        <p className="truncate text-xs text-gray-500">{storeSubtitle}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProfileTarget({ type: "STORE", id: collaboration.store_id })}
                        className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-400 transition"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === "history" && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/30 dark:to-gray-900">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                      <History size={18} className="text-purple-600" />
                    </div>
                    <h2 className="font-semibold text-gray-800 dark:text-white">Complete History</h2>
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
                          const isStoreMessage = collab.created_by_role === "STORE";
                          const isInitial = collab.kind === "initial";
                          const sender = getSenderInfo(collab);
                          const itemStyle = getStatusStyle(collab.status);
                          const isCurrent = collab.id === collaboration.id;
                          const initials = (sender.label || collab.created_by_role || "C").slice(0, 2).toUpperCase();

                          return (
                            <div key={collab.id} className="relative flex gap-3">
                              {/* Timeline dot */}
                              <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${itemStyle.dotBorder} bg-white dark:bg-gray-900 shadow-md`}>
                                {sender.avatar ? (
                                  <img src={sender.avatar} alt={sender.label} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold">{initials}</span>
                                )}
                              </div>

                              {/* Content */}
                              <div className={`flex-1 p-4 rounded-xl border-l-4 ${itemStyle.borderColor} ${
                                isLast
                                  ? 'bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/30 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-md'
                                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                              }`}>
                                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-medium text-gray-500">
                                      {isInitial ? '📋 Initial Request' : `🔄 Counter Offer #${idx}`}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700">
                                      {sender.label}
                                    </span>
                                    {renderStatusBadge(collab.status, "sm")}
                                    {isCurrent && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Current</span>}
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
                                    <span className="text-xs text-teal-600 flex items-center gap-1">
                                      <Check size={10} /> Store accepted
                                    </span>
                                  )}
                                  {collab.accepted_by_provider && (
                                    <span className="text-xs text-teal-600 flex items-center gap-1">
                                      <Check size={10} /> You accepted
                                    </span>
                                  )}
                                </div>

                                {collab.message && (
                                  <div className={`p-2 rounded-lg text-sm ${itemStyle.messageBg}`}>
                                    <p className={`italic ${itemStyle.textColor}`}>"{collab.message}"</p>
                                  </div>
                                )}

                                {collab.assignement_source && (
                                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                    <FileText size={10} />
                                    <span>Sources: {collab.assignement_source}</span>
                                  </div>
                                )}

                                {!isLast && (
                                  <div className="mt-3 flex justify-center">
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
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusStyle.badgeBg} ${statusStyle.badgeBorder} shadow-sm`}>
                      <Info size={14} className={statusStyle.iconColor} />
                      <span className="text-sm font-medium">
                        Current Status: {collaboration.status === "active" ? "✓ Active Collaboration" :
                          collaboration.status === "pending" ? "⏳ Awaiting Response" :
                          collaboration.status === "countered" ? "🔄 Counter Offer Sent" :
                          collaboration.status === "rejected" ? "✗ Rejected" :
                          collaboration.status === "inactive" ? "⭘ Inactive" : collaboration.status}
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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg overflow-hidden">
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-5">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Reply size={16} />
                    Respond to Request
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleResponse("accept")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl transition-all font-medium shadow-sm"
                    >
                      <CheckCircle size={16} />
                      Accept Collaboration
                    </button>
                    <button
                      onClick={() => setShowCounterModal(true)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all font-medium shadow-sm"
                    >
                      <TrendingUp size={16} />
                      Make Counter Offer
                    </button>
                    <button
                      onClick={() => handleResponse("reject")}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white rounded-xl transition-all font-medium shadow-sm"
                    >
                      <XCircle size={16} />
                      Decline Request
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!needsAction && collaboration.status === "pending" && hasActiveInThread && (
              <div className="bg-orange-50 dark:bg-orange-500/10 rounded-2xl shadow-sm border border-orange-200 dark:border-orange-500/20 overflow-hidden">
                <div className="p-5">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2 flex items-center gap-2">
                    <CheckCircle size={16} />
                    Response Locked
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Another collaboration in this thread is already active.
                  </p>
                </div>
              </div>
            )}

            {collaboration.status === "active" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-5 space-y-2">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Power size={16} />
                    Manage Collaboration
                  </h3>
                  <button
                    onClick={handleDeactivate}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-all font-medium disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                    Deactivate Collaboration
                  </button>
                  {collaboration.termination_scheduled_at ? (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3 mt-1">
                      <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                        <AlarmClock size={13} />
                        <div>
                          <p className="font-semibold">Termination Scheduled</p>
                          <p className="opacity-80">{formatDate(collaboration.termination_scheduled_at)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowTerminationModal(true)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl transition-all font-medium disabled:opacity-60 border border-orange-200"
                    >
                      <AlertTriangle size={16} />
                      Request Termination
                    </button>
                  )}
                </div>
              </div>
            )}

            {collaboration.status === "inactive" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="p-5 space-y-2">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <Power size={16} />
                    Collaboration Inactive
                  </h3>
                  <p className="text-xs text-gray-500">This collaboration was deactivated.</p>
                  {collaboration.deactivated_at && (
                    <p className="text-xs text-gray-500">Deactivated at: {formatDate(collaboration.deactivated_at)}</p>
                  )}
                  <button
                    onClick={handleActivate}
                    disabled={actionLoading}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl transition-all font-medium disabled:opacity-60"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    Reactivate Collaboration
                  </button>
                </div>
              </div>
            )}

            {/* Message Button */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-5">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <MessageSquare size={16} />
                  Messaging
                </h3>
                <Link
                  to={`/messages?receiver_type=STORE&receiver_id=${collaboration.store_id}&collaboration_id=${collaboration.id}&offer_id=${collaboration.offer?.id || ""}&subject=${encodeURIComponent(collaboration.offer?.titre || "Collaboration chat")}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white rounded-xl transition-all font-medium shadow-sm"
                >
                  <MessageSquare size={16} />
                  Open Conversation
                </Link>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/30 dark:to-gray-900">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-gray-500/10 to-gray-600/10">
                    <Info size={16} className="text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Information</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase">Provider Type</span>
                  <span className="text-sm font-medium">{collaboration.provider_type?.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase">Provider</span>
                  <div className="text-right">
                    <span className="text-xs font-medium">{providerName}</span>
                    <p className="text-[11px] text-gray-400">{providerSubtitle}</p>
                    <button
                      type="button"
                      onClick={() => setProfileTarget({ type: collaboration.provider_type, id: collaboration.provider_id })}
                      className="mt-1 rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase">Store Acceptance</span>
                  {collaboration.accepted_by_store ? (
                    <CheckCircle size={16} className="text-teal-500" />
                  ) : (
                    <Clock size={16} className="text-orange-500" />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 uppercase">Your Acceptance</span>
                  {collaboration.accepted_by_provider ? (
                    <CheckCircle size={16} className="text-teal-500" />
                  ) : (
                    <Clock size={16} className="text-orange-500" />
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
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/30 dark:to-gray-900">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                      <FileText size={16} className="text-amber-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Assignment Sources</h4>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {collaboration.assignement_source?.split(",").map((source, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg font-mono">
                        {source.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {profileTarget && (
          <PublicEntityProfileModal
            target={profileTarget}
            entity={profileTarget ? getEntity(profileTarget.type, profileTarget.id) : null}
            fallbackName={profileTarget ? getEntityName(profileTarget.type, profileTarget.id) : ""}
            onClose={() => setProfileTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Termination Modal */}
      <AnimatePresence>
        {showTerminationModal && (
          <TerminationModal
            onClose={() => setShowTerminationModal(false)}
            onConfirm={handleRequestTermination}
            loading={terminationLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollaborationDetails;