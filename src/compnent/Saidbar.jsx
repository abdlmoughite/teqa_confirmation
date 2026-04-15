import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* =======================
   DATA (EDIT THIS ONLY)
   ======================= */

const Icons = {
    CreditCard: (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M2 10h20"
      stroke="currentColor"
      strokeWidth="1.8"
    />
  </svg>
),

  Home: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3 10.5 12 3l9 7.5V21a1.5 1.5 0 0 1-1.5 1.5H15v-6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 16.5v6H4.5A1.5 1.5 0 0 1 3 21V10.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Chart: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 19V5m0 14h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 16l4-4 3 3 5-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Box: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 7 12 11l7.5-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 11v10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  Users: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 21a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  Settings: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a8.3 8.3 0 0 0 .1-2l2-1.2-2-3.4-2.3.6a8.2 8.2 0 0 0-1.7-1L13 4h-2L9.5 7.9a8.2 8.2 0 0 0-1.7 1L5.5 8.3l-2 3.4 2 1.2a8.3 8.3 0 0 0 .1 2l-2 1.2 2 3.4 2.3-.6c.5.4 1.1.7 1.7 1L11 20h2l1.5-3.9c.6-.3 1.2-.6 1.7-1l2.3.6 2-3.4-2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  Logout: (props) => (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M15 7l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M20 12H10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
};

export const SIDEBAR_NAV = [
  {
    title: "Dashboard",
    items: [
      { label: "Overview", path: "/dashboard", icon: Icons.Home ,disabled: true },
      { label: "Analytics", path: "/dashboard/analytics", icon: Icons.Chart,disabled: true },
    ],
  },
  {
    title: "Order Management",
    items: [
      { label: "Orders Dashboard", path: "/management/orders/dashboard", icon: Icons.Box ,disabled: false},
      { label: "Add Orders", path: "/management/orders/add", icon: Icons.Box ,disabled: false},
      { label: "Pending Orders", path: "/management/orders/pending", icon: Icons.Box,disabled: false },
      { label: "Delivered Orders", path: "/management/orders/delivered", icon: Icons.Box,disabled: false },
      { label: "All Orders", path: "/management/orders", icon: Icons.Box ,disabled: false},
      { label: "Upload data", path: "/management/orders/add_data", icon: Icons.Box ,disabled: false},
    ],
  },
  {
    title: "Clients",
    items: [
      { label: "Clients Dashboard", path: "/clients/dashboard", icon: Icons.Users,disabled: true },
      { label: "Client List", path: "/clients/list", icon: Icons.Users,disabled: true },
      { label: "Add Client", path: "/clients/Add", icon: Icons.Users,disabled: true },
      { label: "Client Scoring", path: "/clients/scoring", icon: Icons.Chart,disabled: true },
    ],
  },
  {
    title: "Integrations",
    items: [
      { label: "Integrations Dashboard", path: "/integration", icon: Icons.Settings,disabled: false },
      { label: "Add Integration", path: "/integrations/add", icon: Icons.Settings,disabled: false },
      { label: "Integrations List", path: "/integrations/list", icon: Icons.Settings,disabled: false },
    ],
  },
  {
    title: "Delivery",
    items: [
      { label: "Delivery Dashboard", path: "/delivery/dashboard", icon: Icons.Box,disabled: false },
      { label: "Add Delivery Company", path: "/delivery/add-company", icon: Icons.Box ,disabled: false},
      { label: "Delivery Companies", path: "/delivery/companies", icon: Icons.Box,disabled: false },
    ],
  },
  {
    title: "Subscriptions",
    items: [
      { label: "Subscriptions Dashboard", path: "/subscriptions/dashboard", icon: Icons.CreditCard,disabled: true },
      { label: "Subscriptions List", path: "/subscriptions/list", icon: Icons.CreditCard ,disabled: true},
    ],
  },
  {
    title: "Marketplace",
    items: [
      { label: "Marketplace Dashboard", path: "/marketplace/", icon: Icons.Box,disabled: true },
      { label: "Offers List", path: "/marketplace/offers", icon: Icons.Box,disabled: true },
      { label: "Completed Offers", path: "/marketplace/collaborators", icon: Icons.Box ,disabled: true},
    ],
  },
  {
    title: "Marketplace Livreur",
    items: [
      { label: "Marketplace Livreur Dashboard", path: "/marketplaceLivreur/dashboard", icon: Icons.Box,disabled: true },
      { label: "Offers Livreur List", path: "/marketplaceLivreur/offers", icon: Icons.Box,disabled: true },
      { label: "Completed Livreur Offers", path: "/marketplaceLivreur/completed", icon: Icons.Box,disabled: true },
    ],
  },
  {
    title: "Users",
    items: [
      { label: "Users Dashboard", path: "/users/dashboard", icon: Icons.Users,disabled: true },
      { label: "Users List", path: "/users/list", icon: Icons.Users ,disabled: true},
      { label: "Add User", path: "/users/add", icon: Icons.Users ,disabled: true},
    ],
  }, 
  {
    title: "Settings",
    items: [
      { label: "Preferences", path: "/settings/preferences", icon: Icons.Settings ,disabled: true},
    ],
  },

]; 


export function flattenRoutes(groups) {
  return groups.flatMap((g) => g.items.map((it) => ({ label: it.label, path: it.path })));
}

/* =======================
   SIDEBAR ONLY
   ======================= */

export function Sidebar({
  groups = SIDEBAR_NAV,
  activePath,
  onNavigate,
    collapsed,
  setCollapsed,
}) {
  const [mobileOpen, setMobileOpen] = useState(false); // mobile overlay
  // const [collapsed, setCollapsed] = useState(false);  // desktop collapse
  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    groups.forEach((g, i) => (initial[g.title] = i === 0));
    return initial;
  });

  const sidebarWidth = collapsed ? "w-20" : "w-72";

  const toggleGroup = (title) =>
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));

  const handleNavigate = (path) => {
    onNavigate?.(path);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile open button (optional) */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 rounded-xl bg-indigo-600 px-3 py-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Open sidebar"
      >
        ☰
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <button
          aria-label="Close sidebar overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          ${sidebarWidth}
          bg-white shadow-sm ring-1 ring-slate-200
          transition-[width,transform] duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-slate-200 p-4">
            {!collapsed && (
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <span className="text-sm font-bold">AD</span>
            </div>
            )}


            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Compte</p>
                <p className="truncate text-sm font-semibold">Admin Dashboard</p>
              </div>
            )}

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setCollapsed((v) => !v)}
              className="ml-auto hidden md:inline-flex items-center justify-center rounded-xl p-2 ring-1 ring-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d={
                    collapsed
                      ? "M10 6h10M10 12h10M10 18h10M4 6h2M4 12h2M4 18h2"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Mobile close */}
            <button
              onClick={() => setMobileOpen(false)}
              className="ml-auto md:hidden inline-flex items-center justify-center rounded-xl p-2 ring-1 ring-slate-200 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close sidebar"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {groups.map((group) => (
                <SidebarGroup
                  key={group.title}
                  title={group.title}
                  open={!collapsed && !!openGroups[group.title]}
                  canShowLabel={!collapsed}
                  onToggle={() => toggleGroup(group.title)}
                >
                  {group.items.map((item) => (
                    <Link to={item.path}>
                    <SidebarItem
                      key={item.path}
                      item={item}
                      active={activePath === item.path}
                      collapsed={collapsed}
                      onClick={() => handleNavigate(item.path)}
                    /></Link>

                  ))}
                </SidebarGroup>
                
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-200 p-3">
            <SidebarItem
              item={{ label: "Logout", path: "/logout", icon: Icons.Logout }}
              active={false}
              collapsed={collapsed}
              danger
              onClick={async () => {

                 
    try {
      await fetch("https://auth.teqaconnect.com/auth/logout/", {
        method: "POST",
        credentials: "include", 
      });
    } catch (err) {
      console.log("Logout error:", err);
    }

    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";

              }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}

/* =======================
   SUB COMPONENTS
   ======================= */

function SidebarGroup({ title, open, canShowLabel, onToggle, children }) {
  return (
    <section className="rounded-2xl">
      {/* Group header (hidden when collapsed) */}
      <button
        type="button"
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between
          rounded-xl px-3 py-2
          text-xs font-semibold uppercase tracking-wide
          text-slate-500 hover:text-slate-700 hover:bg-slate-50
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          ${!canShowLabel ? "sr-only" : ""}
        `}
        aria-expanded={open}
      >
        <span>{title}</span>
        <Chevron
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Collapsible content */}
      <div
        className={`
          grid transition-[grid-template-rows,opacity] duration-300
          ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}
        `}
        aria-hidden={!open}
      >
        <div className="overflow-hidden">
          <div className="mt-1 space-y-1">{children}</div>
        </div>
      </div>
    </section>
  );
}

function SidebarItem({ item, active, collapsed, onClick, danger = false }) {
  const Icon = item.icon;
  const isDisabled = item.disabled;

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={() => {
          if (isDisabled) {
            alert("🚀 Marketplace Livreur coming soon!");
            return;
          }
          onClick?.();
        }}
        disabled={isDisabled}
        className={`
          w-full flex items-center gap-3
          rounded-xl px-3 py-2
          text-sm font-medium
          transition duration-200
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          ${collapsed ? "justify-center" : "justify-start"}
          ${
            isDisabled
              ? "text-slate-400 cursor-not-allowed"
              : danger
              ? "text-rose-600 hover:bg-rose-50"
              : active
              ? "bg-indigo-50 text-indigo-700"
              : "text-slate-700 hover:bg-slate-50"
          }
        `}
      >
        <Icon className={`h-5 w-5 ${isDisabled ? "text-slate-400" : ""}`} />

        {!collapsed && (
          <span className="truncate flex items-center gap-2">
            {item.label}
            {isDisabled && (
              <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                Soon
              </span>
            )}
          </span>
        )}
      </button>
    </div>
  );
}

function Chevron({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
 export default Sidebar;