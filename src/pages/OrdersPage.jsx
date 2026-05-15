import { useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, Filter, Search, Store, TrendingUp, UserRound } from "lucide-react";

import { AuthContext } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";

const statusConfig = {
  new: { icon: AlertCircle, badge: "badge--new" },
  pending: { icon: Clock3, badge: "badge--pending" },
  confirmed: { icon: CheckCircle2, badge: "badge--confirmed" },
  cancelled: { icon: AlertCircle, badge: "badge--cancelled" },
};

const staticOrders = [
  { id: "ORD-1048", customer: "Yassine El Amrani", city: "Casablanca", store: "Atlas Beauty", amount: "420 MAD", status: "new", agent: "Unassigned", source: "YouCan", updatedAt: "09:20" },
  { id: "ORD-1047", customer: "Sara Bennani", city: "Rabat", store: "Nova Shop", amount: "690 MAD", status: "pending", agent: "Imane", source: "Shopify", updatedAt: "10:05" },
  { id: "ORD-1046", customer: "Hamza Zahri", city: "Marrakech", store: "Home COD", amount: "310 MAD", status: "pending", agent: "Nabil", source: "WooCommerce", updatedAt: "11:30" },
  { id: "ORD-1045", customer: "Nora Tazi", city: "Fes", store: "Atlas Beauty", amount: "260 MAD", status: "confirmed", agent: "Imane", source: "YouCan", updatedAt: "12:10" },
  { id: "ORD-1044", customer: "Anas Bakkali", city: "Tangier", store: "Nova Shop", amount: "540 MAD", status: "cancelled", agent: "Unassigned", source: "Shopify", updatedAt: "12:35" },
];

const OrdersPage = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");

  const filteredOrders = useMemo(
    () =>
      staticOrders.filter((order) => {
        const haystack = [order.id, order.customer, order.city, order.store, order.agent].join(" ").toLowerCase();
        return haystack.includes(query.toLowerCase()) && (source === "all" || order.source === source);
      }),
    [query, source]
  );

  const groupedOrders = useMemo(
    () =>
      Object.keys(statusConfig).map((status) => ({
        status,
        items: filteredOrders.filter((order) => order.status === status),
      })),
    [filteredOrders]
  );

  const metrics = useMemo(() => {
    const total = filteredOrders.length;
    const confirmed = filteredOrders.filter((order) => order.status === "confirmed").length;
    const pending = filteredOrders.filter((order) => order.status === "pending").length;
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
              <option value="YouCan">YouCan</option>
              <option value="Shopify">Shopify</option>
              <option value="WooCommerce">WooCommerce</option>
            </select>
          </label>
        </div>
      </header>

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
                        <p className="order-card__ref">{order.id}</p>
                        <p className="order-card__sub">{order.store}</p>
                      </div>
                      <span className={`badge ${config.badge}`}>{group.status}</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-app-strong">{order.customer}</p>
                      <p className="text-sm text-app-muted">{order.city}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="entity-tag entity-tag--store">
                          <span className="entity-tag__dot" />
                          Store
                        </span>
                        <span className="entity-tag entity-tag--agent">
                          <span className="entity-tag__dot" />
                          Agent
                        </span>
                      </div>
                    </div>

                    <div className="order-card__footer">
                      <span className="inline-flex items-center gap-1 text-app-muted">
                        <UserRound size={13} />
                        {order.agent}
                      </span>
                      <span className="order-card__amount">{order.amount}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-app-muted">
                      <span className="inline-flex items-center gap-1">
                        <Store size={12} />
                        {order.source}
                      </span>
                      <span>{order.updatedAt}</span>
                    </div>
                  </article>
                ))}

                {!group.items.length ? <div className="empty-state !p-6">No orders in this lane.</div> : null}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};

export default OrdersPage;
