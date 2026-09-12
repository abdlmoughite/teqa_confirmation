import { useContext, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Filter, Loader2, Search, Store, TrendingUp, UserRound } from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import { useToast } from "../context/ToastContext";
import {
  ConfirmOrder,
  GetInternalAssignmentRules,
  GetMySourceConnections,
  GetOrdersByAssignmentRules,
  GetOrdersBySources,
} from "../api/auth";

const statusConfig = {
  new: { icon: AlertCircle, badge: "badge--new" },
  pending: { icon: Clock3, badge: "badge--pending" },
  confirmed: { icon: CheckCircle2, badge: "badge--confirmed" },
  cancelled: { icon: AlertCircle, badge: "badge--cancelled" },
};

// local_status (integration_service) -> 4 lanes UI. Toute valeur non
// listée retombe sur "pending" (traitement en cours par défaut).
const LANE_BY_LOCAL_STATUS = {
  new: "new",
  confirmed: "confirmed",
  completed: "confirmed",
  rejected: "cancelled",
  duplicate: "cancelled",
  invalid_address: "cancelled",
  cancelled_by_client: "cancelled",
  cancelled_by_admin: "cancelled",
  refunded: "cancelled",
};

const laneForOrder = (order) => LANE_BY_LOCAL_STATUS[order.local_status] || "pending";

const CONFIRMABLE_LANES = new Set(["new", "pending"]);

const buildAssignmentRuleKey = (rule) =>
  [
    rule.collaboration_id,
    rule.assignment_type,
    rule.source_connection_id || "",
    rule.external_product_id || "",
  ].join("|");

const OrdersPage = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [orders, setOrders] = useState([]);
  const [sourceToCollaboration, setSourceToCollaboration] = useState({});
  const [assignmentRules, setAssignmentRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const sourcesRes = await GetMySourceConnections();
      const sourceIds = sourcesRes.data?.source_connection_ids || [];
      const rules = sourcesRes.data?.assignment_rules || [];
      const mapping = {};
      (sourcesRes.data?.mapping || []).forEach((entry) => {
        mapping[entry.source_connection_id] = entry.collaboration_id;
      });
      let effectiveRules = rules;
      let effectiveSourceIds = sourceIds;

      if (user?.is_child) {
        const internalRes = await GetInternalAssignmentRules().catch(() => ({ data: [] }));
        const allowedRuleKeys = new Set(
          (Array.isArray(internalRes.data) ? internalRes.data : [])
            .filter(
              (rule) =>
                rule.is_active &&
                String(rule.assigned_to_user_id) === String(user.id)
            )
            .map(buildAssignmentRuleKey)
        );
        effectiveRules = rules.filter((rule) => allowedRuleKeys.has(buildAssignmentRuleKey(rule)));
        effectiveSourceIds = [];
      }

      setSourceToCollaboration(mapping);
      setAssignmentRules(effectiveRules);

      if (!effectiveSourceIds.length && !effectiveRules.length) {
        setOrders([]);
        return;
      }

      const ordersRes = effectiveRules.length
        ? await GetOrdersByAssignmentRules(effectiveRules)
        : await GetOrdersBySources(effectiveSourceIds);
      setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : ordersRes.data?.results || []);
    } catch (fetchError) {
      setError(
        fetchError.response?.data?.detail ||
          t("orders.load_error", "Unable to load orders. integration_service may be unreachable.")
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolveCollaborationId = (order) => {
    const activeAssignment = (order.assignments || []).find((item) => item.status === "active");
    if (activeAssignment?.collaboration_id) return activeAssignment.collaboration_id;

    const productIds = new Set(
      (order.items || [])
        .map((item) => item.external_product_id)
        .filter(Boolean)
        .map(String)
    );
    const productRule = assignmentRules.find(
      (rule) =>
        rule.assignment_type === "PRODUCT" &&
        String(rule.source_connection_id) === String(order.source_connection) &&
        productIds.has(String(rule.external_product_id))
    );
    if (productRule?.collaboration_id) return productRule.collaboration_id;

    const sourceRule = assignmentRules.find(
      (rule) =>
        rule.assignment_type === "SOURCE" &&
        String(rule.source_connection_id) === String(order.source_connection)
    );
    if (sourceRule?.collaboration_id) return sourceRule.collaboration_id;

    return sourceToCollaboration[order.source_connection];
  };

  const handleConfirm = async (order) => {
    const collaborationId = resolveCollaborationId(order);
    if (!collaborationId) {
      toast.error(t("orders.no_collaboration", "No active collaboration found for this order's store."));
      return;
    }
    setConfirmingId(order.id);
    try {
      await ConfirmOrder(order.id, collaborationId, order.source_connection);
      toast.success(t("orders.confirmed", "Order confirmed."));
      await fetchOrders();
    } catch (confirmError) {
      toast.error(confirmError.response?.data?.detail || t("orders.confirm_error", "Unable to confirm this order."));
    } finally {
      setConfirmingId(null);
    }
  };

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const haystack = [order.id, order.client_name, order.shipping_city, order.produit]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query.toLowerCase()) && (source === "all" || order.platform === source);
      }),
    [orders, query, source]
  );

  const groupedOrders = useMemo(
    () =>
      Object.keys(statusConfig).map((lane) => ({
        status: lane,
        items: filteredOrders.filter((order) => laneForOrder(order) === lane),
      })),
    [filteredOrders]
  );

  const metrics = useMemo(() => {
    const total = filteredOrders.length;
    const confirmed = filteredOrders.filter((order) => laneForOrder(order) === "confirmed").length;
    const pending = filteredOrders.filter((order) => laneForOrder(order) === "pending").length;
    return [
      { label: t("orders.metrics.today", "Today orders"), value: total, icon: Clock3 },
      { label: t("orders.metrics.confirmed", "Confirmed"), value: confirmed, icon: CheckCircle2 },
      { label: t("orders.metrics.pending", "Pending"), value: pending, icon: AlertCircle },
      { label: t("orders.metrics.rate", "Confirmation rate"), value: total ? `${Math.round((confirmed / total) * 100)}%` : "0%", icon: TrendingUp },
    ];
  }, [filteredOrders, t]);

  return (
    <div className="page-shell space-y-6 px-1 py-2">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="page-header-card flex-1">
          <p className="eyebrow">{user?.role === "AGENCY_AGENT" ? "Agent workspace" : "Agency workspace"}</p>
          <h1 className="mt-4">Order confirmation cockpit</h1>
          <p className="mt-3 max-w-2xl text-app-muted">
            Track confirmation work across stores, agents, and agencies in one clean operational view.
          </p>
        </div>

        <div className="toolbar-card flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-[260px]">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 tone-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("orders.search", "Search order, client, city...")}
              className="field-input pl-9"
            />
          </label>

          <label className="relative min-w-[180px]">
            <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 tone-muted" />
            <select value={source} onChange={(event) => setSource(event.target.value)} className="field-select pl-9">
              <option value="all">All sources</option>
              <option value="youcan">YouCan</option>
              <option value="shopify">Shopify</option>
            </select>
          </label>
        </div>
      </header>

      {error ? <div className="empty-state !p-6 text-red-500">{error}</div> : null}

      {loading ? (
        <div className="empty-state !p-6 inline-flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          {t("orders.loading", "Loading orders...")}
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className="metric-card">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-app-muted">{metric.label}</p>
                  <metric.icon size={18} className="tone-accent" />
                </div>
                <p className="mt-3 text-[28px] font-medium leading-none">{metric.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-4">
            {groupedOrders.map((group) => {
              const config = statusConfig[group.status];
              const Icon = config.icon;

              return (
                <div key={group.status} className="surface-card space-y-4 !p-4">
                  <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-neutral-surface)] px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="tone-accent" />
                      <h2 className="text-h3 capitalize">{group.status}</h2>
                    </div>
                    <span className={`badge ${config.badge}`}>{group.items.length}</span>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((order) => (
                      <article key={order.id} className="order-card">
                        <div className="order-card__header">
                          <div>
                            <p className="order-card__ref">{String(order.id).slice(0, 8)}</p>
                            <p className="order-card__sub">{order.produit || "—"}</p>
                          </div>
                          <span className={`badge ${config.badge}`}>{order.local_status}</span>
                        </div>

                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-medium text-app-strong">{order.client_name || "—"}</p>
                          <p className="text-sm text-app-muted">{order.shipping_city || "—"}</p>
                        </div>

                        <div className="order-card__footer">
                          <span className="inline-flex items-center gap-1 text-app-muted">
                            <UserRound size={13} />
                            {order.client_phone || "—"}
                          </span>
                          <span className="order-card__amount">
                            {order.total_amount} {order.currency}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-app-muted">
                          <span className="inline-flex items-center gap-1">
                            <Store size={12} />
                            {order.platform}
                          </span>
                          <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                        </div>

                        {CONFIRMABLE_LANES.has(group.status) && (
                          <button
                            type="button"
                            onClick={() => handleConfirm(order)}
                            disabled={confirmingId === order.id}
                            className="btn-primary mt-3 w-full text-sm"
                          >
                            {confirmingId === order.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              t("orders.confirm", "Confirm")
                            )}
                          </button>
                        )}
                      </article>
                    ))}

                    {!group.items.length ? <div className="empty-state !p-6">No orders in this lane.</div> : null}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
