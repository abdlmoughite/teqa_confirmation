import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Loading from "../ui/Loading";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;

  if (!user) return window.location.href = "https://teqaconnect.com/login";

  return children;
};

export default PrivateRoute;