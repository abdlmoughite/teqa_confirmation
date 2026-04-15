import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import Loading from "../ui/Loading";

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading && !user) {
      window.location.replace("https://teqaconnect.com/login");
    }
  }, [loading, user]);

  if (loading) {
    return <Loading fullScreen text="Checking your session..." size="lg" />;
  }

  if (!user) {
    return <Loading fullScreen text="Redirecting to login..." variant="dots" />;
  }

  return children;
}