// Saidbar.jsx - Version améliorée
import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FileText,
  Users,
  Phone,
  Upload,
  DollarSign,
  CreditCard,
  TrendingUp,
  Bell,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  HelpCircle,
  Handshake
} from "lucide-react";
import { Wallet as WalletIcon } from "lucide-react";
import { TrendingUp as TrendingUpIcon } from "lucide-react";
import { FileText as FileTextIcon } from "lucide-react";
/* =========================================================
   MENU STRUCTURE
========================================================= */

const MENU_ITEMS = [
  { type: "section", label: "Main" },
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  
  { type: "section", label: "Collaboration" },
  { name: "Offers", path: "/offers", icon: Package },
  // { name: "Create Offer", path: "/create-offer", icon: PlusCircle },
  { name: "Collaborations", path: "/collaborations", icon: Handshake },
  { name: "Agents", path: "/agents", icon: Users },
  
  { type: "section", label: "Orders" },
  { name: "Orders", path: "/orders", icon: Phone },
  { name: "Upload Orders", path: "/upload", icon: Upload },
  
  { type: "section", label: "Finance" },
  { name: "Commissions", path: "/commissions", icon: TrendingUpIcon },
  { name: "Invoices", path: "/invoices", icon: FileTextIcon },
  { name: "Wallet", path: "/wallet", icon: WalletIcon },
  { name: "Earnings", path: "/earnings", icon: DollarSign },
  { name: "Billing", path: "/billing", icon: CreditCard },
  
  { type: "section", label: "Analytics" },
  { name: "Analytics", path: "/analytics", icon: TrendingUp },
  
  { type: "section", label: "System" },
  { name: "Notifications", path: "/notifications", icon: Bell },
  { name: "Settings", path: "/settings", icon: Settings },
  { name: "Profile", path: "/profile", icon: User },
];

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Saidbar = ({ isOpen, isMobile, isTablet, onClose, onToggle }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState("light");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const scrollRef = useRef(null);

  // Utiliser isOpen si fourni (depuis AppConfirmation), sinon utiliser collapsed
  const isSidebarOpen = onToggle ? isOpen : !collapsed;
  const toggleSidebar = onToggle || (() => setCollapsed(!collapsed));

  /* =========================================================
     THEME MANAGEMENT
  ========================================================= */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme === "dark" || (!savedTheme && prefersDark) ? "dark" : "light";
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (mode) => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    applyTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    // Ajoute ta logique de déconnexion ici
  };

  // Détecter le scroll pour cacher le nom de l'app
  const handleScroll = () => {
    if (scrollRef.current) {
      setScrolled(scrollRef.current.scrollTop > 10);
    }
  };

  /* =========================================================
     RENDER MENU ITEM
  ========================================================= */
  const renderMenuItem = (item, index) => {
    if (item.type === "section") {
      if (!isSidebarOpen) return null;
      
      return (
        <div key={index} className="px-3 pt-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {item.label}
          </p>
        </div>
      );
    }

    const isActive = location.pathname === item.path;
    const Icon = item.icon;
    const isHovered = hoveredItem === index;

    return (
      <div key={index} className="relative px-2">
        <Link
          to={item.path}
          onClick={() => {
            if (isMobile && isSidebarOpen && onClose) {
              onClose();
            }
          }}
          onMouseEnter={() => setHoveredItem(index)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            group relative flex items-center gap-3 px-3 py-2 rounded-lg
            transition-all duration-150
            ${!isSidebarOpen ? "justify-center" : ""}
            ${isActive 
              ? "bg-blue-500 text-white shadow-md" 
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
            }
          `}
        >
          <Icon 
            size={18} 
            className={`
              transition-all duration-150 flex-shrink-0
              ${isActive ? "text-white" : "text-gray-500 dark:text-gray-500"}
            `}
            strokeWidth={isActive ? 2 : 1.5}
          />
          
          {isSidebarOpen && (
            <span className={`text-sm ${isActive ? "font-medium" : ""} truncate`}>
              {item.name}
            </span>
          )}

          {/* Tooltip for collapsed mode */}
          {!isSidebarOpen && isHovered && !isMobile && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap z-50 shadow-lg animate-fade-in">
              {item.name}
            </div>
          )}
        </Link>
      </div>
    );
  };

  // Déterminer la largeur de la sidebar
const sidebarWidth = isSidebarOpen ? (isMobile ? "w-64" : "w-56") : "w-16";

  return (
    <aside
      className={`
        fixed top-0 left-0 h-screen flex flex-col
        transition-all duration-300 ease-in-out
        ${sidebarWidth}
        bg-white dark:bg-gray-900
        border-r border-gray-100 dark:border-gray-800
        z-50 shadow-lg
      `}
      style={{
        transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s ease-in-out, width 0.3s ease-in-out'
      }}
    >
      {/* ================= HEADER / LOGO (FIXE) ================= */}
      <div className="flex-shrink-0 border-b border-gray-100 dark:border-gray-800">
        <div className={`
          flex items-center justify-between px-3 py-3
          transition-all duration-300
          ${!isSidebarOpen ? "px-2 justify-center" : ""}
        `}>
          {/* Logo - Le nom disparaît au scroll */}
          {isSidebarOpen && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">T</span>
              </div>
              
              <h1 className={`
                text-sm font-semibold whitespace-nowrap
                transition-all duration-300
                ${scrolled ? "opacity-0 -translate-x-2 pointer-events-none w-0" : "opacity-100 translate-x-0"}
                bg-gradient-to-r from-gray-700 to-gray-500 dark:from-gray-300 dark:to-gray-500 bg-clip-text text-transparent
              `}>
                TeqaConnect
              </h1>
            </div>
          )}

          {!isSidebarOpen && (
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-xs">T</span>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={`
              p-1 rounded-md transition-all duration-200
              hover:bg-gray-100 dark:hover:bg-gray-800
              text-gray-400 hover:text-blue-500
              flex-shrink-0
              ${!isSidebarOpen ? "mx-auto" : ""}
            `}
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* ================= SCROLLABLE MENU (SCROLLBAR HIDDEN) ================= */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hidden"
      >
        <div className="py-3">
          {MENU_ITEMS.map((item, index) => renderMenuItem(item, index))}
        </div>
      </div>

      {/* ================= BOTTOM SECTION (FIXE) ================= */}
      <div className="flex-shrink-0 p-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
        {/* Theme Toggle + Logout côte à côte */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className={`
              flex items-center justify-center gap-2 px-2 py-1.5 rounded-md
              transition-all duration-200
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${!isSidebarOpen ? "flex-1" : "flex-1"}
            `}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <Sun size={16} className="text-yellow-500" />
            ) : (
              <Moon size={16} className="text-gray-600" />
            )}
            {isSidebarOpen && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={`
              flex items-center justify-center gap-2 px-2 py-1.5 rounded-md
              transition-all duration-200
              hover:bg-red-50 dark:hover:bg-red-900/20
              hover:text-red-600 dark:hover:text-red-400
              text-gray-600 dark:text-gray-400
              ${!isSidebarOpen ? "flex-1" : "flex-1"}
            `}
            title="Logout"
          >
            <LogOut size={16} />
            {isSidebarOpen && (
              <span className="text-xs">Logout</span>
            )}
          </button>
        </div>

        {/* Help link */}
        {isSidebarOpen && !isMobile && (
          <Link
            to="/help"
            className="flex items-center justify-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <HelpCircle size={14} />
            <span>Help</span>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Saidbar;