import { motion } from "framer-motion";
import { clsx } from "clsx";

const Card = ({ children, className, bodyClassName, hover = false, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    whileHover={hover ? { y: -4 } : undefined}
    transition={{ duration: 0.3 }}
    className={clsx(
      "overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50",
      hover && "hover:shadow-md",
      className
    )}
    {...props}
  >
    <div className={clsx("p-4 md:p-6", bodyClassName)}>{children}</div>
  </motion.div>
);

export default Card;
