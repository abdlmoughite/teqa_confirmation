import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, Edit3, LockKeyhole, Plus, Power, Save, 
  ShieldCheck, UserPlus, Users, X, AlertCircle, 
  Loader2, Mail, Phone, MapPin, Globe, User, 
  Key, Eye, EyeOff, ChevronDown, ChevronUp,RefreshCw  ,
  Zap, Award, Star, Crown, Shield
} from "lucide-react";

import {
  createChildUser,
  getChildUsers,
  getPermissionCatalog,
  updateChildUserStatus,
} from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";

/* =========================================================
   CONSTANTS
========================================================= */

const defaultPermissions = ["orders.view", "collaborations.view", "messaging.view"];

const permissionPresets = [
  {
    key: "confirmation_agent",
    label: "Agent confirmation",
    icon: Zap,
    description: "Order confirmation and basic collaboration",
    permissions: ["dashboard.view_own", "orders.view", "orders.update_status", "collaborations.view_own", "collaborations.respond", "messaging.view_own", "messaging.send"],
  },
  {
    key: "collaboration_manager",
    label: "Manager collaboration",
    icon: Award,
    description: "Full collaboration management",
    permissions: ["dashboard.view", "offers.view", "collaborations.view_agency", "collaborations.respond", "collaborations.activate", "collaborations.deactivate", "messaging.view_agency", "messaging.send", "messaging.archive"],
  },
  {
    key: "finance_viewer",
    label: "Finance",
    icon: Shield,
    description: "Financial and invoice access",
    permissions: ["dashboard.view", "wallets.view_agency", "wallet_transfers.view", "commissions.view_agency", "commissions.view_stats", "invoices.view_agency", "invoices.view_stats", "invoices.download"],
  },
  {
    key: "team_lead",
    label: "Team lead",
    icon: Crown,
    description: "Team management and leadership",
    permissions: ["dashboard.view", "team.view", "team.create", "team.update", "team.manage_permissions", "messaging.view_agency", "messaging.send"],
  },
];

const inputClass = "field-input min-h-11 w-full rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all";
const primaryButton = "btn-primary min-h-11 disabled:cursor-not-allowed disabled:opacity-60 rounded-xl font-medium shadow-md hover:shadow-lg transition-all";
const secondaryButton = "btn-secondary min-h-10 rounded-xl font-medium transition-all";

/* =========================================================
   VALIDATION SCHEMA
========================================================= */

const validateUserForm = (formData, t) => {
  const errors = {};

  if (!formData.first_name?.trim()) {
    errors.first_name = t("validation.first_name_required", "First name is required");
  } else if (formData.first_name.length < 2) {
    errors.first_name = t("validation.first_name_min", "First name must be at least 2 characters");
  } else if (formData.first_name.length > 50) {
    errors.first_name = t("validation.first_name_max", "First name must not exceed 50 characters");
  }

  if (!formData.last_name?.trim()) {
    errors.last_name = t("validation.last_name_required", "Last name is required");
  } else if (formData.last_name.length < 2) {
    errors.last_name = t("validation.last_name_min", "Last name must be at least 2 characters");
  } else if (formData.last_name.length > 50) {
    errors.last_name = t("validation.last_name_max", "Last name must not exceed 50 characters");
  }

  if (!formData.username?.trim()) {
    errors.username = t("validation.username_required", "Username is required");
  } else if (formData.username.length < 3) {
    errors.username = t("validation.username_min", "Username must be at least 3 characters");
  } else if (formData.username.length > 30) {
    errors.username = t("validation.username_max", "Username must not exceed 30 characters");
  } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
    errors.username = t("validation.username_invalid", "Username can only contain letters, numbers and underscores");
  }

  if (!formData.email?.trim()) {
    errors.email = t("validation.email_required", "Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t("validation.email_invalid", "Please enter a valid email address");
  }

  if (!formData.password) {
    errors.password = t("validation.password_required", "Password is required");
  } else if (formData.password.length < 8) {
    errors.password = t("validation.password_min", "Password must be at least 8 characters");
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = t("validation.password_strength", "Password must contain uppercase, lowercase and number");
  }

  if (formData.phone_number && !/^[+]?[0-9\s-]{8,20}$/.test(formData.phone_number)) {
    errors.phone_number = t("validation.phone_invalid", "Please enter a valid phone number");
  }

  if (formData.permissions.length === 0) {
    errors.permissions = t("validation.permissions_required", "At least one permission is required");
  }

  return errors;
};

/* =========================================================
   TOAST COMPONENT
========================================================= */

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    success: { icon: Check, gradient: "from-emerald-500 to-green-500" },
    error: { icon: AlertCircle, gradient: "from-rose-500 to-red-500" },
    info: { icon: ShieldCheck, gradient: "from-blue-500 to-indigo-500" }
  };
  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 50, y: -20 }}
      className="fixed top-20 right-4 z-50"
    >
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl">
        <div className={`p-1.5 rounded-lg bg-gradient-to-r ${config.gradient}`}>
          <Icon size={16} className="text-white" />
        </div>
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{message}</p>
      </div>
    </motion.div>
  );
};

/* =========================================================
   PERMISSION BADGE
========================================================= */

const PermissionBadge = ({ permission, onToggle, checked, disabled }) => (
  <button
    type="button"
    onClick={() => !disabled && onToggle(permission.code)}
    disabled={disabled}
    className={clsx(
      "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-200",
      checked
        ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600",
      disabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <span className={clsx(
      "flex h-5 w-5 items-center justify-center rounded border transition-all",
      checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 dark:border-gray-600"
    )}>
      {checked && <Check size={13} />}
    </span>
    <div className="flex-1">
      <span className="block font-semibold">{permission.label}</span>
      <span className="text-xs opacity-70 font-mono">{permission.code}</span>
    </div>
  </button>
);

/* =========================================================
   USER CARD COMPONENT
========================================================= */

const UserCard = ({ user, onEditPermissions, onToggleStatus, t }) => {
  const initials = (user.first_name || user.username || user.email || "U").slice(0, 2).toUpperCase();

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-md">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={clsx(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              user.is_active 
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {user.is_active ? t("team.active", "Active") : t("team.inactive", "Inactive")}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-lg font-bold text-gray-900 dark:text-white">{(user.permissions || []).length}</p>
          <p className="text-xs text-gray-500">Permissions</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {new Date(user.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">Created</p>
        </div>
      </div>

      {/* Permissions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {(user.permissions || []).slice(0, 4).map((permission) => (
          <span key={permission} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
            {permission.split('.').pop()}
          </span>
        ))}
        {(user.permissions || []).length > 4 && (
          <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500">
            +{(user.permissions || []).length - 4}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEditPermissions(user)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm font-medium"
        >
          <Edit3 size={14} />
          {t("team.edit_permissions", "Permissions")}
        </button>
        <button
          type="button"
          onClick={() => onToggleStatus(user)}
          className={clsx(
            "flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl transition-all text-sm font-medium",
            user.is_active
              ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-500/20 dark:text-rose-400"
              : "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm hover:shadow-md"
          )}
        >
          <Power size={14} />
          {user.is_active ? t("team.deactivate", "Deactivate") : t("team.activate", "Activate")}
        </button>
      </div>
    </motion.article>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const TeamUsersPage = () => {
  const { user, hasAnyPermission, isChild } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingChild, setEditingChild] = useState(null);
  const [editPermissions, setEditPermissions] = useState([]);
  const [editSaving, setEditSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    phone_number: "",
    country: user?.country || "MA",
    city: "",
    address: "",
    permissions: defaultPermissions,
  });

  const showToast = (message, type = "success") => {
    setToastMsg({ message, type });
  };

  const canManageTeam = useMemo(() => {
    if (isChild) return false;
    return hasAnyPermission(["team.view", "team.create", "team.update", "team.manage_permissions"]);
  }, [hasAnyPermission, isChild]);

  const allowedCatalog = useMemo(() => {
    if ((user?.permissions || []).includes("*")) {
      return [{ code: "*", label: t("team.full_access", "Full access") }, ...catalog];
    }
    const allowed = new Set(user?.permissions || []);
    return catalog.filter((permission) => allowed.has(permission.code));
  }, [catalog, t, user]);

  const allowedPermissionCodes = useMemo(
    () => new Set(allowedCatalog.map((permission) => permission.code)),
    [allowedCatalog]
  );

  const applyPreset = (preset, target = "create") => {
    const nextPermissions = preset.permissions.filter((permission) => allowedPermissionCodes.has(permission));

    if (target === "edit") {
      setEditPermissions(nextPermissions);
      return;
    }

    setForm((previous) => ({
      ...previous,
      permissions: nextPermissions,
    }));
  };

  const permissionPreview = useMemo(() => {
    const labels = new Map(allowedCatalog.map((permission) => [permission.code, permission.label]));
    return form.permissions.map((permission) => labels.get(permission) || permission);
  }, [allowedCatalog, form.permissions]);

  const fetchData = useCallback(async () => {
    if (!canManageTeam) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const [childrenResponse, catalogResponse] = await Promise.all([
        getChildUsers(),
        getPermissionCatalog().catch(() => ({ data: { permissions: [] } })),
      ]);
      setUsers(childrenResponse.data || []);
      setCatalog(catalogResponse.data?.permissions || []);
    } catch (fetchError) {
      const message = fetchError.response?.data?.error || fetchError.response?.data?.detail || t("team.load_error", "Unable to load team data.");
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [canManageTeam, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    const errors = validateUserForm(form, t);
    setValidationErrors(errors);
  };

  const togglePermission = (permissionCode) => {
    setForm((previous) => {
      if (permissionCode === "*") {
        return {
          ...previous,
          permissions: previous.permissions.includes("*") ? [] : ["*"],
        };
      }

      const current = previous.permissions.filter((item) => item !== "*");
      return {
        ...previous,
        permissions: current.includes(permissionCode)
          ? current.filter((item) => item !== permissionCode)
          : [...current, permissionCode],
      };
    });
    
    // Clear permissions error if any
    if (validationErrors.permissions) {
      setValidationErrors((prev) => ({ ...prev, permissions: "" }));
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    
    const errors = validateUserForm(form, t);
    setValidationErrors(errors);
    
    // Mark all fields as touched
    const allTouched = Object.keys(form).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setTouchedFields(allTouched);
    
    if (Object.keys(errors).length > 0) {
      const firstError = document.querySelector('.input-error');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast(t("validation.fix_errors", "Please fix the errors before submitting"), "error");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await createChildUser(form);
      setSuccessMessage(t("team.created", "Child account created successfully."));
      showToast(t("team.created", "Child account created successfully."), "success");
      setForm({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        phone_number: "",
        country: user?.country || "MA",
        city: "",
        address: "",
        permissions: defaultPermissions,
      });
      setValidationErrors({});
      setTouchedFields({});
      await fetchData();
    } catch (createError) {
      const data = createError.response?.data;
      const backendError = data?.error || data?.detail || data?.message;
      
      // Handle specific backend errors
      if (backendError?.includes("email") || backendError?.includes("Email")) {
        setValidationErrors((prev) => ({ ...prev, email: backendError }));
      } else if (backendError?.includes("username") || backendError?.includes("Username")) {
        setValidationErrors((prev) => ({ ...prev, username: backendError }));
      } else {
        setError(backendError || t("team.create_error", "Unable to create child account."));
      }
      
      showToast(backendError || t("team.create_error", "Unable to create child account."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (child) => {
    setError("");
    setSuccessMessage("");

    try {
      await updateChildUserStatus(child.id, { is_active: !child.is_active });
      const message = child.is_active ? t("team.deactivated", "Account deactivated.") : t("team.activated", "Account activated.");
      setSuccessMessage(message);
      showToast(message, "success");
      await fetchData();
    } catch (toggleError) {
      const data = toggleError.response?.data;
      const message = data?.error || data?.detail || t("team.update_error", "Unable to update account.");
      setError(message);
      showToast(message, "error");
    }
  };

  const openPermissionEditor = (child) => {
    setEditingChild(child);
    setEditPermissions(child.permissions || []);
    setError("");
    setSuccessMessage("");
  };

  const toggleEditPermission = (permissionCode) => {
    setEditPermissions((previous) => {
      if (permissionCode === "*") {
        return previous.includes("*") ? [] : ["*"];
      }

      const current = previous.filter((item) => item !== "*");
      return current.includes(permissionCode)
        ? current.filter((item) => item !== permissionCode)
        : [...current, permissionCode];
    });
  };

  const handleSavePermissions = async () => {
    if (!editingChild?.id) return;

    setEditSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await updateChildUserStatus(editingChild.id, { permissions: editPermissions });
      setSuccessMessage(t("team.permissions_updated", "Permissions updated."));
      showToast(t("team.permissions_updated", "Permissions updated."), "success");
      setEditingChild(null);
      await fetchData();
    } catch (updateError) {
      const data = updateError.response?.data;
      const message = data?.error || data?.detail || t("team.update_error", "Unable to update account.");
      setError(message);
      showToast(message, "error");
    } finally {
      setEditSaving(false);
    }
  };

  if (!canManageTeam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-6">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-xl"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <LockKeyhole size={32} className="text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t("team.restricted", "Team access restricted")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("team.restricted_text", "This account does not have permission to manage child users.")}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6">
      <AnimatePresence>
        {toastMsg && <Toast message={toastMsg.message} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              {t("team.title", "Team Management")}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {t("team.subtitle", "Create child accounts and assign precise CRM permissions.")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-200 dark:border-blue-800">
              <span className="text-sm font-semibold text-white dark:text-black">
                {users.length} {t("team.accounts", "accounts")}
              </span>
            </div>
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[480px_minmax(0,1fr)]">
          {/* Create User Form */}
          <motion.form 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleCreate}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10">
                <UserPlus size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="font-semibold text-gray-800 dark:text-white">
                {t("team.create", "Create child user")}
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <input 
                  className={clsx(inputClass, touchedFields.first_name && validationErrors.first_name && "border-red-500 focus:ring-red-500")}
                  name="first_name" 
                  placeholder={t("team.first_name", "First name")} 
                  value={form.first_name} 
                  onChange={handleChange}
                  onBlur={() => handleBlur("first_name")}
                />
                {touchedFields.first_name && validationErrors.first_name && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={10} /> {validationErrors.first_name}
                  </p>
                )}
              </div>
              <div>
                <input 
                  className={clsx(inputClass, touchedFields.last_name && validationErrors.last_name && "border-red-500 focus:ring-red-500")}
                  name="last_name" 
                  placeholder={t("team.last_name", "Last name")} 
                  value={form.last_name} 
                  onChange={handleChange}
                  onBlur={() => handleBlur("last_name")}
                />
                {touchedFields.last_name && validationErrors.last_name && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.last_name}</p>
                )}
              </div>
              <div>
                <input 
                  className={clsx(inputClass, touchedFields.username && validationErrors.username && "border-red-500 focus:ring-red-500")}
                  name="username" 
                  placeholder={t("team.username", "Username")} 
                  value={form.username} 
                  onChange={handleChange}
                  onBlur={() => handleBlur("username")}
                />
                {touchedFields.username && validationErrors.username && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.username}</p>
                )}
              </div>
              <div>
                <input 
                  className={clsx(inputClass, touchedFields.email && validationErrors.email && "border-red-500 focus:ring-red-500")}
                  name="email" 
                  type="email"
                  placeholder={t("team.email", "Email")} 
                  value={form.email} 
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                />
                {touchedFields.email && validationErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
                )}
              </div>
              <div className="relative">
                <input 
                  className={clsx(inputClass, touchedFields.password && validationErrors.password && "border-red-500 focus:ring-red-500", "pr-10")}
                  name="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder={t("team.password", "Password")} 
                  value={form.password} 
                  onChange={handleChange}
                  onBlur={() => handleBlur("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {touchedFields.password && validationErrors.password && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
                )}
              </div>
              <div>
                <input 
                  className={clsx(inputClass, touchedFields.phone_number && validationErrors.phone_number && "border-red-500 focus:ring-red-500")}
                  name="phone_number" 
                  placeholder={t("team.phone", "Phone number")} 
                  value={form.phone_number} 
                  onChange={handleChange}
                  onBlur={() => handleBlur("phone_number")}
                />
                {touchedFields.phone_number && validationErrors.phone_number && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.phone_number}</p>
                )}
              </div>
              <div>
                <input 
                  className={inputClass}
                  name="country" 
                  placeholder={t("team.country", "Country")} 
                  value={form.country} 
                  onChange={handleChange}
                />
              </div>
              <div>
                <input 
                  className={inputClass}
                  name="city" 
                  placeholder={t("team.city", "City")} 
                  value={form.city} 
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Permissions Section */}
            <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/30">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-emerald-500 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                  {t("team.permissions", "Permissions")}
                </span>
              </div>
              
              {/* Preset Buttons */}
              <div className="mb-3 grid gap-2 sm:grid-cols-2">
                {permissionPresets.map((preset) => (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-left transition-all hover:border-emerald-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <preset.icon size={14} className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{preset.label}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{preset.description}</p>
                  </button>
                ))}
              </div>
              
              {/* Permissions List */}
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {allowedCatalog.map((permission) => (
                  <PermissionBadge
                    key={permission.code}
                    permission={permission}
                    checked={form.permissions.includes(permission.code)}
                    onToggle={togglePermission}
                    disabled={false}
                  />
                ))}
              </div>
              
              {validationErrors.permissions && (
                <p className="mt-2 text-xs text-red-500">{validationErrors.permissions}</p>
              )}
              
              {/* Permission Preview */}
              {permissionPreview.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    {t("team.access_preview", "Access preview")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {permissionPreview.slice(0, 6).map((label) => (
                      <span key={label} className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs">
                        {label.split('.').pop()}
                      </span>
                    ))}
                    {permissionPreview.length > 6 && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs">
                        +{permissionPreview.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <AnimatePresence>
              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
                >
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Check size={14} />
                    <span className="text-sm">{successMessage}</span>
                  </div>
                </motion.div>
              )}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20"
                >
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <AlertCircle size={14} />
                    <span className="text-sm">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              className={clsx(primaryButton, "w-full mt-4")} 
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t("team.creating", "Creating...")}
                </>
              ) : (
                <>
                  <Plus size={16} />
                  {t("team.create_submit", "Create child user")}
                </>
              )}
            </button>
          </motion.form>

          {/* Users List */}
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                <Users size={18} className="text-white dark:text-black" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  {t("team.existing", "Existing users")}
                </h2>
                <p className="text-xs text-gray-500">
                  {t("team.existing_subtitle", "Quick status controls and assigned permissions.")}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
                <p className="text-sm text-gray-500">{t("common.loading", "Loading...")}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Users size={24} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("team.empty", "No child accounts yet.")}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {users.map((child) => (
                  <UserCard
                    key={child.id}
                    user={child}
                    onEditPermissions={openPermissionEditor}
                    onToggleStatus={handleToggleStatus}
                    t={t}
                  />
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </div>

      {/* Edit Permissions Modal */}
      <AnimatePresence>
        {editingChild && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setEditingChild(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
            >
              <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                
                <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
                      <ShieldCheck size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t("team.edit_permissions", "Edit permissions")}
                      </h3>
                      <p className="text-xs text-gray-500">{editingChild.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingChild(null)} 
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
                
                <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {permissionPresets.map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => applyPreset(preset, "edit")}
                        className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-left transition-all hover:border-emerald-300"
                      >
                        <div className="flex items-center gap-2">
                          <preset.icon size={14} className="text-gray-700 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{preset.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {allowedCatalog.map((permission) => (
                      <PermissionBadge
                        key={permission.code}
                        permission={permission}
                        checked={editPermissions.includes(permission.code)}
                        onToggle={toggleEditPermission}
                        disabled={false}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingChild(null)}
                    className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
                  >
                    {t("common.cancel", "Cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={editSaving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {editSaving && <Loader2 size={16} className="animate-spin" />}
                    {editSaving ? t("common.saving", "Saving...") : t("common.save", "Save")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamUsersPage;