import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LOGIN_REDIRECT_URL } from "../api/authConfig";
import Loading from "../ui/Loading";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;

  if (!user) {
    window.location.href = LOGIN_REDIRECT_URL;
    return null;
  }

  return children;
};

export default PrivateRoute;
