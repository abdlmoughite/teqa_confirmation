import { useContext } from "react";
import { Bell } from "lucide-react";

import { AuthContext } from "../../context/AuthContext";
import Badge from "../ui/Badge";

const Header = () => {
  const { user } = useContext(AuthContext);
  const firstName = getFirstName(user);
  const isAgent = user?.role === "AGENCY_AGENT";

  return (
    <header className="teqa-header">
      <div className="min-w-0">
        <p className="teqa-label">{isAgent ? "Espace agent" : "Espace agence"}</p>
        <h1 className="mt-1 truncate text-title">Bonjour, {firstName}</h1>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Badge variant={isAgent ? "blue" : "green"}>{isAgent ? "Agent" : "Agence"}</Badge>
        <button type="button" className="icon-button relative" aria-label="Notifications">
          <Bell size={18} strokeWidth={1.8} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--teqa-red)]" />
        </button>
      </div>
    </header>
  );
};

const getFirstName = (user) => {
  const agentName = user?.agent?.first_name;
  const username = user?.username || user?.email || "TEQA";
  return agentName || String(username).split(/[.@\s_-]/).filter(Boolean)[0] || "TEQA";
};

export default Header;
