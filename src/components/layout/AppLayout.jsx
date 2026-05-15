import { motion } from "framer-motion";
import { clsx } from "clsx";

import Sidebar from "./Sidebar";
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

  return (
    <div dir={dir} className="app-shell">
      {(isMobile || isTablet) && sidebarOpen ? (
        <motion.button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseSidebar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      ) : null}

      <Sidebar
        isOpen={sidebarOpen}
        isMobile={isMobile}
        isTablet={isTablet}
        onClose={onCloseSidebar}
        onToggle={onToggleSidebar}
      />

      <main
        className={clsx(
          "relative z-10 min-h-screen transition-[margin] duration-300 ease-out",
          sidebarOpen ? "lg:ml-[272px]" : "lg:ml-[84px]"
        )}
      >
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
          <motion.div
            className="page-shell space-y-4 md:space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Topbar />
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
