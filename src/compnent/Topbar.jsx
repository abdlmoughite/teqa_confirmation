import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, ShieldCheck, ChevronDown, X } from "lucide-react";
import clsx from "clsx"; // 👈 Ajoutez cette ligne

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import DarkModeToggle from "../components/DarkModeToggle";

const Topbar = () => {
  const { isChild, user } = useContext(AuthContext);
  const { lang, changeLanguage, t } = useContext(LanguageContext);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const initials = (user?.username || user?.email || "C").slice(0, 1).toUpperCase();

  return (
    <header className="topbar">
      {/* Left Section - Workspace Info */}
    

      {/* Center Section - Search (Desktop) */}
      <label className="relative hidden w-full md:block">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors dark:text-slate-500"
        />
        <input
          type="search"
          placeholder={t("common.search", "Search orders, stores, agents...")}
          className="field-input h-10 pl-9 text-sm"
        />
      </label>

      {/* Mobile Search Button */}
      <button
        type="button"
        onClick={() => setIsSearchOpen(true)}
        className="icon-button md:hidden"
        aria-label={t("common.search", "Search")}
      >
        <Search size={18} />
      </button>

      {/* Right Section - Actions */}
      <div className="flex items-center justify-end gap-2 md:gap-3">
        {/* Language Selector */}
        <div className="relative">
          <select
            value={lang}
            onChange={(event) => changeLanguage(event.target.value)}
            className="field-select h-9 w-16 !py-0 text-xs font-medium md:h-10 md:w-20"
            aria-label={t("common.language", "Language")}
          >
            <option value="fr">FR</option>
            <option value="en">EN</option>
            <option value="ar">AR</option>
          </select>
        </div>

        {/* Dark Mode Toggle */}
        <DarkModeToggle />

        {/* Notifications */}
        <button
          type="button"
          className="icon-button relative"
          aria-label={t("nav.notifications", "Notifications")}
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
        </button>

        {/* Child Workspace Badge */}
        {isChild && (
          <div className="hidden items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300 md:flex">
            <ShieldCheck size={14} />
            <span>{t("nav.scoped_permissions", "Permissions scoped")}</span>
          </div>
        )}

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition-all duration-200 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 md:px-3 md:py-2"
          >
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary-600 text-sm font-semibold text-white shadow-sm transition-all group-hover:bg-primary-700 dark:bg-primary-500 md:h-9 md:w-9">
              {initials}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user?.username || t("nav.workspace_user", "Workspace user")}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || user?.role || t("nav.user", "User")}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={clsx(
                "hidden text-slate-400 transition-transform duration-200 sm:block",
                isProfileOpen && "rotate-180"
              )}
            />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-40 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user?.username || t("nav.user", "User")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                  <div className="p-2">
                    <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                      {t("nav.profile", "Profile")}
                    </button>
                    <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                      {t("nav.settings", "Settings")}
                    </button>
                    <hr className="my-1 border-slate-200 dark:border-slate-800" />
                    <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                      {t("nav.logout", "Logout")}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed left-4 right-4 top-4 z-50 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
                <Search size={18} className="text-slate-400" />
                <input
                  type="search"
                  autoFocus
                  placeholder={t("common.search", "Search orders, stores, agents...")}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-4 text-center text-sm text-slate-500">
                {t("common.type_to_search", "Type to search...")}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Topbar;