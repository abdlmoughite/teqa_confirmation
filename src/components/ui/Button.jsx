import { motion } from "framer-motion";
import { clsx } from "clsx";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const sizes = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-11 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

const Button = ({
  as: Component = "button",
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) => {
  const isButton = Component === "button";

  return (
    <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} className="inline-flex">
      <Component
        type={isButton ? type : undefined}
        className={clsx(
          variants[variant] || variants.primary,
          sizes[size] || sizes.md,
          "transition-all duration-200",
          className
        )}
        {...props}
      >
        {children}
      </Component>
    </motion.div>
  );
};

export default Button;
