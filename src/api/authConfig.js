const envFlag = process.env.REACT_APP_IS_DEV;

export const IS_DEV = ["true", "1", "yes", "on"].includes(
  String(envFlag || "").trim().toLowerCase()
);
export const DEV_TOKEN = IS_DEV ? process.env.REACT_APP_DEV_TOKEN || "" : "";

export const AUTH_BASE_URL =
  process.env.REACT_APP_AUTH_BASE_URL || "https://auth.teqa.net/auth/";

export const INTEGRATION_API_BASE_URL =
  process.env.REACT_APP_INTEGRATION_API_BASE_URL ||
  "https://integration.teqa.net/api/";

export const INTEGRATION_BASE_URL =
  process.env.REACT_APP_INTEGRATION_BASE_URL ||
  "https://integration.teqa.net/";

export const MARKETPLACE_BASE_URL =
  process.env.REACT_APP_MARKETPLACE_BASE_URL || "https://marketplace.teqa.net/";

export const LOGIN_REDIRECT_URL =
  process.env.REACT_APP_LOGIN_URL || "https://teqa.net/login";
