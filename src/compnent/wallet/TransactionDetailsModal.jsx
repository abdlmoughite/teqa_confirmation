// TransactionDetailsModal.jsx
import { X, Calendar, DollarSign, Hash, FileText, User, ArrowUpRight, ArrowDownRight } from "lucide-react";

const TransactionDetailsModal = ({ 
  isOpen, 
  transaction, 
  onClose, 
  formatDate, 
  formatPrice, 
  renderStatusBadge,
  renderTransactionType 
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full shadow-xl animate-slide-down">
        <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              {transaction.type === "CREDIT" ? (
                <ArrowDownRight size={20} className="text-green-600" />
              ) : (
                <ArrowUpRight size={20} className="text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Détails de la transaction
              </h3>
              <p className="text-xs text-gray-500">
                {transaction.type === "CREDIT" ? "Réception" : "Envoi"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          {/* Type */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Hash size={14} />
              Type
            </span>
            <div>{renderTransactionType(transaction.transaction_type, transaction.direction)}</div>
          </div>
          
          {/* Montant */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <DollarSign size={14} />
              Montant
            </span>
            <span className={`font-bold text-lg ${transaction.type === "CREDIT" ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === "CREDIT" ? '+' : '-'}{formatPrice(Math.abs(parseFloat(transaction.amount)), transaction.currency)}
            </span>
          </div>
          
          {/* Statut */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Statut</span>
            {renderStatusBadge(transaction.status)}
          </div>
          
          {/* Contrepartie */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <User size={14} />
              Contrepartie
            </span>
            <div className="text-right">
              <p className="text-sm font-medium">{transaction.counterparty_name || "—"}</p>
              <p className="text-xs text-gray-400 font-mono">{transaction.counterparty_wallet?.slice(0, 16)}...</p>
              <p className="text-xs text-gray-400">{transaction.counterparty_type || ""}</p>
            </div>
          </div>
          
          {/* Référence */}
          {transaction.reference && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <Hash size={14} />
                Référence
              </span>
              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {transaction.reference}
              </code>
            </div>
          )}
          
          {/* Note */}
          {transaction.note && (
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <FileText size={14} />
                Note
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-right max-w-[200px]">
                {transaction.note}
              </p>
            </div>
          )}
          
          {/* Date */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar size={14} />
              Date
            </span>
            <span className="text-sm">{formatDate(transaction.created_at)}</span>
          </div>
        </div>
        
        <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;