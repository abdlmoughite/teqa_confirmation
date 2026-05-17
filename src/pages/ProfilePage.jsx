import { useContext, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VenusAndMars as VenusMars } from 'lucide-react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Store,
  Shield,
  Settings,
  Bell,
  Moon,
  Sun,
  Monitor,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit3,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  ChevronRight,
  Globe,
  Briefcase,
  CreditCard,
  Award,
  Star,
  TrendingUp,
  Users,
  Clock,
  Lock,
  Smartphone,
  Home,
  Flag,
  Image,
  Upload,
  Trash2,
  AtSign,
  Hash,
  Cake,
  IdCard,
  BookOpen,
  Heart,
  Zap,
  Sparkles,
  Compass,
  Coffee,
  Gift,
  Rocket,
  Diamond,
  Crown
} from "lucide-react";

import { updateLanguage, updateProfile } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "../hooks/useTranslation";

/* =========================================================
   UTILITIES
========================================================= */

const normalizeDate = (value) => (value ? String(value).slice(0, 10) : "");

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};

/* =========================================================
   VALIDATION
========================================================= */

const validateUserForm = (form) => {
  const errors = {};
  
  if (!form.first_name?.trim()) errors.first_name = "First name is required";
  else if (form.first_name.length < 2) errors.first_name = "Minimum 2 characters";
  
  if (!form.last_name?.trim()) errors.last_name = "Last name is required";
  else if (form.last_name.length < 2) errors.last_name = "Minimum 2 characters";
  
  if (!form.username?.trim()) errors.username = "Username is required";
  else if (form.username.length < 3) errors.username = "Minimum 3 characters";
  else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errors.username = "Letters, numbers, underscore only";
  
  if (!form.email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email format";
  
  if (!form.phone_number?.trim()) errors.phone_number = "Phone number is required";
  if (!form.country?.trim()) errors.country = "Country is required";
  if (!form.city?.trim()) errors.city = "City is required";
  
  return errors;
};

/* =========================================================
   COMPONENTS
========================================================= */

const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden ${className}`}
  >
    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
          {/* Noir en dark mode, blanc en light mode */}
          <Icon size={18} className="text-white dark:text-black" />
        </div>

        <h2 className="font-semibold text-gray-800 dark:text-white">
          {title}
        </h2>
      </div>
    </div>

    <div className="p-5">{children}</div>
  </motion.div>
);

const FormField = ({ label, name, value, onChange, type = "text", error, required, placeholder, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
      {Icon && <Icon size={14} className="text-gray-400" />}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 ${
          error ? "border-red-400 focus:ring-red-500" : "border-gray-200 dark:border-gray-700 focus:border-blue-400"
        } bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
      />
    </div>
    {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error, required, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
      {Icon && <Icon size={14} className="text-gray-400" />}
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2.5 rounded-xl border transition-all duration-200 ${
        error ? "border-red-400" : "border-gray-200 dark:border-gray-700"
      } bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400`}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

const TextareaField = ({ label, name, value, onChange, rows = 3, placeholder, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
      {Icon && <Icon size={14} className="text-gray-400" />}
      {label}
    </label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all resize-none"
    />
  </div>
);

const StatBadge = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
    green: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    purple: "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400",
    gray: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${colors[color]}`}>
      <Icon size={14} />
      <span className="text-xs font-medium">{label}</span>
      <span className="text-sm font-bold ml-auto">{value}</span>
    </div>
  );
};

const PermissionBadge = ({ permission }) => (
  <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center gap-1">
    <Shield size={10} />
    {permission.split('.').pop()}
  </span>
);

const ImageUploader = ({ label, imagePreview, onImageChange, onImageRemove, icon: Icon, size = "md" }) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600`}>
          {imagePreview ? (
            <img src={imagePreview} alt={label} className="w-full h-full object-cover" />
          ) : (
            <Icon size={size === "sm" ? 24 : 32} className="text-gray-400" />
          )}
        </div>
        <label className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer shadow-sm hover:bg-gray-50 transition">
          <Camera size={14} className="text-gray-500" />
          <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
        </label>
        {imagePreview && (
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 2MB</p>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ProfilePage = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const toast = useToast();
  const { t, dir } = useTranslation();
  
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [roleLogoFile, setRoleLogoFile] = useState(null);
  const [roleLogoPreview, setRoleLogoPreview] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("user");
  
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone_number: "",
    birth_date: "",
    gender: "",
    country: "",
    city: "",
    address: "",
    language: "fr",
    theme: "light",
    public_profile: true,
  });
  
  const [roleForm, setRoleForm] = useState({});

  // Role configuration
  const roleConfig = useMemo(() => {
    if (user?.is_child) {
      return null;
    }

    if (user?.role === "STORE" && user?.store) {
      return {
        title: "Store Information",
        icon: Store,
        color: "green",
        hasLogo: true,
        logoLabel: "Store Logo",
        fields: [
          { name: "store_name", label: "Store Name", type: "text", required: true, placeholder: "Your store name", icon: Store },
          { name: "activity_sector", label: "Activity Sector", type: "text", required: true, placeholder: "e.g., Retail, Services", icon: Briefcase },
          { name: "subscription_plan", label: "Subscription Plan", type: "text", placeholder: "Basic, Pro, Enterprise", icon: CreditCard },
          { name: "store_address", label: "Store Address", type: "text", placeholder: "Full address", icon: MapPin },
          { name: "website", label: "Website", type: "text", placeholder: "https://...", icon: Globe },
        ],
      };
    }
    if (user?.role === "AGENCY_OWNER" && user?.agency) {
      return {
        title: "Agency Information",
        icon: Building2,
        color: "purple",
        hasLogo: true,
        logoLabel: "Agency Logo",
        fields: [
          { name: "agency_name", label: "Agency Name", type: "text", required: true, placeholder: "Your agency name", icon: Building2 },
          { name: "industry", label: "Industry", type: "text", placeholder: "Marketing, Consulting, etc.", icon: Briefcase },
          { name: "description", label: "Description", type: "textarea", placeholder: "Tell about your agency...", icon: BookOpen },
        ],
      };
    }
    if (user?.agent) {
      return {
        title: "Professional Details",
        icon: Briefcase,
        color: "amber",
        hasLogo: true,
        logoLabel: "Profile Photo",
        fields: [
          { name: "agent_first_name", label: "First Name", type: "text", required: true, icon: User },
          { name: "agent_last_name", label: "Last Name", type: "text", required: true, icon: User },
          { name: "bio", label: "Bio", type: "textarea", placeholder: "Short description about yourself...", icon: BookOpen },
          { name: "skills", label: "Skills", type: "text", placeholder: "e.g., React, Python, Marketing", icon: Star },
          { name: "portfolio_url", label: "Portfolio URL", type: "text", placeholder: "https://...", icon: Globe },
        ],
      };
    }
    return null;
  }, [user]);

  useEffect(() => {
    if (user?.is_child && activeSection === "role") {
      setActiveSection("user");
    }
  }, [activeSection, user?.is_child]);

  // Load user data
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        username: user.username || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        birth_date: normalizeDate(user.birth_date),
        gender: user.gender || "",
        country: user.country || "",
        city: user.city || "",
        address: user.address || "",
        language: user.language || "fr",
        theme: user.theme || "light",
        public_profile: user.public_profile ?? true,
      });
      setAvatarPreview(user.avatar || "");
      
      if (user.store) {
        setRoleForm({
          store_name: user.store.store_name || "",
          activity_sector: user.store.activity_sector || "",
          subscription_plan: user.store.subscription_plan || "",
          store_address: user.store.store_address || "",
          website: user.store.website || "",
        });
        setRoleLogoPreview(user.store.logo || "");
      } else if (user.agency) {
        setRoleForm({
          agency_name: user.agency.agency_name || "",
          industry: user.agency.industry || "",
          description: user.agency.description || "",
        });
        setRoleLogoPreview(user.agency.logo || "");
      } else if (user.agent) {
        setRoleForm({
          agent_first_name: user.agent.first_name || "",
          agent_last_name: user.agent.last_name || "",
          bio: user.agent.bio || "",
          skills: user.agent.skills || "",
          portfolio_url: user.agent.portfolio_url || "",
        });
        setRoleLogoPreview(user.agent.photo || "");
      }
    }
  }, [user]);

  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  useEffect(() => {
    if (!roleLogoFile) return;
    const url = URL.createObjectURL(roleLogoFile);
    setRoleLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [roleLogoFile]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
    setSubmitError("");
  };

  const handleRoleChange = (e) => {
    const { name, value } = e.target;
    setRoleForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file);
    } else if (file) {
      toast.error("Please select a valid image file", "Avatar");
    }
  };

  const handleRoleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setRoleLogoFile(file);
    } else if (file) {
      toast.error("Please select a valid image file", "Logo");
    }
  };

  const handleRoleLogoRemove = () => {
    setRoleLogoFile(null);
    setRoleLogoPreview("");
  };

  const buildPayload = () => {
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined && key !== "avatar") {
        payload.append(key, value);
      }
    });

    if (!user?.is_child) {
      Object.entries(roleForm).forEach(([key, value]) => {
        if (value) payload.append(key, value);
      });
    }

    if (avatarFile) payload.append("avatar", avatarFile);
    
    // Add role logo based on user role
    if (roleLogoFile && !user?.is_child) {
      if (user?.role === "STORE") {
        payload.append("logo", roleLogoFile);
      } else if (user?.role === "AGENCY_OWNER") {
        payload.append("logo", roleLogoFile);
      } else if (user?.agent) {
        payload.append("agent_photo", roleLogoFile);
      }
    }
    
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateUserForm(form);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setSubmitError("Please fix the errors above before saving");
      return;
    }
    
    setSaving(true);
    setSubmitError("");
    setSubmitSuccess("");
    
    try {
      await updateProfile(buildPayload());
      await updateLanguage({ language: form.language });
      await refreshUser();
      setSubmitSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!", "Success");
      setTimeout(() => setSubmitSuccess(""), 3000);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Failed to update profile";
      setSubmitError(msg);
      toast.error(msg, "Error");
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.first_name?.[0] || form.username?.[0] || "U").toUpperCase();
  const fullName = `${form.first_name} ${form.last_name}`.trim();
  const completionRate = Math.min(100, Math.floor(Object.values(form).filter(v => v && v !== "").length / 15 * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
            <Crown size={24} className="text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles size={12} />
              {user?.is_child
                ? "Manage your personal user information. Store and agency settings stay with the parent account."
                : "Manage your account information and preferences"}
            </p>
          </div>
        </div>

        {/* Section Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveSection("user")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeSection === "user"
                ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-800"
            }`}
          >
            <User size={14} />
            Personal Info
          </button>
          {roleConfig && (
            <button
              onClick={() => setActiveSection("role")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeSection === "role"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800"
              }`}
            >
              <roleConfig.icon size={14} />
              {roleConfig.title}
            </button>
          )}
        </div>

        {/* Error/Success Messages */}
        <AnimatePresence>
          {(submitError || submitSuccess) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-xl ${
                submitError 
                  ? "bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                  : "bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20"
              }`}
            >
              <div className={`flex items-center gap-2 ${submitError ? "text-red-700 dark:text-red-400" : "text-emerald-700 dark:text-emerald-400"}`}>
                {submitError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span className="text-sm">{submitError || submitSuccess}</span>
                <button onClick={() => { setSubmitError(""); setSubmitSuccess(""); }} className="ml-auto">
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Avatar & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <InfoCard title="Profile Photo" icon={Camera}>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-1.5 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer shadow-sm hover:bg-gray-50 transition">
                    <Camera size={14} className="text-gray-500" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">{fullName || "Your Name"}</h3>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  <AtSign size={12} />
                  @{form.username}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <div className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-xs font-medium flex items-center gap-1">
                    <Shield size={10} />
                    {user?.role?.replace("_", " ")}
                  </div>
                  {user?.is_child && (
                    <div className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium flex items-center gap-1">
                      <Users size={10} />
                      Child
                    </div>
                  )}
                </div>
              </div>
            </InfoCard>

            {/* Stats Card */}
            <InfoCard title="Account Stats" icon={TrendingUp}>
              <div className="space-y-3">
                <StatBadge label="Member Since" value={formatDate(user?.created_at)} icon={Calendar} color="blue" />
                <StatBadge label="Profile Completion" value={`${completionRate}%`} icon={CheckCircle2} color="green" />
                <StatBadge label="Account Status" value={user?.status || "Active"} icon={Shield} color="purple" />
              </div>
            </InfoCard>

            {/* Permissions Card */}
            {user?.permissions && user.permissions.length > 0 && (
              <InfoCard title="Permissions" icon={Lock}>
                <div className="flex flex-wrap gap-1.5">
                  {user.permissions.slice(0, 8).map((perm) => (
                    <PermissionBadge key={perm} permission={perm} />
                  ))}
                  {user.permissions.length > 8 && (
                    <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 text-xs flex items-center gap-1">
                      <Hash size={10} />
                      +{user.permissions.length - 8} more
                    </span>
                  )}
                </div>
              </InfoCard>
            )}

            {/* Preferences Card */}
            <InfoCard title="Preferences" icon={Settings}>
              <div className="space-y-3">
                <SelectField
                  label="Language"
                  name="language"
                  value={form.language}
                  onChange={handleChange}
                  icon={Globe}
                  options={[
                    { value: "fr", label: "🇫🇷 Français" },
                    { value: "en", label: "🇬🇧 English" },
                    { value: "ar", label: "🇸🇦 العربية" },
                  ]}
                />
                <SelectField
                  label="Theme"
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  icon={Paintbrush}
                  options={[
                    { value: "light", label: "☀️ Light" },
                    { value: "dark", label: "🌙 Dark" },
                    { value: "system", label: "💻 System" },
                  ]}
                />
                <label className="flex items-center justify-between cursor-pointer pt-2">
                  <div className="flex items-center gap-2">
                    <Globe size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Public Profile</span>
                  </div>
                  <input
                    type="checkbox"
                    name="public_profile"
                    checked={form.public_profile}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                </label>
              </div>
            </InfoCard>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {/* User Information Section */}
                {activeSection === "user" && (
                  <motion.div
                    key="user"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <InfoCard title="Personal Information" icon={User}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          label="First Name"
                          name="first_name"
                          value={form.first_name}
                          onChange={handleChange}
                          error={validationErrors.first_name}
                          required
                          placeholder="John"
                          icon={User}
                        />
                        <FormField
                          label="Last Name"
                          name="last_name"
                          value={form.last_name}
                          onChange={handleChange}
                          error={validationErrors.last_name}
                          required
                          placeholder="Doe"
                          icon={User}
                        />
                        <FormField
                          label="Username"
                          name="username"
                          value={form.username}
                          onChange={handleChange}
                          error={validationErrors.username}
                          required
                          placeholder="johndoe"
                          icon={AtSign}
                        />
                        <FormField
                          label="Birth Date"
                          name="birth_date"
                          type="date"
                          value={form.birth_date}
                          onChange={handleChange}
                          icon={Calendar}
                        />
                        <SelectField
                          label="Gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          icon={VenusMars}
                          options={[
                            { value: "", label: "Select" },
                            { value: "male", label: "Male" },
                            { value: "female", label: "Female" },
                            { value: "other", label: "Other" },
                          ]}
                        />
                      </div>
                    </InfoCard>

                    <InfoCard title="Contact Details" icon={Mail}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          label="Email Address"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          error={validationErrors.email}
                          required
                          placeholder="john@example.com"
                          icon={Mail}
                        />
                        <FormField
                          label="Phone Number"
                          name="phone_number"
                          type="tel"
                          value={form.phone_number}
                          onChange={handleChange}
                          error={validationErrors.phone_number}
                          required
                          placeholder="+212 6XX XXX XXX"
                          icon={Phone}
                        />
                      </div>
                    </InfoCard>

                    <InfoCard title="Location" icon={MapPin}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          label="Country"
                          name="country"
                          value={form.country}
                          onChange={handleChange}
                          error={validationErrors.country}
                          required
                          placeholder="Morocco"
                          icon={Flag}
                        />
                        <FormField
                          label="City"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          error={validationErrors.city}
                          required
                          placeholder="Casablanca"
                          icon={MapPin}
                        />
                        <FormField
                          label="Address"
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          placeholder="Street, building, apartment"
                          icon={Home}
                          className="md:col-span-2"
                        />
                      </div>
                    </InfoCard>
                  </motion.div>
                )}

                {/* Role Information Section */}
                {activeSection === "role" && roleConfig && (
                  <motion.div
                    key="role"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <InfoCard title={roleConfig.title} icon={roleConfig.icon}>
                      {/* Logo Upload */}
                      {roleConfig.hasLogo && (
                        <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                          <ImageUploader
                            label={roleConfig.logoLabel}
                            imagePreview={roleLogoPreview}
                            onImageChange={handleRoleLogoChange}
                            onImageRemove={handleRoleLogoRemove}
                            icon={roleConfig.icon}
                            size="md"
                          />
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        {roleConfig.fields.map((field) => (
                          field.type === "textarea" ? (
                            <TextareaField
                              key={field.name}
                              label={field.label}
                              name={field.name}
                              value={roleForm[field.name] || ""}
                              onChange={handleRoleChange}
                              placeholder={field.placeholder}
                              rows={field.rows || 3}
                              icon={field.icon || BookOpen}
                            />
                          ) : (
                            <FormField
                              key={field.name}
                              label={field.label}
                              name={field.name}
                              value={roleForm[field.name] || ""}
                              onChange={handleRoleChange}
                              type={field.type || "text"}
                              required={field.required}
                              placeholder={field.placeholder}
                              icon={field.icon}
                            />
                          )
                        ))}
                      </div>
                    </InfoCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant manquant pour le thème
const Paintbrush = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18.37 2.63 14 7l-1.5-1.5L5 13l3 3L9.5 14.5 14 18l4.5-4.5-1.5-1.5 4.37-4.37a2.12 2.12 0 0 0 0-3l-1.5-1.5a2.12 2.12 0 0 0-3 0Z" />
    <path d="m9 8-1 1" />
    <path d="m6 13-1 1" />
    <path d="M17 14a4 4 0 0 0-4 4" />
    <path d="M21 18a4 4 0 0 0-4-4" />
  </svg>
);

export default ProfilePage;