const VALIDATION_KEYS = ["detail", "message", "error", "non_field_errors"];

export const getFriendlyErrorMessage = (error, fallback = "Something went wrong.") => {
  const status = error?.response?.status;
  const data = error?.response?.data;

  if (!error?.response || status >= 500) {
    return "We are working to fix this issue. Please try again in a few minutes.";
  }

  if (typeof data === "string") return data;

  if (Array.isArray(data)) {
    return data.filter(Boolean).join(" ");
  }

  if (data && typeof data === "object") {
    for (const key of VALIDATION_KEYS) {
      const value = data[key];
      if (Array.isArray(value)) return value.join(" ");
      if (value) return String(value);
    }

    const fieldError = Object.entries(data).find(([, value]) => value);
    if (fieldError) {
      const [field, value] = fieldError;
      const message = Array.isArray(value) ? value.join(" ") : String(value);
      return `${field.replaceAll("_", " ")}: ${message}`;
    }
  }

  return error?.message || fallback;
};

export const getToastError = (error, fallback) => ({
  title: error?.response?.status >= 500 || !error?.response ? "Service temporarily unavailable" : "Check your input",
  message: getFriendlyErrorMessage(error, fallback),
});
