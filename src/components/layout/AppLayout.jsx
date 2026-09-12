import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import Topbar from "../../compnent/Topbar";
import { useTranslation } from "../../hooks/useTranslation";

const AppLayout = ({
  children,
  sidebarOpen,
  isMobile,
  isTablet,
  onCloseSidebar,
  onToggleSidebar,
}) => {
  const { dir } = useTranslation();

  /*
   * Content left margin logic:
   *   mobile       → 0 (sidebar is a full overlay, hidden when closed)
   *   tablet/lg collapsed → 72px (icon-only sidebar is always visible)
   *   lg+ open     → 272px
   */
  const contentMargin = clsx(
    !isMobile && "md:ml-[72px]",
    !isMobile && !isTablet && sidebarOpen && "lg:ml-[272px]"
  );

  return (
    <div dir={dir} className="app-shell">

      {/* Backdrop — mobile/tablet drawer overlay */}
      <AnimatePresence>
        {(isMobile || isTablet) && sidebarOpen ? (
          <motion.button
            type="button"
            aria-label="Fermer le menu"
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(0,0,0,0.58)", backdropFilter: "blur(3px)", cursor: "default" }}
            onClick={onCloseSidebar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        ) : null}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
        onClose={onCloseSidebar}
        onToggle={onToggleSidebar}
      />

      {/* Main content */}
      <main
        className={clsx(
          "relative z-10 min-h-screen transition-[margin] duration-300 ease-out",
          contentMargin
        )}
      >
        <div
          className={clsx(
            "min-h-screen p-4 md:p-6 lg:p-8",
            isMobile && "pb-24"  /* room for BottomNav */
          )}
        >
          <motion.div
            className="page-shell space-y-4 md:space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Topbar receives sidebar toggle for mobile hamburger */}
            <Topbar
              isMobile={isMobile}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={onToggleSidebar}
            />
            {children}
          </motion.div>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      {isMobile && <BottomNav onOpenSidebar={onToggleSidebar} />}
    </div>
  );
};

export default AppLayout;
