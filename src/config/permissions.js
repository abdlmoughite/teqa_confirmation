export const FULL_ACCESS = "*";

export const ROLES = {
  STORE: "STORE",
  AGENCY_OWNER: "AGENCY_OWNER",
  AGENCY_AGENT: "AGENCY_AGENT",
  ADMIN: "ADMIN",
  SUPERADMIN: "SUPERADMIN",
};

export const PERMISSIONS = {
  dashboardView: "dashboard.view",
  dashboardViewOwn: "dashboard.view_own",
  offersView: "offers.view",
  offersMarketplace: "offers.view_marketplace",
  offersCreate: "offers.create",
  offersUpdate: "offers.update",
  offersUpdateOwn: "offers.update_own",
  offersUpdateAgency: "offers.update_agency",
  offersDelete: "offers.delete",
  offersDeleteOwn: "offers.delete_own",
  offersDeleteAgency: "offers.delete_agency",
  offersStatus: "offers.change_status",
  ordersView: "orders.view",
  ordersAssign: "orders.assign",
  ordersUpdateStatus: "orders.update_status",
  ordersStats: "orders.view_stats",
  collaborationsView: "collaborations.view",
  collaborationsViewOwn: "collaborations.view_own",
  collaborationsViewAgency: "collaborations.view_agency",
  collaborationsCreate: "collaborations.create",
  collaborationsRespond: "collaborations.respond",
  collaborationsActivate: "collaborations.activate",
  collaborationsDeactivate: "collaborations.deactivate",
  collaborationsManage: "collaborations.manage",
  walletsView: "wallets.view",
  walletsViewOwn: "wallets.view_own",
  walletsViewAgency: "wallets.view_agency",
  commissionsView: "commissions.view",
  commissionsViewOwn: "commissions.view_own",
  commissionsViewAgency: "commissions.view_agency",
  invoicesView: "invoices.view",
  invoicesViewOwn: "invoices.view_own",
  invoicesViewAgency: "invoices.view_agency",
  messagingView: "messaging.view",
  messagingViewOwn: "messaging.view_own",
  messagingViewAgency: "messaging.view_agency",
  messagingSend: "messaging.send",
  messagingArchive: "messaging.archive",
  teamView: "team.view",
  teamCreate: "team.create",
  teamUpdate: "team.update",
  teamManagePermissions: "team.manage_permissions",
};

export const ROUTE_PERMISSIONS = {
  dashboard: [PERMISSIONS.dashboardView, PERMISSIONS.dashboardViewOwn],
  offers: [PERMISSIONS.offersView, PERMISSIONS.offersMarketplace, PERMISSIONS.offersCreate],
  orders: [PERMISSIONS.ordersView, PERMISSIONS.ordersAssign, PERMISSIONS.ordersUpdateStatus],
  collaborations: [
    PERMISSIONS.collaborationsView,
    PERMISSIONS.collaborationsViewOwn,
    PERMISSIONS.collaborationsViewAgency,
    PERMISSIONS.collaborationsRespond,
  ],
  wallet: [PERMISSIONS.walletsView, PERMISSIONS.walletsViewOwn, PERMISSIONS.walletsViewAgency],
  commissions: [
    PERMISSIONS.commissionsView,
    PERMISSIONS.commissionsViewOwn,
    PERMISSIONS.commissionsViewAgency,
  ],
  invoices: [PERMISSIONS.invoicesView, PERMISSIONS.invoicesViewOwn, PERMISSIONS.invoicesViewAgency],
  messages: [
    PERMISSIONS.messagingView,
    PERMISSIONS.messagingViewOwn,
    PERMISSIONS.messagingViewAgency,
    PERMISSIONS.messagingSend,
  ],
  team: [
    PERMISSIONS.teamView,
    PERMISSIONS.teamCreate,
    PERMISSIONS.teamUpdate,
    PERMISSIONS.teamManagePermissions,
  ],
};

export const normalizeRole = (role) => String(role || "").toUpperCase();

export const isProviderRole = (role) =>
  [ROLES.AGENCY_OWNER, ROLES.AGENCY_AGENT].includes(normalizeRole(role));

export const isAdminRole = (role) =>
  [ROLES.ADMIN, ROLES.SUPERADMIN].includes(normalizeRole(role));

export const hasPermissionCode = (permissions = [], code) =>
  permissions.includes(FULL_ACCESS) || permissions.includes(code);

export const hasAnyPermissionCode = (permissions = [], codes = []) =>
  codes.some((code) => hasPermissionCode(permissions, code));
