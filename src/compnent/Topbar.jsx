import { useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, ShieldCheck, ChevronDown, X, Menu } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import DarkModeToggle from "../components/DarkModeToggle";

const dropdownStyle = {
  background: "var(--teqa-surface)",
  border: "0.5px solid var(--teqa-border-md)",
  borderRadius: "var(--radius-xl)",
  boxShadow: "0 16px 48px rgba(0,0,0,0.22)",
};

const dropdownItem = {
  borderRadius: "var(--radius-lg)",
  color: "var(--teqa-muted)",
  fontSize: 13,
  padding: "8px 12px",
  width: "100%",
  textAlign: "left",
  background: "transparent",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s",
};

const Topbar = ({ isMobile, sidebarOpen, onToggleSidebar }) => {
  const { isChild, user, logout } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen]   = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const initials = (user?.username || user?.email || "T").slice(0, 1).toUpperCase();

  return (
    <header className="topbar">

      {/* ── Left : hamburger (mobile) + search (desktop) ── */}
      <div className="flex items-center gap-3 min-w-0 flex-1">

        {/* Hamburger — mobile only */}
        {isMobile && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="icon-button flex-shrink-0"
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Page title — mobile */}
        {isMobile && (
          <span
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--teqa-text)", letterSpacing: 0 }}
            className="truncate"
          >
            TEQA
          </span>
        )}

        {/* Search — desktop */}
        {!isMobile && (
          <label className="relative w-full max-w-xs">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--teqa-hint)" }}
            />
            <input
              type="search"
              placeholder={t("common.search", "Search…")}
              className="field-input h-9 pl-9 text-sm"
              style={{ maxWidth: 280 }}
            />
          </label>
        )}
      </div>

      {/* ── Right : actions ── */}
      <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">

        {/* Search — mobile icon */}
        {isMobile && (
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="icon-button"
            aria-label={t("common.search", "Search")}
          >
            <Search size={17} />
          </button>
        )}

        {/* Dark mode toggle */}
        <DarkModeToggle />

        {/* Notifications */}
        <button
          type="button"
          className="icon-button relative"
          aria-label={t("nav.notifications", "Notifications")}
        >
          <Bell size={17} />
          <span
            className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ background: "var(--teqa-red)", boxShadow: "0 0 0 2px var(--teqa-bg)" }}
          />
        </button>

        {/* Child workspace badge — desktop only */}
        {!isMobile && isChild && (
          <div
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium"
            style={{ background: "var(--teqa-green-dim)", color: "var(--teqa-green)", border: "0.5px solid rgba(37,99,235,0.25)" }}
          >
            <ShieldCheck size={12} />
            <span>{t("nav.scoped_permissions", "Scoped")}</span>
          </div>
        )}

        {/* Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 rounded-lg transition-all duration-150"
            style={{
              background: "var(--teqa-surface)",
              border: "0.5px solid var(--teqa-border-md)",
              padding: isMobile ? "5px 8px" : "6px 10px",
            }}
          >
            <div
              className="grid place-items-center rounded-lg font-bold text-sm"
              style={{ width: 30, height: 30, background: "var(--teqa-green)", color: "#fff", borderRadius: "var(--radius-md)", flexShrink: 0 }}
            >
              {initials}
            </div>
            {!isMobile && (
              <>
                <div className="min-w-0 hidden sm:block">
                  <p className="truncate text-xs font-semibold" style={{ color: "var(--teqa-text)", maxWidth: 100 }}>
                    {user?.username || "Workspace"}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: "var(--teqa-hint)" }}>
                    {user?.role || "User"}
                  </p>
                </div>
                <ChevronDown
                  size={13}
                  className={clsx("transition-transform duration-200", isProfileOpen && "rotate-180")}
                  style={{ color: "var(--teqa-hint)" }}
                />
              </>
            )}
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 top-full z-40 mt-2 w-52"
                  style={dropdownStyle}
                >
                  <div className="px-4 py-3" style={{ borderBottom: "0.5px solid var(--teqa-border)" }}>
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--teqa-text)" }}>
                      {user?.username || "User"}
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--teqa-hint)" }}>
                      {user?.email || user?.role}
                    </p>
                  </div>
                  <div className="p-2">
                    {[
                      { label: t("nav.profile", "Profile"),   path: "/profile"  },
                      { label: t("nav.settings", "Settings"), path: "/settings" },
                    ].map(({ label, path }) => (
                      <button
                        key={label}
                        style={dropdownItem}
                        onClick={() => { setIsProfileOpen(false); navigate(path); }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--teqa-surface2)"; e.currentTarget.style.color = "var(--teqa-text)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--teqa-muted)"; }}
                      >
                        {label}
                      </button>
                    ))}
                    <hr style={{ border: "none", borderTop: "0.5px solid var(--teqa-border)", margin: "4px 0" }} />
                    <button
                      style={{ ...dropdownItem, color: "var(--teqa-red)" }}
                      onClick={() => { setIsProfileOpen(false); logout?.(); }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--teqa-red-dim)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {t("nav.logout", "Logout")}
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Mobile search modal ── */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <div
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.58)", backdropFilter: "blur(4px)" }}
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="fixed left-4 right-4 top-4 z-50"
              style={dropdownStyle}
            >
              <div className="flex items-center gap-2.5 p-3" style={{ borderBottom: "0.5px solid var(--teqa-border)" }}>
                <Search size={15} style={{ color: "var(--teqa-hint)", flexShrink: 0 }} />
                <input
                  type="search"
                  autoFocus
                  placeholder={t("common.search", "Rechercher…")}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--teqa-text)" }}
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="icon-button"
                  style={{ width: 28, height: 28, minHeight: 28 }}
                >
                  <X size={15} />
                </button>
              </div>
              <div className="p-4 text-center text-sm" style={{ color: "var(--teqa-hint)" }}>
                {t("common.type_to_search", "Tapez pour rechercher…")}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Topbar;
