import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { clearDevToken, getCurrentUser, logout as apiLogout } from "../api/auth";
import { LOGIN_REDIRECT_URL } from "../api/authConfig";
import { FULL_ACCESS, isAdminRole, isProviderRole } from "../config/permissions";

export const AuthContext = createContext(null);

const LEGACY_ROLE_PERMISSION_MAP = {
  STORE: [
    "dashboard.view",
    "offers.view_marketplace",
    "offers.view",
    "orders.view",
    "collaborations.view",
    "collaborations.create",
    "wallets.view",
    "commissions.view",
    "invoices.view",
    "messaging.view",
  ],
  AGENCY_OWNER: [
    "dashboard.view",
    "offers.view",
    "offers.create",
    "orders.view",
    "orders.assign",
    "orders.update_status",
    "orders.view_stats",
    "collaborations.view",
    "collaborations.respond",
    "wallets.view",
    "commissions.view",
    "invoices.view",
    "messaging.view",
    "team.view",
    "team.create",
    "team.update",
    "team.manage_permissions",
  ],
  AGENCY_AGENT: [
    "dashboard.view",
    "dashboard.view_own",
    "offers.view",
    "offers.view_marketplace",
    "offers.create",
    "offers.update_own",
    "offers.delete_own",
    "offers.change_status",
    "orders.view",
    "orders.assign",
    "orders.update_status",
    "orders.view_stats",
    "collaborations.view",
    "collaborations.view_own",
    "collaborations.respond",
    "collaborations.activate",
    "collaborations.deactivate",
    "wallets.view",
    "wallets.view_own",
    "wallets.request_withdrawal",
    "wallet_transfers.view",
    "commissions.view",
    "commissions.view_own",
    "invoices.view",
    "invoices.view_own",
    "invoices.download",
    "messaging.view",
    "messaging.view_own",
    "messaging.send",
    "messaging.create",
    "messaging.archive",
    "messaging.mark_read",
    "profile.update",
    "settings.update",
  ],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizePermissions = useCallback((currentUser) => {
    if (!currentUser) return [];

    const permissions = currentUser.permissions || [];
    if (permissions.length > 0 || currentUser.is_child) {
      return permissions;
    }

    return LEGACY_ROLE_PERMISSION_MAP[currentUser.role] || [];
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await getCurrentUser();
      const normalizedUser = {
        ...res.data,
        permissions: normalizePermissions(res.data),
      };
      setUser(normalizedUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [normalizePermissions]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Ignore logout API failure and still clear local session.
    } finally {
      clearDevToken();
      setUser(null);
      window.location.href = LOGIN_REDIRECT_URL;
    }
  }, []);

  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    const permissions = user.permissions || [];
    return permissions.includes(FULL_ACCESS) || permissions.includes(permission);
  }, [user]);

  const hasAnyPermission = useCallback((permissionList) => {
    if (!user) return false;
    return permissionList.some((permission) => hasPermission(permission));
  }, [hasPermission, user]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      logout,
      refreshUser: fetchUser,
      hasPermission,
      hasAnyPermission,
      isProvider: isProviderRole(user?.role),
      isAdmin: isAdminRole(user?.role),
      isParent: !!user?.is_parent,
      isChild: !!user?.is_child,
    }),
    [user, loading, logout, fetchUser, hasPermission, hasAnyPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
