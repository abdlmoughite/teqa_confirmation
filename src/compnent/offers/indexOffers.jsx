// ListOffers.jsx - Version améliorée
import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Archive,
  DollarSign,
  Calendar,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Clock,
  Maximize2,
  FileText,
  User,
  Building2
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { isProviderRole } from "../../config/permissions";
import {
  DeleteOffer,
  GetMarketplaceOffers,
  GetMyOffers,
  GetOfferStats,
  GetOffers,
  UpdateOfferStatus,
} from "../../api/auth";

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_CONFIG = {
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
    color: "gray", 
    icon: XCircle,
    bgColor: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-600 dark:text-gray-400",
    borderColor: "border-gray-200 dark:border-gray-700"
  },
  archived: { 
    label: "Archived", 
    color: "yellow", 
    icon: Archive,
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-700 dark:text-yellow-400",
    borderColor: "border-yellow-200 dark:border-yellow-800"
  }
};

const PROVIDER_CONFIG = {
  AGENCY_OWNER: { label: "Agency Owner", icon: Building2, color: "blue" },
  AGENCY_AGENT: { label: "Agency Agent", icon: User, color: "purple" }
};

const ITEMS_PER_PAGE = 10;

/* =========================================================
   TRUNCATE TEXT UTILITY
========================================================= */

const truncateText = (text, maxLength = 80) => {
  if (!text) return "—";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ListOffers = () => {
  const { hasAnyPermission, hasPermission, user } = useContext(AuthContext);
  const toast = useToast();
  const [offers, setOffers] = useState([]);
  const [serverStats, setServerStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [hoveredTitle, setHoveredTitle] = useState(null);
  const canCreateOffer = hasPermission("offers.create");
  const canUpdateOffer = hasAnyPermission(["offers.update", "offers.update_own", "offers.update_agency"]);
  const canDeleteOffer = hasAnyPermission(["offers.delete", "offers.delete_own", "offers.delete_agency"]);
  const canChangeStatus = hasAnyPermission(["offers.change_status", "offers.update", "offers.update_own", "offers.update_agency"]);
  const providerWorkspace = isProviderRole(user?.role);

  /* =========================================================
     FETCH OFFERS
  ========================================================= */
  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (statusFilter !== "all") params.status = statusFilter;

      const response = providerWorkspace
        ? await GetMyOffers(params)
        : hasPermission("offers.view_marketplace")
          ? await GetMarketplaceOffers(params)
          : await GetOffers(params);
      const statsPromise = GetOfferStats().catch(() => ({ data: null }));
      let offersData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          offersData = response.data;
        } else if (response.data.results && Array.isArray(response.data.results)) {
          offersData = response.data.results;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          offersData = response.data.data;
        } else {
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              offersData = response.data[key];
              break;
            }
          }
        }
      }
      
      setOffers(offersData);
      const statsResponse = await statsPromise;
      if (statsResponse.data?.success) {
        setServerStats(statsResponse.data);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn("Error fetching offers:", err);
      const message = err.response?.data?.message || err.message || "Failed to load offers";
      setError(message);
      toast.error(message, "Offers unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  /* =========================================================
     FILTER & SORT OFFERS
  ========================================================= */
  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          offer.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || offer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedOffers = [...filteredOffers].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === "prix") {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    }
    
    if (sortField === "created_at") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (sortField === "titre") {
      aVal = aVal?.toLowerCase() || "";
      bVal = bVal?.toLowerCase() || "";
    }
    
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedOffers.length / ITEMS_PER_PAGE);
  const paginatedOffers = sortedOffers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* =========================================================
     HANDLERS
  ========================================================= */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleDelete = async () => {
    if (!selectedOffer) return;
    
    setActionLoading(true);
    try {
      await DeleteOffer(selectedOffer.id);
      await fetchOffers();
      toast.success("Offer deleted successfully.", "Offer removed");
      setShowDeleteModal(false);
      setSelectedOffer(null);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn("Error deleting offer:", err);
      const message = err.response?.data?.message || err.message || "Failed to delete offer";
      setError(message);
      toast.error(message, "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedOffer || !newStatus) return;
    
    setActionLoading(true);
    try {
      await UpdateOfferStatus(selectedOffer.id, newStatus);
      await fetchOffers();
      toast.success(`Offer status changed to ${newStatus}.`, "Status updated");
      setShowStatusModal(false);
      setSelectedOffer(null);
      setNewStatus("");
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.warn("Error updating status:", err);
      const message = err.response?.data?.message || err.message || "Failed to update status";
      setError(message);
      toast.error(message, "Status update failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTitleMouseEnter = (title) => {
    if (title && title.length > 40) {
      setHoveredTitle(title);
    }
  };

  const handleTitleMouseLeave = () => {
    setHoveredTitle(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatFullDate = (dateString) => {
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
     RENDERERS
  ========================================================= */
  const renderStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.inactive;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const renderProviderBadge = (providerType) => {
    const config = PROVIDER_CONFIG[providerType] || { label: providerType?.replace("_", " ") || "Unknown", icon: User, color: "gray" };
    const Icon = config.icon;
    const colorClasses = {
      blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      purple: "bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      gray: "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700"
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium border ${colorClasses[config.color]}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const renderDescriptionPreview = (description) => {
    if (!description) return "—";
    const truncated = truncateText(description, 60);
    const isLong = description.length > 60;
    
    return (
      <div className="flex items-start gap-2">
        <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {truncated}
          </p>
        </div>
        {isLong && (
          <button
            onClick={() => {
              setSelectedOffer({ ...selectedOffer, description });
              setShowDescriptionModal(true);
            }}
            className="text-blue-500 hover:text-blue-600 text-xs font-medium flex items-center gap-1 flex-shrink-0"
          >
            <Maximize2 size={12} />
            View
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="page-shell px-1 py-2">
      <div>
        {/* Header */}
        <div className="page-header-card mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="eyebrow">Catalog and pricing</p>
              <h1 className="mt-4 text-3xl font-bold text-primary">
                My Offers
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Manage and track all your marketplace offers
              </p>
            </div>
            {canCreateOffer ? (
              <Link
                to="/create-offer"
                className="btn-primary"
              >
                <Plus size={18} />
                Create Offer
              </Link>
            ) : null}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-[1.5rem] border border-red-200 bg-red-50 p-4 animate-slide-down">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
              <div>
                <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="toolbar-card mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search offers by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="field-input py-2 pl-10 pr-4"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="field-select px-4 py-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <button
              onClick={fetchOffers}
              className="btn-secondary px-3 py-2"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="metric-card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Offers</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{serverStats?.total_offers ?? offers.length}</p>
          </div>
          <div className="metric-card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {serverStats?.by_status?.active ?? offers.filter(o => o.status === "active").length}
            </p>
          </div>
          <div className="metric-card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {serverStats?.by_status?.inactive ?? offers.filter(o => o.status === "inactive").length}
            </p>
          </div>
          <div className="metric-card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Archived</p>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {serverStats?.by_status?.archived ?? offers.filter(o => o.status === "archived").length}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading offers...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOffers.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No offers found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Get started by creating your first offer"}
            </p>
            {(!searchTerm && statusFilter === "all" && canCreateOffer) && (
              <Link
                to="/create-offer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                <Plus size={18} />
                Create Offer
              </Link>
            )}
          </div>
        )}

        {/* Offers Table */}
        {!loading && filteredOffers.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort("titre")}>
                      <div className="flex items-center gap-1">
                        Title
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort("prix")}>
                      <div className="flex items-center gap-1">
                        Price
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell cursor-pointer hover:text-gray-700 dark:hover:text-gray-300" onClick={() => handleSort("created_at")}>
                      <div className="flex items-center gap-1">
                        Created
                        <ArrowUpDown size={14} />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {paginatedOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      {/* Title Column with Tooltip for long titles */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p 
                              className="font-medium text-gray-800 dark:text-white truncate max-w-[200px] md:max-w-[300px]"
                              onMouseEnter={() => handleTitleMouseEnter(offer.titre)}
                              onMouseLeave={handleTitleMouseLeave}
                            >
                              {truncateText(offer.titre, 35)}
                            </p>
                            <div className="flex items-center gap-2 mt-1 md:hidden">
                              {renderStatusBadge(offer.status)}
                              <span className="text-xs text-gray-400">
                                {formatDate(offer.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Description Column with View More */}
                      <td className="px-6 py-4 max-w-[300px]">
                        {renderDescriptionPreview(offer.description)}
                      </td>
                      
                      {/* Price Column */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="text-gray-400" />
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {parseFloat(offer.prix).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">{offer.currency}</span>
                        </div>
                      </td>
                      
                      {/* Status Column */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        {renderStatusBadge(offer.status)}
                      </td>
                      
                      {/* Provider Column */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {renderProviderBadge(offer.provider_type)}
                      </td>
                      
                      {/* Date Column */}
                      <td className="px-6 py-4 hidden xl:table-cell">
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar size={14} />
                          {formatDate(offer.created_at)}
                        </div>
                      </td>
                      
                      {/* Actions Column */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/offer/${offer.id}`}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                            title="View details"
                          >
                            <Eye size={16} />
                          </Link>
                          {canUpdateOffer ? (
                            <Link
                              to={`/edit-offer/${offer.id}`}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition"
                              title="Edit offer"
                            >
                              <Edit size={16} />
                            </Link>
                          ) : null}
                          {canChangeStatus ? (
                            <button
                              onClick={() => {
                                setSelectedOffer(offer);
                                setShowStatusModal(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                              title="Change status"
                            >
                              <Clock size={16} />
                            </button>
                          ) : null}
                          {canDeleteOffer ? (
                            <button
                              onClick={() => {
                                setSelectedOffer(offer);
                                setShowDeleteModal(true);
                              }}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                              title="Delete offer"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedOffers.length)} of {sortedOffers.length} offers
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Tooltip for long titles */}
      {hoveredTitle && (
        <div className="fixed right-4 top-4 z-50 max-w-md whitespace-normal break-words rounded-lg bg-gray-900 px-3 py-2 text-sm text-white shadow-xl">
          {hoveredTitle}
          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}

      {/* Description Modal - View Full Description */}
      {showDescriptionModal && selectedOffer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl animate-slide-down">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Full Description</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOffer.titre}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="prose dark:prose-invert max-w-none">
                <div className="mb-4">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</span>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {selectedOffer.description || "No description provided"}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Price</span>
                    <p className="text-lg font-semibold text-gray-800 dark:text-white">
                      {selectedOffer.prix} {selectedOffer.currency}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
                    <div className="mt-1">
                      {renderStatusBadge(selectedOffer.status)}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Provider Type</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                      {selectedOffer.provider_type?.replace("_", " ") || "—"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Created At</span>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                      {formatFullDate(selectedOffer.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setShowDescriptionModal(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl animate-slide-down">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Delete Offer</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "<span className="font-medium">{selectedOffer.titre}</span>"? This action cannot be undone.
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
                disabled={actionLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-xl animate-slide-down">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                <Clock size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Update Status</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Change status for "<span className="font-medium">{selectedOffer.titre}</span>"
            </p>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={!newStatus || actionLoading}
                className="flex-1 px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <Loader2 size={16} className="animate-spin" />}
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListOffers;
