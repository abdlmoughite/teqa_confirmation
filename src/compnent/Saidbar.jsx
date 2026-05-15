import { useContext, useMemo } from "react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Handshake,
  LayoutDashboard,
  LogOut,
  Store,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { ROUTE_PERMISSIONS } from "../config/permissions";

// Logo component with light/dark mode support
const PubliQyLogo = ({ isOpen, theme }) => {
  const logoSrc = theme === "dark" 
    ? "/LOGO TIQA PNG WHITE.png" 
    : "/LOGO TIQA PNG BLACK.png";

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 shadow-md dark:from-primary-600 dark:to-primary-700">
        <img 
          src={logoSrc} 
          alt="PubliQy" 
          className="h-7 w-7 object-contain"
        />
      </div>
      {isOpen && (
        <div className="min-w-0">
          <p className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">
            PubliQy
          </p>
          <p className="truncate text-xs text-emerald-600 dark:text-emerald-400">
            Connect. Confirm. Deliver.
          </p>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ isOpen, isMobile, isTablet, onClose, onToggle }) => {
  const { hasAnyPermission, isChild, logout, user } = useContext(AuthContext);
  const { lang, changeLanguage, t } = useContext(LanguageContext);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems = useMemo(
    () => [
      {
        section: t("nav.workspace", "Workspace"),
        items: [
          { name: t("nav.dashboard", "Dashboard"), path: "/", icon: LayoutDashboard, visible: hasAnyPermission(ROUTE_PERMISSIONS.dashboard) },
          { name: t("nav.marketplace", "Marketplace"), path: "/marketplace", icon: Store, visible: hasAnyPermission(["offers.view_marketplace", "offers.view"]) },
          { name: t("nav.offers", "Offers"), path: "/offers", icon: CreditCard, visible: hasAnyPermission(ROUTE_PERMISSIONS.offers) },
          { name: t("nav.orders", "Orders"), path: "/orders", icon: ClipboardList, visible: hasAnyPermission(ROUTE_PERMISSIONS.orders) },
          { name: t("nav.collaborations", "Collaborations"), path: "/collaborations", icon: Handshake, visible: hasAnyPermission(ROUTE_PERMISSIONS.collaborations) },
          { name: t("nav.messages", "Messages"), path: "/messages", icon: MessageSquare, visible: hasAnyPermission(ROUTE_PERMISSIONS.messages) },
        ],
      },
      {
        section: t("nav.finance", "Finance"),
        items: [
          { name: t("nav.wallet", "Wallet"), path: "/wallet", icon: Wallet, visible: hasAnyPermission(ROUTE_PERMISSIONS.wallet) },
          { name: t("nav.commissions", "Commissions"), path: "/commissions", icon: CreditCard, visible: hasAnyPermission(ROUTE_PERMISSIONS.commissions) },
          { name: t("nav.invoices", "Invoices"), path: "/invoices", icon: FileText, visible: hasAnyPermission(ROUTE_PERMISSIONS.invoices) },
        ],
      },
      {
        section: t("nav.account", "Account"),
        items: [
          { name: t("nav.profile", "Profile"), path: "/profile", icon: UserRound, visible: true },
          { name: t("nav.team", "Team"), path: "/team", icon: Users, visible: !isChild && hasAnyPermission(ROUTE_PERMISSIONS.team) },
          { name: t("nav.settings", "Settings"), path: "/settings", icon: Settings, visible: true },
        ],
      },
    ],
    [hasAnyPermission, isChild, t]
  );

  const initials = (user?.username || user?.email || "C").slice(0, 1).toUpperCase();

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        className={clsx(
          "fixed left-0 top-0 z-50 h-screen",
          isMobile && !isOpen && "hidden"
        )}
        initial={{ opacity: 0, x: -20 }}
        animate={{ 
          opacity: 1, 
          x: 0,
          width: isOpen ? 280 : 84
        }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className={clsx(
          "flex h-full flex-col bg-white shadow-lg transition-all duration-300 dark:bg-slate-900",
          "border-r border-slate-200 dark:border-slate-800"
        )}>
          {/* Header with Logo - Fixed at top */}
          <div className="flex-shrink-0 border-b border-slate-200 p-4 dark:border-slate-800">
            <div className={clsx(
              "flex items-center",
              isOpen ? "justify-between" : "justify-center"
            )}>
              <Link
                to="/"
                className="flex min-w-0 items-center gap-3 rounded-lg transition-all hover:opacity-80"
                onClick={() => {
                  if ((isMobile || isTablet) && onClose) onClose();
                }}
              >
                <PubliQyLogo isOpen={isOpen} theme={theme} />
              </Link>

              {isOpen && (
                <button
                  type="button"
                  onClick={onToggle}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                  aria-label={t("nav.close", "Close")}
                >
                  <ChevronLeft size={16} />
                </button>
              )}
            </div>

            {!isOpen && (
              <button
                type="button"
                onClick={onToggle}
                className="mt-3 flex h-8 w-full items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                aria-label={t("nav.open", "Open")}
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Navigation Menu - Scrollable without scrollbar */}
          <div className="scrollbar-none flex-1 overflow-y-auto px-3 py-6">
            <div className="space-y-6">
              {menuItems.map((section) => {
                const visibleItems = section.items.filter((item) => item.visible);
                if (!visibleItems.length) return null;

                return (
                  <div key={section.section}>
                    {isOpen && (
                      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {section.section}
                      </p>
                    )}
                    <div className="space-y-1">
                      {visibleItems.map((item) => {
                        const isActive = location.pathname === item.path || 
                                        (item.path !== "/" && location.pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => {
                              if ((isMobile || isTablet) && onClose) onClose();
                            }}
                            title={!isOpen ? item.name : undefined}
                            className={clsx(
                              "sidebar-link group relative",
                              isActive && "active",
                              !isOpen && "justify-center px-0"
                            )}
                          >
                            <Icon size={18} className="flex-shrink-0" />
                            {isOpen && <span className="truncate">{item.name}</span>}
                            
                            {/* Tooltip for collapsed mode */}
                            {!isOpen && (
                              <div className="pointer-events-none absolute left-full ml-2 hidden rounded-lg bg-slate-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-800 lg:block">
                                {item.name}
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer with User & Actions - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-slate-200 p-4 dark:border-slate-800">
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-bold text-white shadow-sm">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.username || "Workspace"}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.email || user?.role || "User"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className={clsx(
              "grid gap-2",
              isOpen ? "grid-cols-2" : "grid-cols-1"
            )}>
              <button
                type="button"
                onClick={toggleTheme}
                className={clsx(
                  "flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white",
                  !isOpen && "px-0"
                )}
                title={theme === "dark" ? t("nav.light", "Light mode") : t("nav.dark", "Dark mode")}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                {isOpen && <span>{theme === "dark" ? t("nav.light", "Light") : t("nav.dark", "Dark")}</span>}
              </button>

              {isOpen ? (
                <select
                  value={lang}
                  onChange={(event) => {
                    if (event.target.value === "en") changeLanguage("en");
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  aria-label="Language"
                  title="Only English is available right now. Other languages are disabled."
                >
                  <option value="en">EN</option>
                  <option value="fr" disabled>FR soon</option>
                  <option value="ar" disabled>AR soon</option>
                </select>
              ) : null}
            </div>

            <button
              type="button"
              onClick={logout}
              className={clsx(
                "mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-red-700 focus:ring-2 focus:ring-red-500/50 dark:bg-red-500 dark:hover:bg-red-600"
              )}
            >
              <LogOut size={16} />
              {isOpen && <span>{t("nav.logout", "Logout")}</span>}
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default Sidebar;
