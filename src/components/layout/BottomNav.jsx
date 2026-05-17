import { Link, useLocation } from "react-router-dom";
import { clsx } from "clsx";
import { BriefcaseBusiness, Handshake, LayoutDashboard, UserRound } from "lucide-react";

const items = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Marketplace", path: "/marketplace", icon: BriefcaseBusiness },
  { label: "Collabs", path: "/collaborations", icon: Handshake },
  { label: "Profil", path: "/profile", icon: UserRound },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="teqa-bottom-nav" aria-label="Navigation mobile">
      {items.map((item) => {
        const active = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
        const Icon = item.icon;

        return (
          <Link key={item.path} to={item.path} className={clsx("teqa-bottom-nav__item", active && "active")}>
            <Icon size={18} strokeWidth={1.8} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
