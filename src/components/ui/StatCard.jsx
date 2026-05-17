import { clsx } from "clsx";

const deltaClass = {
  up: "teqa-stat__delta--up",
  down: "teqa-stat__delta--down",
  neutral: "teqa-stat__delta--neutral",
};

const StatCard = ({ value, label, delta, deltaType = "neutral", className, style }) => (
  <div className={clsx("teqa-card teqa-stat", className)} style={style}>
    <p className="teqa-stat__label">{label}</p>
    <p className="teqa-stat__value">{value}</p>
    {delta ? <p className={clsx("teqa-stat__delta", deltaClass[deltaType])}>{delta}</p> : null}
  </div>
);

export default StatCard;
