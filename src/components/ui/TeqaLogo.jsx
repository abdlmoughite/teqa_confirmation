import { clsx } from "clsx";

const sizes = { sm: 20, md: 28, lg: 36 };

const TeqaLogo = ({ size = "md", showText = true, className }) => {
  const s = sizes[size] || sizes.md;

  return (
    <div className={clsx("teqa-logo", className)} style={{ "--teqa-logo-size": `${s}px` }}>
      {showText ? <span className="teqa-logo__text">TEQA</span> : null}
      {/* Pyramid mark — per SKILLTEQA.MD spec:
          triangle = green #22c55e / bar1 = blue #3b82f6 / bar2 = red #ef4444 */}
      <svg
        className="teqa-logo__mark"
        width={s * 0.6}
        height={s * 0.75}
        viewBox="0 0 18 22"
        fill="none"
        aria-hidden="true"
      >
        <polygon points="9,0 18,8 0,8" fill="#22c55e" />
        <rect x="2" y="10" width="14" height="4" rx="1" fill="#3b82f6" />
        <rect x="0" y="16" width="18" height="4" rx="1" fill="#ef4444" />
        <path
          d="M1 21 Q9 18 17 21"
          stroke="var(--teqa-sidebar)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default TeqaLogo;
