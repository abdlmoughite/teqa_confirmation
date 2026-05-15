import axios from "axios";
import {
  AUTH_BASE_URL,
  DEV_TOKEN,
  INTEGRATION_API_BASE_URL,
  INTEGRATION_BASE_URL,
  IS_DEV,
  LOGIN_REDIRECT_URL,
  MARKETPLACE_BASE_URL,
} from "./authConfig";

const getDevToken = () => localStorage.getItem("token") || DEV_TOKEN;

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: true,
  });

  instance.interceptors.request.use((config) => {
    if (IS_DEV) {
      const token = getDevToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        window.location.href = LOGIN_REDIRECT_URL;
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const AUTH_API = createAxiosInstance(AUTH_BASE_URL);
export const INTEGRATION_API = createAxiosInstance(INTEGRATION_API_BASE_URL);
export const INTEGRATION_API_ = createAxiosInstance(INTEGRATION_BASE_URL);
export const MARKETPLACE_API = createAxiosInstance(MARKETPLACE_BASE_URL);

export const login = (data) => AUTH_API.post("login/", data);
export const getCurrentUser = () => AUTH_API.get("user/me/");
export const getPublicUserInfo = (id) => AUTH_API.get(`users/${id}/public/`);
export const resolvePublicEntity = ({ type, id }) =>
  AUTH_API.get("entities/resolve/", { params: { type, id } });
export const logout = () => AUTH_API.post("logout/");
export const updateLanguage = (data) => AUTH_API.patch("user/language/", data);
export const updateProfile = (data) => {
  const isMultipart = data instanceof FormData;
  return AUTH_API.patch(
    "user/profile/",
    data,
    isMultipart ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
  );
};
export const requestPasswordReset = (data) => AUTH_API.post("password/reset/", data);
export const confirmPasswordReset = (data) => AUTH_API.post("password/reset/confirm/", data);
export const getChildUsers = () => AUTH_API.get("user/children/");
export const createChildUser = (data) => AUTH_API.post("user/children/create/", data);
export const updateChildUserStatus = (id, data) =>
  AUTH_API.patch(`user/children/${id}/status/`, data);
export const updateUserStatusByAdmin = (id, data) =>
  AUTH_API.patch(`admin/users/${id}/status/`, data);
export const getPermissionCatalog = () => AUTH_API.get("permissions/catalog/");

export const AddOffer = (data) => MARKETPLACE_API.post("api/offers/", data);
export const GetOffers = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/offers/${queryParams ? `?${queryParams}` : ""}`);
};

export const CheckDeleteOffer = (id) => MARKETPLACE_API.get(`api/offers/${id}/check-delete/`);
export const GetOffer = (id) => MARKETPLACE_API.get(`api/offers/${id}/`);
export const UpdateOffer = (id, data) => MARKETPLACE_API.put(`api/offers/${id}/`, data);
export const PatchOffer = (id, data) => MARKETPLACE_API.patch(`api/offers/${id}/`, data);
export const DeleteOffer = (id) => MARKETPLACE_API.delete(`api/offers/${id}/`);
export const UpdateOfferStatus = (id, status) =>
  MARKETPLACE_API.patch(`api/offers/${id}/`, { status });
export const GetMarketplaceOffers = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/offers/marketplace/${queryParams ? `?${queryParams}` : ""}`);
};
export const GetPublicMarketplaceOffers = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/offers/public-marketplace/${queryParams ? `?${queryParams}` : ""}`);
};
export const GetMyOffers = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/offers/mine/${queryParams ? `?${queryParams}` : ""}`);
};
export const GetOfferStats = () => MARKETPLACE_API.get("api/offers/stats/");

export const GetCollaborations = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(
    `api/collaborations/collaborations/${queryParams ? `?${queryParams}` : ""}`
  );
};

export const GetCollaboration = (id) =>
  MARKETPLACE_API.get(`api/collaborations/collaborations/${id}/`);

export const CreateCollaboration = (data) =>
  MARKETPLACE_API.post("api/collaborations/collaborations/", data);

export const RespondToCollaboration = (id, data) =>
  MARKETPLACE_API.post(`api/collaborations/collaborations/${id}/respond/`, data);

export const DeactivateCollaboration = (id) =>
  MARKETPLACE_API.post(`api/collaborations/collaborations/${id}/deactivate/`);

export const ActivateCollaboration = (id) =>
  MARKETPLACE_API.post(`api/collaborations/collaborations/${id}/activate/`);
export const GetCollaborationSummary = () =>
  MARKETPLACE_API.get("api/collaborations/collaborations/summary/");
export const GetCollaborationThread = (id) =>
  MARKETPLACE_API.get(`api/collaborations/collaborations/${id}/thread/`);

export const GetWallets = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/wallets/wallets/${queryParams ? `?${queryParams}` : ""}`);
};

export const GetWallet = (id) => MARKETPLACE_API.get(`api/wallets/wallets/${id}/`);
export const CreateWallet = (data) => MARKETPLACE_API.post("api/wallets/wallets/", data);
export const AddBalanceToWallet = (id, amount) =>
  MARKETPLACE_API.post(`api/wallets/wallets/${id}/add-balance/`, { amount });

export const GetTransfers = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(
    `api/wallets/wallet-transfers/${queryParams ? `?${queryParams}` : ""}`
  );
};

export const CreateTransfer = (data) =>
  MARKETPLACE_API.post("api/wallets/wallet-transfers/", data);

export const GetCommissions = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(
    `api/commissions/commissions/${queryParams ? `?${queryParams}` : ""}`
  );
};

export const GetCommission = (id) =>
  MARKETPLACE_API.get(`api/commissions/commissions/${id}/`);

export const GetWalletTransactions = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(
    `api/commissions/wallet-transactions/${queryParams ? `?${queryParams}` : ""}`
  );
};

export const GetCommissionStats = () =>
  MARKETPLACE_API.get("api/commissions/commissions/stats/");

export const GetPaymentAttempts = (id) =>
  MARKETPLACE_API.get(`api/commissions/commissions/${id}/payment-attempts/`);

export const GetInvoices = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/invoices/invoices/${queryParams ? `?${queryParams}` : ""}`);
};

export const GetInvoice = (id) =>
  MARKETPLACE_API.get(`api/invoices/invoices/${id}/`);

export const GetInvoiceStats = () =>
  MARKETPLACE_API.get("api/invoices/invoices/my-stats/");

export const DownloadInvoicePDF = (id) =>
  MARKETPLACE_API.get(`api/invoices/invoices/${id}/download-pdf/`, {
    responseType: "blob",
  });

export const GetMyTransactions = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(
    `api/wallets/wallet-transfers/my-transactions/${queryParams ? `?${queryParams}` : ""}`
  );
};

export const GetTransferDetails = (id) =>
  MARKETPLACE_API.get(`api/invoices/invoices/${id}/transfer-details/`);

export const GetTransactionStats = () =>
  MARKETPLACE_API.get("api/wallets/wallet-transfers/stats/");

export const GetWalletSummary = () =>
  MARKETPLACE_API.get("api/wallets/wallets/summary/");

export const GetConversations = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(
    `api/messaging/conversations/${queryParams ? `?${queryParams}` : ""}`
  );
};

export const GetConversation = (id) =>
  MARKETPLACE_API.get(`api/messaging/conversations/${id}/`);

export const CreateConversation = (data) =>
  MARKETPLACE_API.post("api/messaging/conversations/", data);

export const GetConversationMessages = (id) =>
  MARKETPLACE_API.get(`api/messaging/conversations/${id}/messages/`);

export const SendConversationMessage = (id, data) =>
  MARKETPLACE_API.post(`api/messaging/conversations/${id}/send-message/`, data);

export const InjectConversationCollaboration = (id, data) =>
  MARKETPLACE_API.post(`api/messaging/conversations/${id}/inject-collaboration/`, data);

export const MarkConversationRead = (id) =>
  MARKETPLACE_API.post(`api/messaging/conversations/${id}/mark-read/`);

export const ArchiveConversation = (id) =>
  MARKETPLACE_API.post(`api/messaging/conversations/${id}/archive/`);
export const ReopenConversation = (id) =>
  MARKETPLACE_API.post(`api/messaging/conversations/${id}/reopen/`);

export const GetConversationStats = () =>
  MARKETPLACE_API.get("api/messaging/conversations/stats/");
export const GetUnreadConversations = () =>
  MARKETPLACE_API.get("api/messaging/conversations/unread/");

export const GetDashboardStats = () =>
  MARKETPLACE_API.get("api/core/dashboard/stats/");
export const GetMarketplaceCapabilities = () =>
  MARKETPLACE_API.get("api/core/me/capabilities/");

export const setDevToken = (token) => {
  localStorage.setItem("token", token);
};

export const clearDevToken = () => {
  localStorage.removeItem("token");
};
