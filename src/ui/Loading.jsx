// src/components/ui/Loading.jsx
export default function Loading({
  fullScreen = false,
  text = "Loading...",
  size = "md",
  variant = "spinner",
  className = "",
}) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  if (variant === "dots") {
    return (
      <div
        className={`flex ${fullScreen ? "min-h-screen" : ""} flex-col items-center justify-center gap-3 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-900 [animation-delay:-0.3s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-700 [animation-delay:-0.15s]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-slate-500" />
        </div>

        {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div
        className={`flex ${fullScreen ? "min-h-screen" : ""} flex-col items-center justify-center gap-4 ${className}`}
        role="status"
        aria-live="polite"
      >
        <div className="w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
          <div className="h-2 w-1/3 animate-pulse rounded-full bg-slate-900" />
        </div>

        {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
      </div>
    );
  }

  return (
    <div
      className={`flex ${fullScreen ? "min-h-screen" : ""} flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`${sizes[size]} animate-spin rounded-full border-slate-300 border-t-slate-900`}
      />

      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );
}