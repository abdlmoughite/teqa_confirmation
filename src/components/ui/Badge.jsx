import { clsx } from "clsx";

export const statusBadgeVariant = {
  active: "green",
  pending: "blue",
  rejected: "red",
  cancelled: "red",
  countered: "neutral",
  inactive: "neutral",
  paid: "green",
  failed: "red",
};

const Badge = ({ children, variant = "neutral", className, ...props }) => (
  <span className={clsx("teqa-badge", `badge-${variant}`, className)} {...props}>
    {children}
  </span>
);

export default Badge;
