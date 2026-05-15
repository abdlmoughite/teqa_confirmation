export function LoadingSpinner({ size = "md" }) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };

  return (
    <div
      role="status"
      aria-label="Chargement"
      className={`${sizes[size] || sizes.md} animate-spin rounded-full border-2 border-slate-200 border-t-primary-600 dark:border-slate-800 dark:border-t-primary-400`}
    />
  );
}

export function PageLoader({ label = "Chargement..." }) {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
      <LoadingSpinner size="lg" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card space-y-4">
      <div className="stat-card-header">
        <div className="skeleton skeleton-text w-2/5" />
        <div className="skeleton skeleton-avatar rounded-lg" />
      </div>
      <div className="skeleton h-8 w-3/5 rounded-full" />
      <div className="skeleton skeleton-text w-1/3" />
    </div>
  );
}

export function SkeletonLoader({ variant = "card", count = 1 }) {
  const className = {
    card: "skeleton skeleton-card",
    text: "skeleton skeleton-text",
    title: "skeleton skeleton-title",
    avatar: "skeleton skeleton-avatar",
    button: "skeleton skeleton-button",
  }[variant] || "skeleton skeleton-card";

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={className} />
      ))}
    </>
  );
}

const Loading = () => (
  <div className="page-shell space-y-4 p-6">
    <SkeletonLoader variant="title" />
    <div className="grid gap-4 md:grid-cols-3">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    <SkeletonLoader variant="card" />
  </div>
);

export default Loading;
