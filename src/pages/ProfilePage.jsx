import { useContext, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VenusAndMars as VenusMars } from 'lucide-react';
import {
  User, Mail, Phone, MapPin, Calendar, Building2, Store, Shield, Settings,
  Camera, Save, CheckCircle2, AlertCircle, Loader2, Edit3, X, Globe,
  Briefcase, CreditCard, Award, Star, TrendingUp, Users, Clock, Lock,
  Home, Flag, Trash2, AtSign, Hash, BookOpen, Heart,
  Sparkles, Diamond, Crown, Wifi, Headphones, Monitor,
  BarChart2, Languages, Target, BadgeCheck, Info,
  AlarmClock, Layers,
} from "lucide-react";

import { updateLanguage, updateProfile, GetMyKYCStatus, InitiateKYC, GetProviderBadgeSummary, GetBankAccount, UpdateBankAccount } from "../api/auth";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "../hooks/useTranslation";

/* =========================================================
   CONSTANTS
========================================================= */
const LANGUAGES_OPTIONS = ["french","english","arabic","spanish","german","italian","portuguese","dutch","chinese","other"];
const NICHES_OPTIONS    = ["e-commerce","insurance","real_estate","telecoms","banking","health","education","travel","automotive","other"];
const CRM_OPTIONS       = ["salesforce","hubspot","zoho","dynamics","pipedrive","monday","other"];
const DAYS_OPTIONS      = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAYS_SHORT        = { monday:"Mon", tuesday:"Tue", wednesday:"Wed", thursday:"Thu", friday:"Fri", saturday:"Sat", sunday:"Sun" };

// All known valid tokens across all multi-select fields
const KNOWN_TOKENS = new Set([
  "french","english","arabic","spanish","german","italian","portuguese","dutch","chinese","other",
  "e-commerce","insurance","real_estate","telecoms","banking","health","education","travel","automotive",
  "salesforce","hubspot","zoho","dynamics","pipedrive","monday",
  "tuesday","wednesday","thursday","friday","saturday","sunday",
  "home","coworking","office","full_time","part_time","freelance",
  "local","national","international","fiber","adsl","4g","5g",
  "single","married","divorced","widowed","high_school","bachelor","master","phd",
]);

const LANG_LABELS = {
  french:"Français", english:"English", arabic:"العربية", spanish:"Español",
  german:"Deutsch", italian:"Italiano", portuguese:"Português",
  dutch:"Nederlands", chinese:"中文", other:"Autre",
};

const BADGE_META = {
  verified:           { label: "Verified",    icon: BadgeCheck },
  registered_company: { label: "Company",     icon: Building2 },
  volume_1k:          { label: "1K Orders",   icon: BarChart2 },
  volume_10k:         { label: "10K Orders",  icon: BarChart2 },
  volume_100k:        { label: "100K Orders", icon: BarChart2 },
  silver:             { label: "Silver",      icon: Award },
  gold:               { label: "Gold",        icon: Award },
  platinum:           { label: "Platinum",    icon: Diamond },
};

const KYC_STATUS_META = {
  not_required:             { label: "Not Required", icon: Info },
  required:                 { label: "Required",     icon: AlertCircle },
  initiated:                { label: "Initiated",    icon: Loader2 },
  pending_review:           { label: "Under Review", icon: Clock },
  approved:                 { label: "Approved",     icon: CheckCircle2 },
  rejected:                 { label: "Rejected",     icon: X },
  resubmission_requested:   { label: "Resubmit",     icon: Edit3 },
};

/* =========================================================
   ICON COLOR — one consistent style across the whole page
   All icons use the same muted green-gray tone
========================================================= */
const IC = "text-emerald-600 dark:text-emerald-500";   // primary icon color
const IC_SM = "text-emerald-500 dark:text-emerald-400"; // smaller / lighter

/* =========================================================
   ROBUST MULTI-SELECT PARSER
   Strategy: extract all word-like tokens, filter against known values,
   deduplicate. Handles any level of JSON encoding / bracket fragments.
========================================================= */
const toArray = (val) => {
  if (!val) return [];

  const extractTokens = (v, depth = 0) => {
    if (depth > 10) return [];
    if (Array.isArray(v)) return v.flatMap(el => extractTokens(el, depth + 1));
    if (typeof v !== "string") return [];

    let s = v.trim();
    if (!s) return [];

    // Try JSON parse first to unwrap encoded strings / arrays
    if (s.startsWith("[") || s.startsWith('"')) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) || typeof parsed === "string") {
          const r = extractTokens(parsed, depth + 1);
          if (r.length > 0) return r;
        }
      } catch (_) {}
    }

    // Extract all word-like tokens (letters + digits + - + _)
    // This handles fragments like `["french"` or `"insurance"]`
    const tokens = s.match(/[a-zA-Z][a-zA-Z0-9_-]*/g) || [];
    return tokens.map(t => t.toLowerCase()).filter(t => t.length > 1);
  };

  const raw = extractTokens(val);

  // Filter to known vocabulary (removes noise like stray words "french" in JSON keys)
  const known = raw.filter(t => KNOWN_TOKENS.has(t));
  const result = known.length > 0 ? known : raw;

  return [...new Set(result)]; // deduplicate
};

const normalizeDate = (v) => (v ? String(v).slice(0, 10) : "");
const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};

/* =========================================================
   VALIDATION
========================================================= */
const validateUserForm = (form) => {
  const e = {};
  if (!form.first_name?.trim())  e.first_name  = "First name is required";
  else if (form.first_name.length < 2)  e.first_name = "Minimum 2 characters";
  if (!form.last_name?.trim())   e.last_name   = "Last name is required";
  else if (form.last_name.length < 2)   e.last_name  = "Minimum 2 characters";
  if (!form.username?.trim())    e.username    = "Username is required";
  else if (form.username.length < 3)    e.username   = "Minimum 3 characters";
  else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = "Letters, numbers, underscore only";
  if (!form.email?.trim())       e.email       = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email format";
  if (!form.phone_number?.trim()) e.phone_number = "Phone number is required";
  if (!form.country?.trim())     e.country     = "Country is required";
  if (!form.city?.trim())        e.city        = "City is required";
  return e;
};

/* =========================================================
   DESIGN — shared Tailwind classes
========================================================= */
const cls = {
  page:        "min-h-screen ",
  card:        "rounded-2xl bg-white dark:bg-[#13161d] border border-gray-100 dark:border-white/[0.07] shadow-sm overflow-hidden",
  cardHeader:  "px-5 py-3.5 border-b border-gray-100 dark:border-white/[0.07] bg-gray-50/70 dark:bg-white/[0.02]",
  input:       "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ring-2 ring-transparent transition-all duration-150 bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.09] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-emerald-500/15",
  inputErr:    "border-red-400 dark:border-red-500/70 focus:ring-red-500/15 bg-red-50/30 dark:bg-red-500/5",
  select:      "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.09] text-gray-900 dark:text-white focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15",
  label:       "text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-[0.1em] flex items-center gap-1.5",
  chip:        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
  chipGreen:   "bg-emerald-50 dark:bg-emerald-500/[0.12] text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/25",
  chipGray:    "bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.08]",
  chipActive:  "bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 dark:border-emerald-500 shadow-sm shadow-emerald-500/20",
  chipInactive:"bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/[0.08] hover:border-emerald-300 dark:hover:border-emerald-500/40 hover:text-emerald-700 dark:hover:text-emerald-400",
  btn:         "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50",
  btnGreen:    "bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20",
  btnOutline:  "bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.1] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.08]",
  sectionLabel:"flex items-center gap-2 mb-3",
  sectionLabelText: "text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.12em]",
};

/* =========================================================
   UI COMPONENTS
========================================================= */

const Card = ({ title, icon: Icon, children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22, ease: "easeOut" }}
    className={`${cls.card} ${className}`}
  >
    <div className={cls.cardHeader}>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
          <Icon size={14} className={IC} />
        </div>
        <h2 className="text-sm font-semibold text-gray-800 dark:text-white tracking-[-0.01em]">{title}</h2>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </motion.div>
);

const FormField = ({ label, name, value, onChange, type = "text", error, required, placeholder, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className={cls.label}>
      {Icon && <Icon size={11} className={IC_SM} />}
      {label}
      {required && <span className="text-red-500 normal-case tracking-normal font-bold">*</span>}
    </label>
    <input
      type={type} name={name} value={value ?? ""} onChange={onChange} placeholder={placeholder}
      className={`${cls.input} ${error ? cls.inputErr : ""}`}
    />
    {error && <p className="text-xs text-red-500 dark:text-red-400 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error, required, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className={cls.label}>
      {Icon && <Icon size={11} className={IC_SM} />}
      {label}
      {required && <span className="text-red-500 normal-case font-bold">*</span>}
    </label>
    <select name={name} value={value ?? ""} onChange={onChange}
      className={`${cls.select} ${error ? "border-red-400 dark:border-red-500/70" : ""}`}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}
  </div>
);

const TextareaField = ({ label, name, value, onChange, rows = 3, placeholder, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className={cls.label}>
      {Icon && <Icon size={11} className={IC_SM} />}
      {label}
    </label>
    <textarea name={name} value={value || ""} onChange={onChange} rows={rows} placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none ring-2 ring-transparent transition-all bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.09] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 focus:border-emerald-400 dark:focus:border-emerald-500 focus:ring-emerald-500/15 resize-none" />
  </div>
);

const ToggleField = ({ label, name, checked, onChange, icon: Icon }) => (
  <label className="flex items-center justify-between cursor-pointer group">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={13} className={IC_SM} />}
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </div>
    <div className="relative" onClick={onChange}>
      <input type="checkbox" name={name} checked={!!checked} onChange={onChange} className="sr-only" />
      <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${checked ? "bg-emerald-600 dark:bg-emerald-500" : "bg-gray-200 dark:bg-white/10"}`}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </div>
  </label>
);

const MultiSelectChips = ({ label, options, selected, onChange, icon: Icon }) => {
  const toggle = (val) => {
    const cur = Array.isArray(selected) ? selected : [];
    onChange(cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val]);
  };
  return (
    <div className="space-y-2.5">
      <label className={cls.label}>
        {Icon && <Icon size={11} className={IC_SM} />}
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const on = Array.isArray(selected) && selected.includes(opt);
          return (
            <button key={opt} type="button" onClick={() => toggle(opt)}
              className={`${cls.chip} ${on ? cls.chipActive : cls.chipInactive}`}>
              {opt.replace(/_/g, " ")}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DaySelector = ({ selected, onChange }) => {
  const toggle = (day) => {
    const cur = Array.isArray(selected) ? selected : [];
    onChange(cur.includes(day) ? cur.filter(d => d !== day) : [...cur, day]);
  };
  return (
    <div className="space-y-2.5">
      <label className={cls.label}>
        <Calendar size={11} className={IC_SM} />
        Working Days
      </label>
      <div className="flex flex-wrap gap-2">
        {DAYS_OPTIONS.map(day => {
          const on = Array.isArray(selected) && selected.includes(day);
          return (
            <button key={day} type="button" onClick={() => toggle(day)}
              className={`w-10 h-10 rounded-xl border text-[11px] font-semibold transition-all duration-150 ${on ? cls.chipActive : cls.chipInactive}`}>
              {DAYS_SHORT[day]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StatBadge = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-gray-100 dark:border-white/[0.07] bg-gray-50 dark:bg-white/[0.03] text-xs">
    <Icon size={13} className={IC} />
    <span className="font-medium text-gray-600 dark:text-gray-400">{label}</span>
    <span className="font-bold ml-auto text-gray-800 dark:text-white text-sm">{value}</span>
  </div>
);

const PermissionBadge = ({ permission }) => (
  <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 text-xs font-medium flex items-center gap-1 border border-gray-100 dark:border-white/[0.06]">
    <Shield size={9} className={IC_SM} />
    {permission.split(".").pop()}
  </span>
);

const ImageUploader = ({ label, imagePreview, onImageChange, onImageRemove, icon: Icon, size = "md" }) => {
  const sz = { sm: "w-16 h-16", md: "w-24 h-24", lg: "w-32 h-32" };
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className={`${sz[size]} rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-200 dark:border-white/[0.1]`}>
          {imagePreview
            ? <img src={imagePreview} alt={label} className="w-full h-full object-cover" />
            : <Icon size={size === "sm" ? 22 : 30} className="text-gray-300 dark:text-white/20" />}
        </div>
        <label className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-white dark:bg-[#1c2028] border border-gray-200 dark:border-white/[0.1] cursor-pointer shadow-md hover:scale-105 transition-transform">
          <Camera size={11} className={IC} />
          <input type="file" accept="image/*" onChange={onImageChange} className="hidden" />
        </label>
        {imagePreview && (
          <button type="button" onClick={onImageRemove}
            className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600 transition">
            <Trash2 size={10} />
          </button>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">PNG, JPG · max 2MB</p>
      </div>
    </div>
  );
};

/* =========================================================
   KYC SECTION
========================================================= */
const KYC_COLORS = {
  not_required:           "bg-gray-100 dark:bg-white/[0.05] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/[0.08]",
  required:               "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20",
  initiated:              "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
  pending_review:         "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
  approved:               "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
  rejected:               "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-500/20",
  resubmission_requested: "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-500/20",
};

const KYCSection = ({ kycRecord, kycLoading, initiatingKyc, onInitiate }) => {
  const status = kycRecord?.status || "not_required";
  const meta = KYC_STATUS_META[status] || KYC_STATUS_META.not_required;
  const StatusIcon = meta.icon;
  const canInitiate = ["required", "rejected", "resubmission_requested"].includes(status);
  if (kycLoading) return <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 size={14} className="animate-spin" />Loading KYC status…</div>;
  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${KYC_COLORS[status] || KYC_COLORS.not_required}`}>
        <StatusIcon size={16} className={["initiated","pending_review"].includes(status) ? "animate-spin" : ""} />
        <div>
          <p className="text-sm font-semibold">{meta.label}</p>
          {kycRecord?.triggered_at && <p className="text-xs opacity-70 mt-0.5">Triggered: {formatDate(kycRecord.triggered_at)}</p>}
          {kycRecord?.verified_at  && <p className="text-xs opacity-70 mt-0.5">Verified: {formatDate(kycRecord.verified_at)}</p>}
          {kycRecord?.reject_reason && <p className="text-xs opacity-70 mt-0.5">Reason: {kycRecord.reject_reason}</p>}
        </div>
      </div>
      {status === "not_required" && (
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">KYC will be required once your volume reaches 10,000 MAD.</p>
      )}
      {canInitiate && (
        <button type="button" onClick={onInitiate} disabled={initiatingKyc} className={`${cls.btn} ${cls.btnGreen}`}>
          {initiatingKyc ? <Loader2 size={15} className="animate-spin" /> : <Shield size={15} />}
          {initiatingKyc ? "Initializing…" : "Start Verification"}
        </button>
      )}
    </div>
  );
};

const BankDetailsSection = ({ bankAccount, bankLoading, bankSaving, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", bank_name: "", rib_iban: "", swift: "" });

  useEffect(() => {
    if (bankAccount) {
      setForm({
        full_name: bankAccount.full_name || "",
        bank_name: bankAccount.bank_name || "",
        rib_iban: bankAccount.rib_iban || "",
        swift: bankAccount.swift || "",
      });
    }
  }, [bankAccount]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    await onSave(form);
    setEditing(false);
  };

  if (bankLoading) return <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 size={14} className="animate-spin" />Loading bank details…</div>;

  if (!editing && !bankAccount) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No bank account on file yet.</p>
        <button type="button" onClick={() => setEditing(true)} className={`${cls.btn} ${cls.btnGreen}`}>
          <CreditCard size={15} /> Add bank details
        </button>
      </div>
    );
  }

  if (!editing) {
    return (
      <div className="space-y-3">
        <ViewDetailRow icon={User} label="Beneficiary" value={bankAccount.full_name} />
        <ViewDetailRow icon={Building2} label="Bank" value={bankAccount.bank_name} />
        <ViewDetailRow icon={CreditCard} label="RIB / IBAN" value={bankAccount.rib_iban} />
        {bankAccount.swift && <ViewDetailRow icon={Globe} label="SWIFT" value={bankAccount.swift} />}
        <button type="button" onClick={() => setEditing(true)} className={`${cls.btn} ${cls.btnOutline}`}>
          Edit bank details
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <FormField label="Beneficiary Full Name" name="full_name" value={form.full_name} onChange={handleChange} required icon={User} />
      <FormField label="Bank Name" name="bank_name" value={form.bank_name} onChange={handleChange} required icon={Building2} />
      <FormField label="RIB / IBAN" name="rib_iban" value={form.rib_iban} onChange={handleChange} required icon={CreditCard} />
      <FormField label="SWIFT (optional)" name="swift" value={form.swift} onChange={handleChange} icon={Globe} />
      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit} disabled={bankSaving} className={`${cls.btn} ${cls.btnGreen}`}>
          {bankSaving ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
          {bankSaving ? "Saving…" : "Save"}
        </button>
        {bankAccount && (
          <button type="button" onClick={() => setEditing(false)} className={`${cls.btn} ${cls.btnOutline}`}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   BADGES
========================================================= */
const BadgesDisplay = ({ badges, loading }) => {
  if (loading) return <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 size={14} className="animate-spin" />Loading…</div>;
  if (!badges?.length) return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
        <Award size={20} className={IC} />
      </div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No badges yet</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-relaxed">Complete verifications and reach volume milestones</p>
    </div>
  );
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(badge => {
        const meta = BADGE_META[badge.badge_type] || { label: badge.badge_type, icon: Award };
        const BadgeIcon = meta.icon;
        return (
          <div key={badge.id} className={`${cls.chip} ${cls.chipGreen}`}>
            <BadgeIcon size={13} className="mr-1" />
            {meta.label}
          </div>
        );
      })}
    </div>
  );
};

/* =========================================================
   MARKETPLACE VIEW PANEL — read-only, green palette only
========================================================= */
const DAY_ORDER = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];
const DAY_SHORT  = { monday:"Lun", tuesday:"Mar", wednesday:"Mer", thursday:"Jeu", friday:"Ven", saturday:"Sam", sunday:"Dim" };

const VIEW_FIELD_MAP = {
  marital_status:           { label: "Marital Status",    icon: Heart },
  education_level:          { label: "Education",         icon: BookOpen },
  field_of_study:           { label: "Field of Study",    icon: BookOpen },
  years_experience:         { label: "Experience",        icon: Briefcase },
  workspace_type:           { label: "Workspace",         icon: Home },
  job_type:                 { label: "Job Type",          icon: Briefcase },
  internet_connection_type: { label: "Internet",          icon: Wifi },
  daily_capacity:           { label: "Daily Capacity",    icon: Target },
  service_scope:            { label: "Service Scope",     icon: Globe },
};

const ViewDetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
    <div className="w-7 h-7 rounded-lg bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={12} className={IC} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
        {value || <span className="text-gray-400 dark:text-gray-600 font-normal italic text-xs">Not set</span>}
      </p>
    </div>
  </div>
);

const SLabel = ({ icon: Icon, text }) => (
  <div className={cls.sectionLabel}>
    <Icon size={12} className={IC} />
    <span className={cls.sectionLabelText}>{text}</span>
  </div>
);

const MarketplaceViewPanel = ({ roleForm, isAgent, onEdit }) => {
  // Always run through toArray so encoding artifacts are stripped
  const languages = toArray(roleForm.languages_spoken);
  const niches    = toArray(roleForm.niches);
  const crm       = toArray(roleForm.crm_expertise);
  const days      = toArray(roleForm.working_days);

  const deliveryRate = roleForm.delivery_rate !== undefined && roleForm.delivery_rate !== null && roleForm.delivery_rate !== "" ? Number(roleForm.delivery_rate) : null;
  const hasAny = languages.length || niches.length || crm.length || days.length ||
    roleForm.daily_capacity || roleForm.working_hours_start || roleForm.workspace_type ||
    roleForm.years_experience || roleForm.service_scope || deliveryRate !== null;

  if (!hasAny) return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`${cls.card} p-8 text-center`}>
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
        <Sparkles size={22} className={IC} />
      </div>
      <p className="text-base font-bold text-gray-900 dark:text-white mb-2">Empty marketplace profile</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed max-w-xs mx-auto">
        Complete your profile to appear in search results and receive collaborations.
      </p>
      <button type="button" onClick={onEdit} className={`inline-flex items-center gap-2 ${cls.btn} ${cls.btnGreen}`}>
        <Edit3 size={13} /> Configure profile
      </button>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cls.card}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.07] bg-gray-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
            <Sparkles size={14} className={IC} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Marketplace Profile</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Visible to buyers</p>
          </div>
        </div>
        <button type="button" onClick={onEdit}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 text-xs font-semibold transition-colors">
          <Edit3 size={12} /> Edit
        </button>
      </div>

      <div className="p-5 space-y-6">

        {/* Delivery Rate */}
        {deliveryRate !== null && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className={IC} />
                <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Delivery Rate</span>
              </div>
              <span className="text-2xl font-extrabold" style={{ color: deliveryRate >= 80 ? "#16a34a" : deliveryRate >= 60 ? "#d97706" : "#dc2626" }}>
                {deliveryRate}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
              <div style={{ width: `${deliveryRate}%`, background: deliveryRate >= 80 ? "#16a34a" : deliveryRate >= 60 ? "#d97706" : "#dc2626", height: "100%", borderRadius: 99, transition: "width 0.4s ease" }} />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">
              {deliveryRate >= 80 ? "Excellent" : deliveryRate >= 60 ? "Good" : "To improve"} · shown on marketplace
            </p>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div>
            <SLabel icon={Languages} text="Languages Spoken" />
            <div className="flex flex-wrap gap-2">
              {languages.map(l => (
                <span key={l} className={`${cls.chip} ${cls.chipGreen}`}>
                  {LANG_LABELS[l] || l}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Niches */}
        {niches.length > 0 && (
          <div>
            <SLabel icon={Target} text="Sectors / Niches" />
            <div className="flex flex-wrap gap-2">
              {niches.map(n => (
                <span key={n} className={`${cls.chip} ${cls.chipGreen}`}>
                  {n.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CRM */}
        {crm.length > 0 && (
          <div>
            <SLabel icon={Layers} text="CRM Expertise" />
            <div className="flex flex-wrap gap-2">
              {crm.map(c => (
                <span key={c} className={`${cls.chip} ${cls.chipGray}`}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Availability */}
        {(days.length > 0 || roleForm.working_hours_start || roleForm.daily_capacity) && (
          <div>
            <SLabel icon={Clock} text="Availability" />
            {days.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {DAY_ORDER.map(d => {
                  const active = days.includes(d);
                  return (
                    <span key={d}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                        active
                          ? "bg-emerald-600 dark:bg-emerald-500 text-white"
                          : "bg-gray-100 dark:bg-white/[0.05] text-gray-400 dark:text-gray-600 border border-gray-200 dark:border-white/[0.07]"
                      }`}>
                      {DAY_SHORT[d]}
                    </span>
                  );
                })}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {roleForm.working_hours_start && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/[0.05] border border-gray-100 dark:border-white/[0.07] rounded-xl px-3 py-1.5">
                  <AlarmClock size={11} className={IC} />
                  {roleForm.working_hours_start} – {roleForm.working_hours_end || "?"}
                </span>
              )}
              {roleForm.daily_capacity && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/[0.05] border border-gray-100 dark:border-white/[0.07] rounded-xl px-3 py-1.5">
                  <Target size={11} className={IC} />
                  {roleForm.daily_capacity} orders/day
                </span>
              )}
            </div>
          </div>
        )}

        {/* Scalar detail fields */}
        {(() => {
          const rows = Object.entries(VIEW_FIELD_MAP).filter(([k]) => {
            if (!isAgent && ["marital_status","education_level","field_of_study","years_experience","job_type","internet_connection_type"].includes(k)) return false;
            const v = roleForm[k];
            return v !== undefined && v !== null && v !== "";
          });
          if (!rows.length) return null;
          return (
            <div>
              <SLabel icon={Info} text="Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {rows.map(([k, meta]) => (
                  <ViewDetailRow key={k} icon={meta.icon} label={meta.label} value={String(roleForm[k]).replace(/_/g, " ")} />
                ))}
              </div>
            </div>
          );
        })()}

        {/* Status chips */}
        {(roleForm.supports_adult_products || roleForm.is_online) && (
          <div className="flex gap-2 flex-wrap pt-1">
            {roleForm.is_online && (
              <span className={`${cls.chip} ${cls.chipGreen}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />Online
              </span>
            )}
            {roleForm.supports_adult_products && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20">
                Adult products OK
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* =========================================================
   MAIN PAGE COMPONENT
========================================================= */
const ProfilePage = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const toast = useToast();
  const { t, dir } = useTranslation();

  const [saving, setSaving]           = useState(false);
  const [avatarFile, setAvatarFile]   = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [roleLogoFile, setRoleLogoFile]   = useState(null);
  const [roleLogoPreview, setRoleLogoPreview] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError]   = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [activeSection, setActiveSection] = useState("user");
  const [marketplaceEditMode, setMarketplaceEditMode] = useState(false);

  const [kycRecord, setKycRecord]     = useState(null);
  const [kycLoading, setKycLoading]   = useState(false);
  const [initiatingKyc, setInitiatingKyc] = useState(false);
  const [providerBadges, setProviderBadges] = useState([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [bankAccount, setBankAccount] = useState(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);

  const [form, setForm] = useState({
    first_name:"", last_name:"", username:"", email:"",
    phone_number:"", birth_date:"", gender:"", country:"",
    city:"", address:"", language:"fr", theme:"light", public_profile:true,
  });
  const [roleForm, setRoleForm] = useState({});

  const isMarketplaceUser = !user?.is_child && (user?.agent || (user?.role === "AGENCY_OWNER" && user?.agency));

  const roleConfig = useMemo(() => {
    if (user?.is_child) return null;
    if (user?.role === "STORE" && user?.store) return {
      title:"Store Information", icon:Store, hasLogo:true, logoLabel:"Store Logo",
      fields:[
        { name:"store_name", label:"Store Name", required:true, placeholder:"Your store name", icon:Store },
        { name:"activity_sector", label:"Activity Sector", required:true, placeholder:"e.g., Retail", icon:Briefcase },
        { name:"subscription_plan", label:"Subscription Plan", placeholder:"Basic, Pro…", icon:CreditCard },
        { name:"store_address", label:"Store Address", placeholder:"Full address", icon:MapPin },
        { name:"website", label:"Website", placeholder:"https://…", icon:Globe },
      ],
    };
    if (user?.role === "AGENCY_OWNER" && user?.agency) return {
      title:"Agency Information", icon:Building2, hasLogo:true, logoLabel:"Agency Logo",
      fields:[
        { name:"agency_name", label:"Agency Name", required:true, placeholder:"Your agency name", icon:Building2 },
        { name:"industry", label:"Industry", placeholder:"Marketing, Consulting…", icon:Briefcase },
        { name:"description", label:"Description", type:"textarea", placeholder:"About your agency…", icon:BookOpen },
      ],
    };
    if (user?.agent) return {
      title:"Professional Details", icon:Briefcase, hasLogo:true, logoLabel:"Profile Photo",
      fields:[
        { name:"agent_first_name", label:"First Name", required:true, icon:User },
        { name:"agent_last_name", label:"Last Name", required:true, icon:User },
        { name:"bio", label:"Bio", type:"textarea", placeholder:"About yourself…", icon:BookOpen },
        { name:"skills", label:"Skills", placeholder:"React, Python, Marketing…", icon:Star },
        { name:"portfolio_url", label:"Portfolio URL", placeholder:"https://…", icon:Globe },
      ],
    };
    return null;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setForm({
      first_name: user.first_name || "", last_name: user.last_name || "",
      username: user.username || "", email: user.email || "",
      phone_number: user.phone_number || "", birth_date: normalizeDate(user.birth_date),
      gender: user.gender || "", country: user.country || "",
      city: user.city || "", address: user.address || "",
      language: user.language || "fr", theme: user.theme || "light",
      public_profile: user.public_profile ?? true,
    });
    setAvatarPreview(user.avatar || "");
    if (user.store) {
      setRoleForm({ store_name:user.store.store_name||"", activity_sector:user.store.activity_sector||"", subscription_plan:user.store.subscription_plan||"", store_address:user.store.store_address||"", website:user.store.website||"" });
      setRoleLogoPreview(user.store.logo || "");
    } else if (user.agency) {
      const a = user.agency;
      setRoleForm({
        agency_name:a.agency_name||"", industry:a.industry||"", description:a.description||"",
        languages_spoken: toArray(a.languages_spoken),
        niches:           toArray(a.niches),
        crm_expertise:    toArray(a.crm_expertise),
        service_scope:a.service_scope||"", supports_adult_products:!!a.supports_adult_products,
        daily_capacity:a.daily_capacity||"",
        working_days:     toArray(a.working_days),
        working_hours_start:a.working_hours_start||"", working_hours_end:a.working_hours_end||"",
        workspace_type:a.workspace_type||"", is_online:!!a.is_online,
        delivery_rate: a.delivery_rate ?? "",
        marital_status: a.marital_status || "",
      });
      setRoleLogoPreview(a.logo || "");
    } else if (user.agent) {
      const ag = user.agent;
      setRoleForm({
        agent_first_name:ag.first_name||"", agent_last_name:ag.last_name||"",
        bio:ag.bio||"", skills:ag.skills||"", portfolio_url:ag.portfolio_url||"",
        marital_status:ag.marital_status||"", education_level:ag.education_level||"",
        field_of_study:ag.field_of_study||"", years_experience:ag.years_experience??"",
        workspace_type:ag.workspace_type||"", has_noise_canceling_headset:!!ag.has_noise_canceling_headset,
        internet_connection_type:ag.internet_connection_type||"", job_type:ag.job_type||"",
        working_days:     toArray(ag.working_days),
        working_hours_start:ag.working_hours_start||"", working_hours_end:ag.working_hours_end||"",
        daily_capacity:ag.daily_capacity??"",
        languages_spoken: toArray(ag.languages_spoken),
        niches:           toArray(ag.niches),
        crm_expertise:    toArray(ag.crm_expertise),
        service_scope:ag.service_scope||"", supports_adult_products:!!ag.supports_adult_products, is_online:!!ag.is_online,
        delivery_rate: ag.delivery_rate ?? "",
      });
      setRoleLogoPreview(ag.photo || "");
    }
  }, [user]);

  useEffect(() => {
    if (activeSection !== "marketplace" || !isMarketplaceUser) return;
    let cancelled = false;
    (async () => {
      setKycLoading(true);
      try { const r = await GetMyKYCStatus(); if (!cancelled) setKycRecord(r.data); } catch (_) {}
      finally { if (!cancelled) setKycLoading(false); }
      setBadgesLoading(true);
      try {
        const type = user?.agency ? "AGENCY_OWNER" : "AGENCY_AGENT";
        const id   = user?.agency?.id || user?.agent?.id;
        if (id) { const r = await GetProviderBadgeSummary(type, id); if (!cancelled) setProviderBadges(r.data?.badges || []); }
      } catch (_) { if (!cancelled) setProviderBadges([]); }
      finally { if (!cancelled) setBadgesLoading(false); }
      setBankLoading(true);
      try { const r = await GetBankAccount(); if (!cancelled) setBankAccount(r.data || null); } catch (_) {}
      finally { if (!cancelled) setBankLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [activeSection, isMarketplaceUser, user?.agency, user?.agent]);

  const handleSaveBankAccount = async (data) => {
    setBankSaving(true);
    try {
      const r = await UpdateBankAccount(data);
      setBankAccount(r.data);
      toast.success("Bank details saved.", "Success");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Unable to save bank details.", "Error");
    } finally {
      setBankSaving(false);
    }
  };

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

  const handleChange      = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (validationErrors[name]) setValidationErrors(p => ({ ...p, [name]: "" }));
    setSubmitError("");
  };
  const handleRoleChange  = (e) => {
    const { name, value, type, checked } = e.target;
    setRoleForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const handleRoleArr     = (name, value) => setRoleForm(p => ({ ...p, [name]: value }));
  const handleAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (f?.type.startsWith("image/")) setAvatarFile(f);
    else if (f) toast.error("Invalid image file", "Avatar");
  };
  const handleLogoChange  = (e) => {
    const f = e.target.files?.[0];
    if (f?.type.startsWith("image/")) setRoleLogoFile(f);
    else if (f) toast.error("Invalid image file", "Logo");
  };
  const handleLogoRemove  = () => { setRoleLogoFile(null); setRoleLogoPreview(""); };

  const handleInitiateKYC = async () => {
    setInitiatingKyc(true);
    try {
      const r = await InitiateKYC();
      setKycRecord(r.data?.kyc_record || { status: "initiated" });
      toast.success("KYC verification initiated.", "KYC");
    } catch (err) { toast.error(err.response?.data?.detail || "Failed to initiate KYC", "KYC Error"); }
    finally { setInitiatingKyc(false); }
  };

  const ARRAY_FIELDS = new Set(["working_days","languages_spoken","niches","crm_expertise"]);

  const buildPayload = () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined && k !== "avatar") fd.append(k, v); });
    if (!user?.is_child) {
      Object.entries(roleForm).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (ARRAY_FIELDS.has(k)) fd.append(k, JSON.stringify(Array.isArray(v) ? v : []));
        else if (typeof v === "boolean") fd.append(k, v ? "true" : "false");
        else if (v !== "") fd.append(k, v);
      });
    }
    if (avatarFile) fd.append("avatar", avatarFile);
    if (roleLogoFile && !user?.is_child) {
      if (user?.role === "STORE" || user?.role === "AGENCY_OWNER") fd.append("logo", roleLogoFile);
      else if (user?.agent) fd.append("agent_photo", roleLogoFile);
    }
    return fd;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateUserForm(form);
    setValidationErrors(errs);
    if (Object.keys(errs).length) { setSubmitError("Please fix the errors above"); return; }
    setSaving(true); setSubmitError(""); setSubmitSuccess("");
    try {
      await updateProfile(buildPayload());
      await updateLanguage({ language: form.language });
      await refreshUser();
      setSubmitSuccess("Profile updated successfully!");
      toast.success("Profile updated!", "Success");
      setTimeout(() => setSubmitSuccess(""), 3000);
      if (activeSection === "marketplace") setMarketplaceEditMode(false);
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Failed to update profile";
      setSubmitError(msg); toast.error(msg, "Error");
    } finally { setSaving(false); }
  };

  const initials      = (form.first_name?.[0] || form.username?.[0] || "U").toUpperCase();
  const fullName      = `${form.first_name} ${form.last_name}`.trim();
  const completionRate = Math.min(100, Math.floor(Object.values(form).filter(v => v && v !== "").length / 15 * 100));

  const tabs = [
    { id:"user",        label:"Personal Info",           icon:User,                always:true },
    { id:"role",        label:roleConfig?.title||"Role", icon:roleConfig?.icon||Briefcase, show:!!roleConfig },
    { id:"marketplace", label:"Marketplace",             icon:Sparkles,            show:isMarketplaceUser },
  ].filter(t => t.always || t.show);

  return (
    <div className={cls.page + " py-8 px-4"}>
      <div className="max-w-6xl mx-auto">

        {/* PAGE HEADER */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
            <Crown size={20} className={IC} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-gray-900 dark:text-white">Profile Settings</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {user?.is_child ? "Manage your personal information." : "Manage your account and preferences"}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] p-1 rounded-xl w-fit flex-wrap">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                activeSection === tab.id
                  ? "bg-white dark:bg-[#1c2028] text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}>
              <tab.icon size={13} className={activeSection === tab.id ? IC : "text-gray-400 dark:text-gray-500"} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ALERTS */}
        <AnimatePresence>
          {(submitError || submitSuccess) && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              className={`mb-5 p-4 rounded-xl border flex items-center gap-3 ${
                submitError
                  ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400"
                  : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
              }`}>
              {submitError ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
              <span className="text-sm flex-1">{submitError || submitSuccess}</span>
              <button onClick={() => { setSubmitError(""); setSubmitSuccess(""); }}>
                <X size={14} className="opacity-60 hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-5 lg:grid-cols-3">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-4">

            {/* Avatar card */}
            <div className={cls.card}>
              <div className="h-16 bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-transparent dark:from-emerald-500/20 dark:via-emerald-500/10 dark:to-transparent" />
              <div className="px-5 pb-5 -mt-8">
                <div className="relative inline-block mb-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-xl shadow-lg overflow-hidden ring-4 ring-white dark:ring-[#13161d]">
                    {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : initials}
                  </div>
                  <label className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-white dark:bg-[#1c2028] border border-gray-200 dark:border-white/[0.1] cursor-pointer shadow-md hover:scale-105 transition-transform">
                    <Camera size={11} className={IC} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">{fullName || "Your Name"}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                  <AtSign size={10} className={IC_SM} /> {form.username}
                </p>
                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1">
                    <Shield size={9} className={IC_SM} /> {user?.role?.replace(/_/g, " ")}
                  </span>
                  {user?.is_child && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-100 dark:border-amber-500/20 flex items-center gap-1">
                      <Users size={9} /> Child
                    </span>
                  )}
                  {user?.agent?.is_online && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Online
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <Card title="Account Stats" icon={TrendingUp}>
              <div className="space-y-2">
                <StatBadge label="Member Since" value={formatDate(user?.created_at)} icon={Calendar} />
                <StatBadge label="Completion"   value={`${completionRate}%`}          icon={CheckCircle2} />
                <StatBadge label="Status"       value={user?.status || "Active"}       icon={Shield} />
                {(user?.agent?.kyc_status || user?.agency?.kyc_status) && (
                  <StatBadge label="KYC" value={(user?.agent?.kyc_status || user?.agency?.kyc_status)?.replace(/_/g, " ")} icon={BadgeCheck} />
                )}
              </div>
            </Card>

            {/* Permissions */}
            {user?.permissions?.length > 0 && (
              <Card title="Permissions" icon={Lock}>
                <div className="flex flex-wrap gap-1.5">
                  {user.permissions.slice(0, 8).map(p => <PermissionBadge key={p} permission={p} />)}
                  {user.permissions.length > 8 && (
                    <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-white/[0.04] text-gray-400 text-xs flex items-center gap-1 border border-gray-100 dark:border-white/[0.06]">
                      <Hash size={9} className={IC_SM} /> +{user.permissions.length - 8}
                    </span>
                  )}
                </div>
              </Card>
            )}

            {/* Preferences */}
            <Card title="Preferences" icon={Settings}>
              <div className="space-y-3.5">
                <SelectField label="Language" name="language" value={form.language} onChange={handleChange} icon={Globe}
                  options={[{ value:"fr", label:"🇫🇷 Français" }, { value:"en", label:"🇬🇧 English" }, { value:"ar", label:"🇸🇦 العربية" }]} />
                <SelectField label="Theme" name="theme" value={form.theme} onChange={handleChange} icon={Monitor}
                  options={[{ value:"light", label:"☀️ Light" }, { value:"dark", label:"🌙 Dark" }, { value:"system", label:"💻 System" }]} />
                <ToggleField label="Public Profile" name="public_profile" checked={form.public_profile} onChange={handleChange} icon={Globe} />
              </div>
            </Card>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">

                {/* PERSONAL INFO */}
                {activeSection === "user" && (
                  <motion.div key="user" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.18 }} className="space-y-4">
                    <Card title="Personal Information" icon={User}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="First Name"  name="first_name"   value={form.first_name}   onChange={handleChange} error={validationErrors.first_name}  required placeholder="John"   icon={User} />
                        <FormField label="Last Name"   name="last_name"    value={form.last_name}    onChange={handleChange} error={validationErrors.last_name}   required placeholder="Doe"    icon={User} />
                        <FormField label="Username"    name="username"     value={form.username}     onChange={handleChange} error={validationErrors.username}    required placeholder="johndoe" icon={AtSign} />
                        <FormField label="Birth Date"  name="birth_date"   type="date" value={form.birth_date} onChange={handleChange} icon={Calendar} />
                        <SelectField label="Gender" name="gender" value={form.gender} onChange={handleChange} icon={VenusMars}
                          options={[{ value:"", label:"Select" }, { value:"male", label:"Male" }, { value:"female", label:"Female" }, { value:"other", label:"Other" }]} />
                      </div>
                    </Card>
                    <Card title="Contact Details" icon={Mail}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Email Address" name="email"        type="email" value={form.email}        onChange={handleChange} error={validationErrors.email}        required placeholder="john@example.com"   icon={Mail} />
                        <FormField label="Phone Number"  name="phone_number" type="tel"   value={form.phone_number} onChange={handleChange} error={validationErrors.phone_number} required placeholder="+212 6XX XXX XXX"    icon={Phone} />
                      </div>
                    </Card>
                    <Card title="Location" icon={MapPin}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Country" name="country" value={form.country} onChange={handleChange} error={validationErrors.country} required placeholder="Morocco"     icon={Flag} />
                        <FormField label="City"    name="city"    value={form.city}    onChange={handleChange} error={validationErrors.city}    required placeholder="Casablanca"  icon={MapPin} />
                        <FormField label="Address" name="address" value={form.address} onChange={handleChange} placeholder="Street, building, apartment" icon={Home} />
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* ROLE */}
                {activeSection === "role" && roleConfig && (
                  <motion.div key="role" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.18 }} className="space-y-4">
                    <Card title={roleConfig.title} icon={roleConfig.icon}>
                      {roleConfig.hasLogo && (
                        <div className="mb-5 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
                          <ImageUploader label={roleConfig.logoLabel} imagePreview={roleLogoPreview} onImageChange={handleLogoChange} onImageRemove={handleLogoRemove} icon={roleConfig.icon} size="md" />
                        </div>
                      )}
                      <div className="space-y-4">
                        {roleConfig.fields.map(field =>
                          field.type === "textarea"
                            ? <TextareaField key={field.name} label={field.label} name={field.name} value={roleForm[field.name]||""} onChange={handleRoleChange} placeholder={field.placeholder} rows={field.rows||3} icon={field.icon||BookOpen} />
                            : <FormField    key={field.name} label={field.label} name={field.name} value={roleForm[field.name]||""} onChange={handleRoleChange} type={field.type||"text"} required={field.required} placeholder={field.placeholder} icon={field.icon} />
                        )}
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* MARKETPLACE */}
                {activeSection === "marketplace" && isMarketplaceUser && (
                  <motion.div key="marketplace" initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:0.18 }} className="space-y-4">

                    {/* VIEW */}
                    {!marketplaceEditMode && (
                      <>
                        <MarketplaceViewPanel roleForm={roleForm} isAgent={!!user?.agent} onEdit={() => setMarketplaceEditMode(true)} />
                        <Card title="Identity Verification" icon={BadgeCheck}>
                          <KYCSection kycRecord={kycRecord} kycLoading={kycLoading} initiatingKyc={initiatingKyc} onInitiate={handleInitiateKYC} />
                        </Card>
                        <Card title="Earned Badges" icon={Award}>
                          <BadgesDisplay badges={providerBadges} loading={badgesLoading} />
                        </Card>
                        <Card title="Bank Details" icon={CreditCard}>
                          <BankDetailsSection bankAccount={bankAccount} bankLoading={bankLoading} bankSaving={bankSaving} onSave={handleSaveBankAccount} />
                        </Card>
                      </>
                    )}

                    {/* EDIT */}
                    {marketplaceEditMode && (
                      <>
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                          <div className="flex items-center gap-2">
                            <Edit3 size={13} className={IC} />
                            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Edit marketplace profile</span>
                          </div>
                          <button type="button" onClick={() => setMarketplaceEditMode(false)} className={`inline-flex items-center gap-1.5 text-xs ${cls.btn} ${cls.btnOutline} !py-1.5 !px-3`}>
                            <X size={12} /> Cancel
                          </button>
                        </div>

                        {user?.agent && (
                          <Card title="Professional Background" icon={BookOpen}>
                            <div className="grid gap-4 md:grid-cols-2">
                              <SelectField label="Marital Status" name="marital_status" value={roleForm.marital_status||""} onChange={handleRoleChange} icon={Heart}
                                options={[{ value:"", label:"Select" }, { value:"single", label:"Single" }, { value:"married", label:"Married" }, { value:"divorced", label:"Divorced" }, { value:"widowed", label:"Widowed" }]} />
                              <SelectField label="Education Level" name="education_level" value={roleForm.education_level||""} onChange={handleRoleChange} icon={BookOpen}
                                options={[{ value:"", label:"Select" }, { value:"high_school", label:"High School" }, { value:"bachelor", label:"Bachelor" }, { value:"master", label:"Master" }, { value:"phd", label:"PhD" }, { value:"other", label:"Other" }]} />
                              <FormField label="Field of Study"    name="field_of_study"  value={roleForm.field_of_study||""} onChange={handleRoleChange} placeholder="e.g., Computer Science" icon={Layers} />
                              <FormField label="Years Experience"  name="years_experience" type="number" value={roleForm.years_experience??""} onChange={handleRoleChange} placeholder="0" icon={Briefcase} />
                              <FormField label="Delivery Rate (%)" name="delivery_rate" type="number" value={roleForm.delivery_rate??""} onChange={handleRoleChange} placeholder="0–100" icon={TrendingUp} />
                            </div>
                          </Card>
                        )}

                        {user?.agent && (
                          <Card title="Work Setup" icon={Monitor}>
                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <SelectField label="Workspace Type" name="workspace_type" value={roleForm.workspace_type||""} onChange={handleRoleChange} icon={Home}
                                  options={[{ value:"", label:"Select" }, { value:"home", label:"Home Office" }, { value:"coworking", label:"Coworking" }, { value:"office", label:"Office" }]} />
                                <SelectField label="Job Type" name="job_type" value={roleForm.job_type||""} onChange={handleRoleChange} icon={Briefcase}
                                  options={[{ value:"", label:"Select" }, { value:"full_time", label:"Full Time" }, { value:"part_time", label:"Part Time" }, { value:"freelance", label:"Freelance" }]} />
                                <SelectField label="Internet" name="internet_connection_type" value={roleForm.internet_connection_type||""} onChange={handleRoleChange} icon={Wifi}
                                  options={[{ value:"", label:"Select" }, { value:"fiber", label:"Fiber" }, { value:"adsl", label:"ADSL" }, { value:"4g", label:"4G" }, { value:"5g", label:"5G" }]} />
                                <FormField label="Daily Capacity" name="daily_capacity" type="number" value={roleForm.daily_capacity??""} onChange={handleRoleChange} placeholder="10" icon={Target} />
                              </div>
                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField label="Start Time" name="working_hours_start" type="time" value={roleForm.working_hours_start||""} onChange={handleRoleChange} icon={AlarmClock} />
                                <FormField label="End Time"   name="working_hours_end"   type="time" value={roleForm.working_hours_end||""}   onChange={handleRoleChange} icon={AlarmClock} />
                              </div>
                              <DaySelector selected={roleForm.working_days||[]} onChange={v => handleRoleArr("working_days", v)} />
                              <ToggleField label="Noise-Canceling Headset" name="has_noise_canceling_headset" checked={roleForm.has_noise_canceling_headset} onChange={handleRoleChange} icon={Headphones} />
                            </div>
                          </Card>
                        )}

                        {user?.agency && (
                          <Card title="Agency Work Setup" icon={Monitor}>
                            <div className="space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <SelectField label="Workspace" name="workspace_type" value={roleForm.workspace_type||""} onChange={handleRoleChange} icon={Home}
                                  options={[{ value:"", label:"Select" }, { value:"home", label:"Home Office" }, { value:"coworking", label:"Coworking" }, { value:"office", label:"Office" }]} />
                                <FormField label="Daily Capacity" name="daily_capacity" type="number" value={roleForm.daily_capacity??""} onChange={handleRoleChange} placeholder="10" icon={Target} />
                                <FormField label="Start Time" name="working_hours_start" type="time" value={roleForm.working_hours_start||""} onChange={handleRoleChange} icon={AlarmClock} />
                                <FormField label="End Time"   name="working_hours_end"   type="time" value={roleForm.working_hours_end||""}   onChange={handleRoleChange} icon={AlarmClock} />
                                <FormField label="Delivery Rate (%)" name="delivery_rate" type="number" value={roleForm.delivery_rate??""} onChange={handleRoleChange} placeholder="0–100" icon={TrendingUp} />
                              </div>
                              <DaySelector selected={roleForm.working_days||[]} onChange={v => handleRoleArr("working_days", v)} />
                            </div>
                          </Card>
                        )}

                        <Card title="Skills & Services" icon={Star}>
                          <div className="space-y-5">
                            <MultiSelectChips label="Languages Spoken" options={LANGUAGES_OPTIONS} selected={roleForm.languages_spoken||[]} onChange={v => handleRoleArr("languages_spoken", v)} icon={Languages} />
                            <MultiSelectChips label="Niches"            options={NICHES_OPTIONS}    selected={roleForm.niches||[]}            onChange={v => handleRoleArr("niches", v)}            icon={Target} />
                            <MultiSelectChips label="CRM Expertise"     options={CRM_OPTIONS}       selected={roleForm.crm_expertise||[]}    onChange={v => handleRoleArr("crm_expertise", v)}    icon={Layers} />
                            <div className="grid gap-4 md:grid-cols-2">
                              <SelectField label="Service Scope" name="service_scope" value={roleForm.service_scope||""} onChange={handleRoleChange} icon={Globe}
                                options={[{ value:"", label:"Select" }, { value:"local", label:"Local" }, { value:"national", label:"National" }, { value:"international", label:"International" }]} />
                            </div>
                            <div className="space-y-3 pt-1">
                              <ToggleField label="Supports Adult Products" name="supports_adult_products" checked={roleForm.supports_adult_products} onChange={handleRoleChange} icon={Shield} />
                              <ToggleField label="Show as Online"           name="is_online"               checked={roleForm.is_online}               onChange={handleRoleChange} icon={Globe} />
                            </div>
                          </div>
                        </Card>

                        <Card title="Identity Verification" icon={BadgeCheck}>
                          <KYCSection kycRecord={kycRecord} kycLoading={kycLoading} initiatingKyc={initiatingKyc} onInitiate={handleInitiateKYC} />
                        </Card>
                        <Card title="Earned Badges" icon={Award}>
                          <BadgesDisplay badges={providerBadges} loading={badgesLoading} />
                        </Card>
                        <Card title="Bank Details" icon={CreditCard}>
                          <BankDetailsSection bankAccount={bankAccount} bankLoading={bankLoading} bankSaving={bankSaving} onSave={handleSaveBankAccount} />
                        </Card>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SAVE */}
              <div className="mt-5 flex justify-end"
                style={{ display: activeSection === "marketplace" && !marketplaceEditMode ? "none" : "flex" }}>
                <button type="submit" disabled={saving} className={`${cls.btn} ${cls.btnGreen}`}>
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;