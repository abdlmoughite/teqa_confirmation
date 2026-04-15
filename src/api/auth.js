import axios from "axios";

/* =========================================================
   BASE URLS
========================================================= */

export const AUTH_BASE_URL = "https://auth.teqaconnect.com/auth/";
export const INTEGRATION_API_BASE_URL =
  "https://integration.teqaconnect.com/api/";
export const INTEGRATION_BASE_URL =
  "https://integration.teqaconnect.com/";

/* =========================================================
   AXIOS INSTANCES (COOKIE BASED AUTH)
   - We rely ONLY on HttpOnly cookies set by Django
   - Browser will automatically send cookies
========================================================= */

export const AUTH_API = axios.create({
  baseURL: AUTH_BASE_URL,
  withCredentials: true, // مهم باش cookie يتصيفط
});

export const INTEGRATION_API = axios.create({
  baseURL: INTEGRATION_API_BASE_URL,
  withCredentials: true, // مهم باش cookie يتصيفط
});

export const INTEGRATION_API_ = axios.create({
  baseURL: INTEGRATION_BASE_URL,
  withCredentials: true,
});

/* =========================================================
   GLOBAL RESPONSE HANDLER
   - Handle 401 globally
========================================================= */

const handleResponseError = (error) => {
  if (error.response?.status === 401) {
    console.warn("Unauthorized - Session expired or cookie blocked");
  }
  return Promise.reject(error);
};

AUTH_API.interceptors.response.use(
  (response) => response,
  handleResponseError
);

INTEGRATION_API.interceptors.response.use(
  (response) => response,
  handleResponseError
);

INTEGRATION_API_.interceptors.response.use(
  (response) => response,
  handleResponseError
);

/* =========================================================
   AUTH CALLS
========================================================= */

export const getCurrentUser = () =>
  AUTH_API.get("user/me/");

export const logout = () =>
  AUTH_API.post("logout/");

export const updateLanguage = (data) =>
  INTEGRATION_API.patch("user/language/", data);