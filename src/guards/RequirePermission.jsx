import { useContext } from "react";

import AccessDenied from "../components/AccessDenied";
import { AuthContext } from "../context/AuthContext";

const RequirePermission = ({ anyOf = [], children }) => {
  const { hasAnyPermission } = useContext(AuthContext);

  if (!anyOf.length || hasAnyPermission(anyOf)) {
    return children;
  }

  return <AccessDenied />;
};

export default RequirePermission;
