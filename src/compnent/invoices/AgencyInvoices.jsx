// AgencyInvoices.jsx
import { useState, useEffect } from "react";
import {
  FileText,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Receipt,
  TrendingUp,
  Calendar,
  DollarSign,
  Wallet,
  Info
} from "lucide-react";
import { GetInvoices, DownloadInvoicePDF, GetInvoiceStats, GetTransferDetails } from "../../api/auth";

/* =========================================================
   CONSTANTS
========================================================= */

const INVOICE_TYPE_CONFIG = {
  PROVIDER_CREDIT: { label: "Reçu de paiement", color: "green", icon: CheckCircle, description: "Vous avez reçu de l'argent" },
  PROVIDER_INVOICE: { label: "Facture émise", color: "orange", icon: FileText, description: "Document comptable" }
};

const INVOICE_STATUS_CONFIG = {
  pending: { label: "En attente", color: "yellow", icon: Clock, bgColor: "bg-yellow-100 dark:bg-yellow-900/30", textColor: "text-yellow-700 dark:text-yellow-400" },
  paid: { label: "Payé", color: "green", icon: CheckCircle, bgColor: "bg-green-100 dark:bg-green-900/30", textColor: "text-green-700 dark:text-green-400" },
  failed: { label: "Échoué", color: "red", icon: XCircle, bgColor: "bg-red-100 dark:bg-red-900/30", textColor: "text-red-700 dark:text-red-400" },
  cancelled: { label: "Annulé", color: "gray", icon: XCircle, bgColor: "bg-gray-100 dark:bg-gray-800", textColor: "text-gray-600 dark:text-gray-400" },
  refunded: { label: "Remboursé", color: "orange", icon: RefreshCw, bgColor: "bg-orange-100 dark:bg-orange-900/30", textColor: "text-orange-700 dark:text-orange-400" }
};

const ITEMS_PER_PAGE = 10;

/* =========================================================
   MAIN COMPONENT
========================================================= */

const AgencyInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [transferDetails, setTransferDetails] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [loadingTransfer, setLoadingTransfer] = useState(false);

  /* =========================================================
     FETCH DATA
  ========================================================= */
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (typeFilter !== "all") params.invoice_type = typeFilter;
      if (statusFilter !== "all") params.status = statusFilter;
      
      const [invoicesRes, statsRes] = await Promise.all([
        GetInvoices(params),
        GetInvoiceStats().catch(() => ({ data: null }))
      ]);
      
      let invoicesData = [];
      if (invoicesRes.data?.results) {
        invoicesData = invoicesRes.data.results;
      } else if (Array.isArray(invoicesRes.data)) {
        invoicesData = invoicesRes.data;
      }
      setInvoices(invoicesData);
      
      if (statsRes.data && statsRes.data.success !== false) {
        setStats(statsRes.data);
      } else if (invoicesData.length > 0) {
        // Calcul local des stats
        const total_amount = invoicesData.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        const paid_amount = invoicesData.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        setStats({
          total_invoices: invoicesData.length,
          total_amount: total_amount,
          paid_amount: paid_amount,
          currency: invoicesData[0]?.currency || "MAD"
        });
      }
      
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError(err.response?.data?.message || "Impossible de charger les factures");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [typeFilter, statusFilter]);

  /* =========================================================
     FETCH TRANSFER DETAILS
  ========================================================= */
  const fetchTransferDetails = async (invoiceId) => {
    setLoadingTransfer(true);
    try {
      const response = await GetTransferDetails(invoiceId);
      if (response.data?.success) {
        setTransferDetails(response.data.transfer);
      } else {
        setTransferDetails(null);
      }
    } catch (err) {
      console.error("Error fetching transfer details:", err);
      setTransferDetails(null);
    } finally {
      setLoadingTransfer(false);
    }
  };

  /* =========================================================
     FILTERS & PAGINATION
  ========================================================= */
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.order_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
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
      return new Intl.DateTimeFormat('fr-FR', {
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

  const formatPrice = (price, currency = "MAD") => {
    return `${parseFloat(price).toLocaleString('fr-FR')} ${currency}`;
  };

  const renderStatusBadge = (status) => {
    const config = INVOICE_STATUS_CONFIG[status] || INVOICE_STATUS_CONFIG.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const renderTypeBadge = (type) => {
    const config = INVOICE_TYPE_CONFIG[type] || { label: type, color: "gray", icon: FileText };
    const Icon = config.icon;
    const colorClasses = {
      green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      orange: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const handleDownloadPDF = async (invoice) => {
    setDownloading(true);
    try {
      const response = await DownloadInvoicePDF(invoice.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${invoice.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading invoice:", err);
      alert("Impossible de télécharger la facture");
    } finally {
      setDownloading(false);
    }
  };

  const openDetails = async (invoice) => {
    setSelectedInvoice(invoice);
    await fetchTransferDetails(invoice.id);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Chargement des factures...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Erreur</h3>
        <p className="text-red-700 dark:text-red-400">{error}</p>
        <button onClick={fetchInvoices} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mes Factures</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Consultez et gérez toutes vos factures</p>
      </div>

      {/* Stats Cards */}
      {stats && stats.total_invoices > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <p className="text-white/80 text-sm">Montant total</p>
            <p className="text-2xl font-bold mt-1">{formatPrice(stats.total_amount, stats.currency)}</p>
            <p className="text-white/60 text-xs mt-1">{stats.total_invoices} factures</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm">Payé</span>
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{formatPrice(stats.paid_amount, stats.currency)}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <FileText size={16} className="text-blue-500" />
              <span className="text-sm">Total factures</span>
            </div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{stats.total_invoices}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <Receipt size={16} className="text-purple-500" />
              <span className="text-sm">Type</span>
            </div>
            <p className="text-sm font-medium text-gray-800 dark:text-white">Reçus + Factures</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro de facture ou commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les types</option>
          <option value="PROVIDER_CREDIT">Reçus de paiement</option>
          <option value="PROVIDER_INVOICE">Factures émises</option>
        </select>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="paid">Payé</option>
          <option value="pending">En attente</option>
          <option value="failed">Échoué</option>
        </select>
        
        <button
          onClick={fetchInvoices}
          className="p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Aucune facture trouvée</h3>
          <p className="text-gray-500 dark:text-gray-400">Les factures apparaîtront ici après vos paiements</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">N° Facture</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Commande</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono font-medium text-gray-800 dark:text-white">
                        {invoice.invoice_number}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {renderTypeBadge(invoice.invoice_type)}
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-500">
                        {invoice.order_id?.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-gray-800 dark:text-white">
                        {formatPrice(invoice.amount, invoice.currency)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {renderStatusBadge(invoice.status)}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-xs text-gray-500">{formatDate(invoice.created_at)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetails(invoice)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(invoice)}
                          disabled={downloading}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition"
                          title="Télécharger"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-gray-500">
                {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredInvoices.length)} sur {filteredInvoices.length}
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
      )}

      {/* Invoice Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <FileText size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Détails de la facture</h3>
                  <p className="text-xs text-gray-500">{selectedInvoice.invoice_number}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Type de facture</p>
                  {renderTypeBadge(selectedInvoice.invoice_type)}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Statut</p>
                  {renderStatusBadge(selectedInvoice.status)}
                </div>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">Montant</p>
                <p className="text-xl font-bold text-green-600">
                  {formatPrice(selectedInvoice.amount, selectedInvoice.currency)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">ID Commande</p>
                  <code className="text-sm font-mono">{selectedInvoice.order_id}</code>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Date d'émission</p>
                  <p className="text-sm">{formatDate(selectedInvoice.created_at)}</p>
                </div>
                {selectedInvoice.paid_at && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Date de paiement</p>
                    <p className="text-sm">{formatDate(selectedInvoice.paid_at)}</p>
                  </div>
                )}
                {selectedInvoice.due_date && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Date d'échéance</p>
                    <p className="text-sm">{formatDate(selectedInvoice.due_date)}</p>
                  </div>
                )}
              </div>
              
              {selectedInvoice.notes && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm">{selectedInvoice.notes}</p>
                </div>
              )}
              
              {/* Transfer Details Button */}
              <button
                onClick={() => setShowTransferModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Wallet size={16} />
                Voir les détails du transfert
              </button>
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Download size={16} />
                Télécharger PDF
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Details Modal */}
      {showTransferModal && transferDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-xl">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Wallet size={20} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Détails du transfert</h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="p-1 rounded-lg hover:bg-gray-100">✕</button>
            </div>
            
            <div className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Montant:</span>
                <span className="font-semibold">{formatPrice(transferDetails.amount, transferDetails.currency)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Statut:</span>
                {renderStatusBadge(transferDetails.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Référence:</span>
                <code className="text-xs">{transferDetails.reference || "—"}</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Date:</span>
                <span className="text-sm">{formatDate(transferDetails.created_at)}</span>
              </div>
              {transferDetails.note && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Note:</p>
                  <p className="text-sm">{transferDetails.note}</p>
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setShowTransferModal(false)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyInvoices;