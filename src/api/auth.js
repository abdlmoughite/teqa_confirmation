import axios from "axios";
import {
  IS_DEV,
  DEV_TOKEN,
  AUTH_BASE_URL,
  INTEGRATION_API_BASE_URL,
  INTEGRATION_BASE_URL,
  MARKETPLACE_BASE_URL ,
} from "./authConfig";

/* =========================================================
   TOKEN HELPER (DEV ONLY)
========================================================= */

const getDevToken = () => {
  return localStorage.getItem("token") || "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc4NDk3ODEyLCJpYXQiOjE3NzY2OTc4MTIsImp0aSI6ImI2MDE0YThlNTkxYjRiODViMTNkNzhiNzhkNDc1YjMyIiwidXNlcl9pZCI6IjM4OWY2ZTg1LTQyMmUtNDA0MC1hNmM2LWM0YzQwZmQ2NDhmNCIsImVtYWlsIjoiMm1vaGFtZWRlbGtocmFpZmlAZ21haWwuY29tIiwidXNlcm5hbWUiOiIybW9oYW1lZGVsa2hyYWlmaUBnbWFpbC5jb20iLCJyb2xlIjoiQUdFTkNZX09XTkVSIiwic3RhdHVzIjoiQUNUSVZFIiwibGFuZ3VhZ2UiOiJmciIsImNvdW50cnkiOiJNQSIsImlzX3BhcmVudCI6dHJ1ZSwiaXNfY2hpbGQiOmZhbHNlLCJwYXJlbnRfaWQiOm51bGwsInBlcm1pc3Npb25zIjpbXSwic3RvcmVfaWQiOm51bGwsInN0b3JlX25hbWUiOm51bGwsImFnZW5jeV9pZCI6IjVjNWYxYjE4LTM5YmItNDMwMy04Y2Q4LTUwMmFhNzc4YmMyYiIsImFnZW5jeV9uYW1lIjoiYWdlbmN5IHRlcWEgdGVzdCIsImFnZW50X2lkIjpudWxsLCJhZ2VudF9uYW1lIjpudWxsfQ.Xp_Oq6u8-PzEDW4Fxy2cta2R9swzGjkGkkm_uCRvH0thZP88TCeReno_ilg5pfLGVLiESRRapVglRnlvUZOUIL74S67dUk6-FO0KqkNhIghJXfPYQQ_jKQOPztUbC-hk_Gu9uizG_fE7ykCLUZi30y_5Jlt3868bVttvQXX0V_xVxvqS3BSnUUTDrPO3INoqELTo_gsSVgP2RGYExQNDjqbC4acmDos0QLGyA8gSuEmreL-2c4FmGxkgXPVSG16PiqBwB7iiJXX54X7RfqUC_if3vzEy11xR6z7jHR36D9NxJCwl057_CRNPSbThA9PSOsFinNpAN5kGXQN8hNXnZA";
};

/* =========================================================
   AXIOS FACTORY
========================================================= */

const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    withCredentials: !IS_DEV, // cookies en prod
  });

  // 🔥 REQUEST INTERCEPTOR
  instance.interceptors.request.use((config) => {
    if (IS_DEV) {
      const token = getDevToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  // 🔥 RESPONSE INTERCEPTOR
  instance.interceptors.response.use(
    (res) => res,
    (error) => {
      if (error.response?.status === 401) {
        console.warn(
          IS_DEV
            ? "DEV TOKEN INVALID"
            : "SESSION EXPIRED (cookies)"
        );

        if (!IS_DEV) {
          window.location.href = "https://teqaconnect.com/login";
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

/* =========================================================
   INSTANCES
========================================================= */

export const AUTH_API = createAxiosInstance(AUTH_BASE_URL);

export const INTEGRATION_API =
  createAxiosInstance(INTEGRATION_API_BASE_URL);

export const INTEGRATION_API_ =
  createAxiosInstance(INTEGRATION_BASE_URL);
  
export const MARKETPLACE_API =
  createAxiosInstance(MARKETPLACE_BASE_URL);

/* =========================================================
   AUTH FUNCTIONS
========================================================= */

export const getCurrentUser = () => AUTH_API.get("user/me/");

export const logout = () =>{
  window.location.href = "https://teqaconnect.com/login";
};

export const updateLanguage = (data) =>
  INTEGRATION_API.patch("user/language/", data);


// Create offer
export const AddOffer = (data) =>
  MARKETPLACE_API.post("api/offers/", data);

// Get all offers - CORRECTED (return the promise)
export const GetOffers = () =>
  MARKETPLACE_API.get("api/offers/");

// Get single offer
export const GetOffer = (id) =>
  MARKETPLACE_API.get(`api/offers/${id}/`);

// Update offer
export const UpdateOffer = (id, data) =>
  MARKETPLACE_API.put(`api/offers/${id}/`, data);

// Partial update offer
export const PatchOffer = (id, data) =>
  MARKETPLACE_API.patch(`api/offers/${id}/`, data);

// Delete offer - CORRECTED
export const DeleteOffer = (id) =>
  MARKETPLACE_API.delete(`api/offers/${id}/`);

// Update offer status only - CORRECTED
export const UpdateOfferStatus = (id, status) =>
  MARKETPLACE_API.patch(`api/offers/${id}/`, { status });


/* =========================================================
   COLLABORATION FUNCTIONS
========================================================= */



// Get all collaborations (with filters)
export const GetCollaborations = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/collaborations/collaborations/${queryParams ? `?${queryParams}` : ''}`);
};

// Get single collaboration
export const GetCollaboration = (id) =>
  MARKETPLACE_API.get(`api/collaborations/collaborations/${id}/`);

// Create collaboration (STORE only)
export const CreateCollaboration = (data) =>
  MARKETPLACE_API.post("api/collaborations/collaborations/", data);

// Respond to collaboration (accept/reject/counter)
export const RespondToCollaboration = (id, data) =>
  MARKETPLACE_API.post(`api/collaborations/collaborations/${id}/respond/`, data);


/* =========================================================
   WALLET FUNCTIONS
========================================================= */

// Get all wallets (with filters)
export const GetWallets = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/wallets/wallets/${queryParams ? `?${queryParams}` : ''}`);
};




// Get single wallet
export const GetWallet = (id) =>
  MARKETPLACE_API.get(`api/wallets/wallets/${id}/`);

// Create wallet
export const CreateWallet = (data) =>
  MARKETPLACE_API.post("api/wallets/wallets/", data);

// Add balance to wallet (admin only)
export const AddBalanceToWallet = (id, amount) =>
  MARKETPLACE_API.post(`api/wallets/${id}/add-balance/`, { amount });

/* =========================================================
   WALLET TRANSFER FUNCTIONS
========================================================= */

// Get all transfers (with filters)
export const GetTransfers = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/wallets/wallet-transfers/${queryParams ? `?${queryParams}` : ''}`);
};

// Create transfer
export const CreateTransfer = (data) =>
  MARKETPLACE_API.post("api/wallet-transfers/", data);


/* =========================================================
   COMMISSION FUNCTIONS
========================================================= */

// Get all commissions (with filters)
export const GetCommissions = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/commissions/commissions/${queryParams ? `?${queryParams}` : ''}`);
};

// Get single commission
export const GetCommission = (id) =>
  MARKETPLACE_API.get(`api/commissions/commissions/${id}/`);

// Get wallet transactions
export const GetWalletTransactions = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/commissions/wallet-transactions/${queryParams ? `?${queryParams}` : ''}`);
};

// Get payment attempts for a commission
export const GetPaymentAttempts = (id) =>
  MARKETPLACE_API.get(`api/commissions/commissions/${id}/payment-attempts/`);

// Get webhook events (admin only)
// export const GetWebhookEvents = (params = {}) => {
//   const queryParams = new URLSearchParams(params).toString();
//   return MARKETPLACE_API.get(`api/webhook-events/${queryParams ? `?${queryParams}` : ''}`);
// };


/* =========================================================
   INVOICE FUNCTIONS
========================================================= */

// Get all invoices (with filters)
export const GetInvoices = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/invoices/invoices/${queryParams ? `?${queryParams}` : ''}`);
};

// Get single invoice
export const GetInvoice = (id) =>
  MARKETPLACE_API.get(`api/invoices/invoices/${id}/`);

// Get invoice stats
export const GetInvoiceStats = () =>
  MARKETPLACE_API.get(`api/invoices/invoices/my-stats/`);
// Download invoice PDF
export const DownloadInvoicePDF = (id) =>
  MARKETPLACE_API.get(`api/invoices/invoices/${id}/download-pdf/`, { responseType: 'blob' });

// Get my transactions (debit + credit)
export const GetMyTransactions = (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  return MARKETPLACE_API.get(`api/wallets/wallet-transfers/my-transactions/${queryParams ? `?${queryParams}` : ''}`);
};
// Get transfer details for an invoice
export const GetTransferDetails = (id) =>
  MARKETPLACE_API.get(`api/invoices/invoices/${id}/transfer-details/`);
/* =========================================================
   DEV HELPERS
========================================================= */

export const setDevToken = (token) => {
  localStorage.setItem("token", token);
};

export const clearDevToken = () => {
  localStorage.removeItem("token");
};

