import { motion } from "framer-motion";
import { BellRing, Languages, SlidersHorizontal } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="page-shell px-1 py-2">
      <motion.div
        className="page-header-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-600 text-white dark:bg-primary-500">
            <SlidersHorizontal size={24} />
          </div>
          <div>
            <h1>Settings</h1>
            <p className="mt-1 text-sm text-app-muted">
              This workspace is ready for account preferences, notification rules, and future app options.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="surface-card-muted p-5">
            <BellRing className="tone-success" size={20} />
            <h2 className="mt-3">Notifications</h2>
            <p className="mt-1 text-sm text-app-muted">Prepare rules for alerts, mentions, and operational updates.</p>
          </div>
          <div className="surface-card-muted p-5">
            <Languages className="tone-accent" size={20} />
            <h2 className="mt-3">Localization</h2>
            <p className="mt-1 text-sm text-app-muted">Keep language, direction, and regional defaults close to the workspace.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
