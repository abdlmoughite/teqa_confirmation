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
  Route,
  Store,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { ROUTE_PERMISSIONS } from "../config/permissions";
import TeqaLogo from "../components/ui/TeqaLogo";

/* ── inline style constants (TEQA tokens) ── */
const css = {
  sidebar:    { background: "var(--teqa-sidebar)", borderRight: "0.5px solid var(--teqa-border)" },
  divTop:     { borderBottom: "0.5px solid var(--teqa-border)" },
  divBot:     { borderTop: "0.5px solid var(--teqa-border)" },
  section:    { color: "var(--teqa-hint)", fontSize: 10, fontWeight: 500, letterSpacing: "0.11em", textTransform: "uppercase", padding: "0 12px", marginBottom: 4 },
  userCard:   { background: "var(--teqa-surface2)", borderRadius: "var(--radius-lg)", padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 },
  avatar:     { width: 34, height: 34, borderRadius: "var(--radius-md)", background: "var(--teqa-green)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 },
  toggleBtn:  { background: "transparent", border: "0.5px solid var(--teqa-border-md)", borderRadius: "var(--radius-md)", color: "var(--teqa-muted)", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "border-color 0.15s, color 0.15s" },
  actionBtn:  { background: "transparent", border: "0.5px solid var(--teqa-border-md)", borderRadius: "var(--radius-lg)", color: "var(--teqa-muted)", fontSize: 12, fontWeight: 500, padding: "7px 10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flex: 1, transition: "border-color 0.15s, color 0.15s" },
  logoutBtn:  { background: "var(--teqa-red-dim)", border: "0.5px solid rgba(220,38,38,0.25)", borderRadius: "var(--radius-lg)", color: "var(--teqa-red)", fontSize: 12, fontWeight: 500, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", marginTop: 8, transition: "background 0.15s" },
};

const Sidebar = ({ isOpen, isMobile, isTablet, onClose, onToggle }) => {
  const { hasAnyPermission, isChild, logout, user } = useContext(AuthContext);
  const { t }                                       = useContext(LanguageContext);
  const { theme, toggleTheme }                      = useTheme();
  const location                                    = useLocation();

  const menuItems = useMemo(
    () => [
      {
        section: t("nav.workspace", "Workspace"),
        items: [
          { name: t("nav.dashboard",       "Dashboard"),      path: "/",               icon: LayoutDashboard, visible: hasAnyPermission(ROUTE_PERMISSIONS.dashboard) },
          { name: t("nav.marketplace",     "Marketplace"),    path: "/marketplace",    icon: Store,           visible: hasAnyPermission(["offers.view_marketplace", "offers.view"]) },
          { name: t("nav.offers",          "Offers"),         path: "/offers",         icon: CreditCard,      visible: hasAnyPermission(ROUTE_PERMISSIONS.offers) },
          { name: t("nav.orders",          "Orders"),         path: "/orders",         icon: ClipboardList,   visible: hasAnyPermission(ROUTE_PERMISSIONS.orders) },
          { name: t("nav.dispatch",        "Dispatch"),       path: "/dispatch",       icon: Route,           visible: user?.role !== "AGENCY_AGENT" && hasAnyPermission(ROUTE_PERMISSIONS.dispatch) },
          { name: t("nav.collaborations",  "Collaborations"), path: "/collaborations", icon: Handshake,       visible: hasAnyPermission(ROUTE_PERMISSIONS.collaborations) },
          { name: t("nav.messages",        "Messages"),       path: "/messages",       icon: MessageSquare,   visible: hasAnyPermission(ROUTE_PERMISSIONS.messages) },
        ],
      },
      {
        section: t("nav.finance", "Finance"),
        items: [
          { name: t("nav.wallet",      "Wallet"),      path: "/wallet",      icon: Wallet,    visible: hasAnyPermission(ROUTE_PERMISSIONS.wallet) },
          { name: t("nav.commissions", "Commissions"), path: "/commissions", icon: CreditCard, visible: hasAnyPermission(ROUTE_PERMISSIONS.commissions) },
          { name: t("nav.invoices",    "Invoices"),    path: "/invoices",    icon: FileText,  visible: hasAnyPermission(ROUTE_PERMISSIONS.invoices) },
        ],
      },
      {
        section: t("nav.account", "Account"),
        items: [
          { name: t("nav.profile",   "Profile"),  path: "/profile",  icon: UserRound, visible: true },
          { name: t("nav.team",      "Team"),     path: "/team",     icon: Users,     visible: !isChild && user?.role !== "AGENCY_AGENT" && hasAnyPermission(ROUTE_PERMISSIONS.team) },
          { name: t("nav.settings",  "Settings"), path: "/settings", icon: Settings,  visible: true },
        ],
      },
    ],
    [hasAnyPermission, isChild, t, user?.role]
  );

  const initials = (user?.username || user?.email || "T").slice(0, 1).toUpperCase();
  const username = user?.username || "Workspace";
  const userSub  = user?.email || user?.role || "User";

  /* ── On mobile, sidebar is a full-screen drawer when open ── */
  const drawerWidth = isMobile ? Math.min(window.innerWidth * 0.82, 300) : isOpen ? 272 : 72;

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        className={clsx(
          "fixed left-0 top-0 z-50 h-screen overflow-hidden",
          /* Hide completely on mobile when closed */
          isMobile && !isOpen && "hidden"
        )}
        style={css.sidebar}
        initial={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
        animate={{
          x: 0,
          opacity: 1,
          width: drawerWidth,
        }}
        exit={{ x: isMobile ? -320 : 0, opacity: isMobile ? 0 : 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div className="flex h-full flex-col">

          {/* ── Header ── */}
          <div
            className="flex flex-shrink-0 items-center gap-3 px-4"
            style={{ minHeight: 64, ...css.divTop }}
          >
            <Link
              to="/"
              className="flex min-w-0 flex-1 items-center gap-3"
              onClick={() => { if ((isMobile || isTablet) && onClose) onClose(); }}
            >
              {/* Logo mark */}
              <div
                style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: "var(--teqa-green-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
              >
                <TeqaLogo size="sm" showText={false} />
              </div>
              {/* Brand text — visible when expanded or on mobile drawer */}
              {(isOpen || isMobile) && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="min-w-0"
                >
                  <p style={{ color: "var(--teqa-text)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: 1, letterSpacing: 0 }}>
                    TEQA
                  </p>
                  <p style={{ color: "var(--teqa-green)", fontSize: 10, marginTop: 3, fontWeight: 500, letterSpacing: "0.03em" }}>
                    Connect · Confirm · Deliver
                  </p>
                </motion.div>
              )}
            </Link>

            {/* Close / collapse button */}
            {isMobile ? (
              /* X close on mobile */
              <button
                type="button"
                onClick={onClose}
                style={css.toggleBtn}
                aria-label="Fermer"
              >
                <X size={15} />
              </button>
            ) : isOpen ? (
              /* ChevronLeft collapse on desktop */
              <button
                type="button"
                onClick={onToggle}
                style={{ ...css.toggleBtn, marginLeft: "auto" }}
                aria-label={t("nav.close", "Réduire")}
              >
                <ChevronLeft size={15} />
              </button>
            ) : null}
          </div>

          {/* Expand button — desktop collapsed only */}
          {!isMobile && !isOpen && (
            <div className="flex justify-center px-2 pt-2">
              <button
                type="button"
                onClick={onToggle}
                style={{ ...css.toggleBtn, width: "100%" }}
                aria-label={t("nav.open", "Développer")}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          )}

          {/* ── Navigation ── */}
          <nav className="scrollbar-none flex-1 overflow-y-auto py-4 px-2">
            <div className="space-y-5">
              {menuItems.map((section) => {
                const visible = section.items.filter((i) => i.visible);
                if (!visible.length) return null;

                return (
                  <div key={section.section}>
                    {/* Section label — expanded + mobile */}
                    {(isOpen || isMobile) && (
                      <p style={css.section}>{section.section}</p>
                    )}
                    <div className="space-y-0.5">
                      {visible.map((item) => {
                        const isActive =
                          location.pathname === item.path ||
                          (item.path !== "/" && location.pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => { if ((isMobile || isTablet) && onClose) onClose(); }}
                            title={(!isOpen && !isMobile) ? item.name : undefined}
                            className={clsx(
                              "sidebar-link group relative",
                              isActive && "active",
                              !isOpen && !isMobile && "justify-center px-0"
                            )}
                          >
                            <Icon size={17} className="flex-shrink-0" />
                            {(isOpen || isMobile) && (
                              <span className="truncate">{item.name}</span>
                            )}

                            {/* Tooltip — desktop collapsed */}
                            {!isOpen && !isMobile && (
                              <div
                                className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-opacity group-hover:opacity-100 lg:block"
                                style={{ background: "var(--teqa-surface2)", color: "var(--teqa-text)", border: "0.5px solid var(--teqa-border-md)" }}
                              >
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
          </nav>

          {/* ── Footer ── */}
          <div className="flex-shrink-0 px-3 pb-5 pt-3" style={css.divBot}>

            {/* User card — expanded + mobile */}
            {(isOpen || isMobile) && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                style={css.userCard}
                className="mb-3"
              >
                <div style={css.avatar}>{initials}</div>
                <div className="min-w-0 flex-1">
                  <p style={{ color: "var(--teqa-text)", fontSize: 13, fontWeight: 600, lineHeight: 1.2 }} className="truncate">
                    {username}
                  </p>
                  <p style={{ color: "var(--teqa-hint)", fontSize: 11, marginTop: 2 }} className="truncate">
                    {userSub}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Actions row */}
            <div className={clsx("flex gap-2", (!isOpen && !isMobile) && "flex-col items-center")}>
              <button
                type="button"
                onClick={toggleTheme}
                style={css.actionBtn}
                title={theme === "dark" ? "Mode clair" : "Mode sombre"}
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                {(isOpen || isMobile) && (
                  <span>{theme === "dark" ? "Light" : "Dark"}</span>
                )}
              </button>

            </div>

            <button type="button" onClick={logout} style={css.logoutBtn}>
              <LogOut size={14} />
              {(isOpen || isMobile) && <span>{t("nav.logout", "Déconnexion")}</span>}
            </button>
          </div>

        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

export default Sidebar;
