import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import {
  BriefcaseBusiness,
  Handshake,
  LayoutDashboard,
  Menu,
  UserRound,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",   path: "/",               icon: LayoutDashboard },
  { label: "Marketplace", path: "/marketplace",    icon: BriefcaseBusiness },
  { label: "Collabs",     path: "/collaborations", icon: Handshake },
  { label: "Profile",     path: "/profile",        icon: UserRound },
];

const BottomNav = ({ onOpenSidebar }) => {
  const location = useLocation();

  return (
    <nav
      className="teqa-bottom-nav"
      aria-label="Navigation mobile"
      style={{ gridTemplateColumns: `repeat(${navItems.length + 1}, minmax(0, 1fr))` }}
    >
      {navItems.map((item) => {
        const active =
          location.pathname === item.path ||
          (item.path !== "/" && location.pathname.startsWith(item.path));
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={clsx("teqa-bottom-nav__item", active && "active")}
          >
            {/* Active indicator bar */}
            <span
              className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full transition-all duration-200"
              style={{
                width: active ? 24 : 0,
                height: 2,
                background: "var(--teqa-green)",
                opacity: active ? 1 : 0,
              }}
            />
            <Icon size={20} strokeWidth={active ? 2 : 1.6} />
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>{item.label}</span>
          </Link>
        );
      })}

      {/* More — opens sidebar drawer */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="teqa-bottom-nav__item"
        aria-label="Menu"
      >
        <Menu size={20} strokeWidth={1.6} />
        <span style={{ fontSize: 10 }}>More</span>
      </button>
    </nav>
  );
};

export default BottomNav;
