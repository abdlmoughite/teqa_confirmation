import { motion } from "framer-motion";
import { clsx } from "clsx";

const Card = ({ children, className, bodyClassName, hover = false, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    whileHover={hover ? { y: -3 } : undefined}
    transition={{ duration: 0.25 }}
    className={clsx("teqa-card", hover && "teqa-card--hover", className)}
    {...props}
  >
    <div className={clsx("teqa-card__body", bodyClassName)}>{children}</div>
  </motion.div>
);

export default Card;
