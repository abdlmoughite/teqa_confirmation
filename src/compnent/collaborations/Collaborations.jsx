// AgencyCollaborations.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Handshake,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  DollarSign,
  Calendar,
  TrendingUp,
  Bell,
  Building2,
  ChevronDown,
  ChevronUp,
  History,
  MessageCircle,
  User,
  Store,
  ArrowRight,
  Reply,
  Send
} from "lucide-react";
import { GetCollaborations } from "../../api/auth";

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

const ITEMS_PER_PAGE = 8;

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AgencyCollaborations = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [groupedCollabs, setGroupedCollabs] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  /* =========================================================
     FETCH COLLABORATIONS
  ========================================================= */
  const fetchCollaborations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      
      const response = await GetCollaborations(params);
      
      let collabData = [];
      if (response.data?.results) {
        collabData = response.data.results;
      } else if (Array.isArray(response.data)) {
        collabData = response.data;
      } else if (response.data?.data) {
        collabData = response.data.data;
      } else if (Array.isArray(response)) {
        collabData = response;
      }
      
      setCollaborations(collabData);
      groupCollaborations(collabData);
      
    } catch (err) {
      console.error("Error fetching collaborations:", err);
      setError(err.response?.data?.message || "Failed to load collaborations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, [statusFilter]);

  /* =========================================================
     GROUP COLLABORATIONS
  ========================================================= */
  const groupCollaborations = (data) => {
    if (!data || data.length === 0) {
      setGroupedCollabs([]);
      return;
    }
    
    const groups = new Map();
    
    data.forEach(collab => {
      let rootId = null;
      
      if (collab.root_collaboration) {
        if (typeof collab.root_collaboration === 'object') {
          rootId = collab.root_collaboration.id;
        } else if (typeof collab.root_collaboration === 'string') {
          rootId = collab.root_collaboration;
        }
      }
      
      if (!rootId) {
        rootId = collab.id;
      }
      
      if (!groups.has(rootId)) {
        groups.set(rootId, {
          rootId: rootId,
          allCollabs: [],
          lastActivity: collab.updated_at || collab.created_at,
          status: collab.status,
          offer: collab.offer,
          storeId: collab.store_id,
          latestMessage: collab.message,
          latestPrice: collab.price_finale,
          currency: collab.currency,
          createdByRole: collab.created_by_role,
          createdByUserId: collab.created_by_user_id
        });
      }
      
      const group = groups.get(rootId);
      group.allCollabs.push(collab);
      
      const collabDate = collab.updated_at || collab.created_at;
      if (collabDate > group.lastActivity) {
        group.lastActivity = collabDate;
        group.status = collab.status;
        group.latestMessage = collab.message;
        group.latestPrice = collab.price_finale;
        group.currency = collab.currency;
      }
    });
    
    groups.forEach(group => {
      group.allCollabs.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateA - dateB; // Oldest first for history
      });
    });
    
    let groupsArray = Array.from(groups.values());
    groupsArray.sort((a, b) => {
      const dateA = new Date(a.lastActivity);
      const dateB = new Date(b.lastActivity);
      return dateB - dateA;
    });
    
    setGroupedCollabs(groupsArray);
    
    const expandedState = {};
    groupsArray.forEach(group => {
      expandedState[group.rootId] = false;
    });
    setExpandedGroups(expandedState);
  };

  const toggleGroup = (rootId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [rootId]: !prev[rootId]
    }));
  };

  /* =========================================================
     FILTERS
  ========================================================= */
  const filteredGroups = groupedCollabs.filter(group => {
    const matchesSearch = 
      group.offer?.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.latestMessage?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Type filter: all, my_responses (created by me), store_requests (created by store)
    let matchesType = true;
    if (typeFilter === "my_responses") {
      matchesType = group.createdByRole === "AGENCY_OWNER" || group.createdByRole === "AGENCY_AGENT";
    } else if (typeFilter === "store_requests") {
      matchesType = group.createdByRole === "STORE";
    }
    
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* =========================================================
     UTILITIES
  ========================================================= */
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

  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const needsAction = (status) => {
    return status === "pending" || status === "countered";
  };

  const getSenderInfo = (collab) => {
    if (collab.created_by_role === "STORE") {
      return { type: "store", label: "Store Request", icon: Store, color: "blue" };
    }
    return { type: "agency", label: "Your Response", icon: User, color: "green" };
  };

  const stats = {
    total: groupedCollabs.length,
    pending: groupedCollabs.filter(g => needsAction(g.status)).length,
    active: groupedCollabs.filter(g => g.status === "active").length,
    countered: groupedCollabs.filter(g => g.status === "countered").length,
    rejected: groupedCollabs.filter(g => g.status === "rejected").length,
    myResponses: groupedCollabs.filter(g => g.createdByRole === "AGENCY_OWNER" || g.createdByRole === "AGENCY_AGENT").length,
    storeRequests: groupedCollabs.filter(g => g.createdByRole === "STORE").length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 w-11/12 centered mx-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Handshake size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Collaborations</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage collaboration threads with stores</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Bell size={14} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                  {stats.pending} pending action{stats.pending !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">Need Action</p>
            <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">Countered</p>
            <p className="text-xl font-bold text-purple-600">{stats.countered}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">Rejected</p>
            <p className="text-xl font-bold text-red-600">{stats.rejected}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">Your Resp.</p>
            <p className="text-xl font-bold text-green-600">{stats.myResponses}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500">Store Req.</p>
            <p className="text-xl font-bold text-blue-600">{stats.storeRequests}</p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by offer title..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="store_requests">📋 Store Requests</option>
                <option value="my_responses">✏️ Your Responses</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="countered">Countered</option>
                <option value="rejected">Rejected</option>
              </select>
              
              <button
                onClick={fetchCollaborations}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-600">✕</button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={36} className="animate-spin text-blue-500 mb-3" />
            <p className="text-gray-500 text-sm">Loading collaborations...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredGroups.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 p-12 text-center">
            <Handshake size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No collaborations found</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm ? "Try adjusting your search" : "When stores request collaboration, threads will appear here"}
            </p>
          </div>
        )}

        {/* Threads List */}
        {!loading && !error && filteredGroups.length > 0 && (
          <div className="space-y-4">
            {paginatedGroups.map((group) => {
              const isExpanded = expandedGroups[group.rootId];
              const threadCount = group.allCollabs.length;
              const needsUserAction = needsAction(group.status);
              const isStoreRequest = group.createdByRole === "STORE";
              
              return (
                <div
                  key={group.rootId}
                  className={`bg-white dark:bg-gray-900 rounded-xl border transition-all ${
                    needsUserAction 
                      ? 'border-l-4 border-l-yellow-500 shadow-md' 
                      : 'border-gray-200 dark:border-gray-800'
                  } ${isStoreRequest ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
                >
                  {/* Main Card */}
                  <div className="p-4">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Type Badge */}
                        <div className="flex items-center gap-2 mb-2">
                          {isStoreRequest ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
                              <Store size={10} />
                              Store Request
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                              <User size={10} />
                              Your Response
                            </span>
                          )}
                          {renderStatusBadge(group.status)}
                          {threadCount > 1 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                              <History size={10} />
                              {threadCount} exchanges
                            </span>
                          )}
                        </div>
                        
                        {/* Offer Title */}
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {group.offer?.titre || "—"}
                        </h3>
                        
                        {/* Store Info */}
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                          <Building2 size={10} />
                          <span>Store: {group.storeId?.slice(0, 12)}...</span>
                        </div>
                        
                        {/* Latest Message */}
                        {group.latestMessage && (
                          <div className="mt-2 flex items-start gap-1.5">
                            <MessageCircle size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                              "{group.latestMessage}"
                            </p>
                          </div>
                        )}
                        
                        {/* Price & Date */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <DollarSign size={12} />
                            <span className="font-medium text-gray-700">{formatPrice(group.latestPrice, group.currency)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>Updated {formatDate(group.lastActivity)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {needsUserAction && (
                          <Link
                            to={`/collaboration/${group.rootId}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition"
                          >
                            <Reply size={12} />
                            Respond
                          </Link>
                        )}
                        
                        {!needsUserAction && (group.status === "active" || group.status === "rejected") && (
                          <Link
                            to={`/collaboration/${group.rootId}`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition"
                          >
                            <Eye size={12} />
                            View
                          </Link>
                        )}
                        
                        {threadCount > 1 && (
                          <button
                            onClick={() => toggleGroup(group.rootId)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded History - Timeline from Parent to Last */}
                  {isExpanded && threadCount > 1 && (
                    <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 rounded-b-xl">
                      <div className="p-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
                          <History size={12} />
                          Complete History (Parent → Last)
                        </h4>
                        
                        <div className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                          
                          <div className="space-y-4">
                            {group.allCollabs.map((collab, idx) => {
                              const isLast = idx === group.allCollabs.length - 1;
                              const isFirst = idx === 0;
                              const isStoreMessage = collab.created_by_role === "STORE";
                              const isAgencyMessage = collab.created_by_role === "AGENCY_OWNER" || collab.created_by_role === "AGENCY_AGENT";
                              const isInitial = collab.kind === "initial";
                              
                              return (
                                <div key={collab.id} className="relative flex gap-3">
                                  {/* Timeline dot */}
                                  <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                    isStoreMessage 
                                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                                      : 'bg-green-100 dark:bg-green-900/30'
                                  }`}>
                                    {isStoreMessage ? (
                                      <Store size={16} className="text-blue-600" />
                                    ) : (
                                      <User size={16} className="text-green-600" />
                                    )}
                                  </div>
                                  
                                  {/* Content */}
                                  <div className={`flex-1 p-3 rounded-lg ${
                                    isLast 
                                      ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm' 
                                      : 'bg-gray-100 dark:bg-gray-800/50'
                                  }`}>
                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-500">
                                          {isInitial ? '📋 Initial Request' : `🔄 Counter Offer #${idx}`}
                                        </span>
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                                          isStoreMessage 
                                            ? 'bg-blue-100 text-blue-700' 
                                            : 'bg-green-100 text-green-700'
                                        }`}>
                                          {isStoreMessage ? 'Store' : 'You'}
                                        </span>
                                        {renderStatusBadge(collab.status)}
                                      </div>
                                      <span className="text-xs text-gray-400">
                                        {formatDate(collab.created_at)}
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
                                          <CheckCircle size={10} /> Store accepted
                                        </span>
                                      )}
                                      {collab.accepted_by_provider && (
                                        <span className="text-xs text-green-600 flex items-center gap-1">
                                          <CheckCircle size={10} /> You accepted
                                        </span>
                                      )}
                                    </div>
                                    
                                    {collab.message && (
                                      <div className={`p-2 rounded-lg text-sm ${
                                        isStoreMessage 
                                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                                          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                      }`}>
                                        <p className="italic">"{collab.message}"</p>
                                      </div>
                                    )}
                                    
                                    {/* Arrow indicator for flow */}
                                    {!isLast && (
                                      <div className="mt-2 flex justify-end">
                                        <ArrowRight size={12} className="text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Current Status */}
                        <div className="mt-4 pt-3 text-center border-t border-gray-200 dark:border-gray-700">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                            <Send size={12} className="text-gray-500" />
                            <span className="text-xs text-gray-600">
                              Current Status: {group.status === "active" ? "✓ Active Collaboration" : group.status === "pending" ? "⏳ Awaiting Response" : group.status === "countered" ? "🔄 Counter Offer Sent" : "✗ " + group.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-gray-500">
              {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredGroups.length)} of {filteredGroups.length} threads
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border disabled:opacity-50"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm">{currentPage}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyCollaborations;