import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

const AccessDenied = ({
  title = "Access restricted",
  message = "Your account does not have permission to view this page.",
}) => (
  <div className="page-shell px-1 py-2">
    <div className="surface-card flex min-h-[360px] flex-col items-center justify-center text-center">
      <div className="grid h-14 w-14 place-items-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
        <LockKeyhole size={24} />
      </div>
      <h1 className="mt-5 text-h2">{title}</h1>
      <p className="mt-2 max-w-md text-app-muted">{message}</p>
      <Link to="/" className="btn-secondary mt-6">
        Back to dashboard
      </Link>
    </div>
  </div>
);

export default AccessDenied;
