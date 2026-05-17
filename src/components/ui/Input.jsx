import { forwardRef } from "react";
import { clsx } from "clsx";

const Input = forwardRef(({ icon: Icon, className, wrapperClassName, ...props }, ref) => (
  <label className={clsx("teqa-input-wrap", wrapperClassName)}>
    {Icon ? <Icon className="teqa-input-wrap__icon" size={18} strokeWidth={1.8} aria-hidden="true" /> : null}
    <input ref={ref} className={clsx("teqa-input", Icon && "teqa-input--with-icon", className)} {...props} />
  </label>
));

Input.displayName = "Input";

export default Input;
