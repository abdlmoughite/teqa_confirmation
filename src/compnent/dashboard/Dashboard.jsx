import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, AlertTriangle, BarChart3, Bell, Building2, CreditCard, Handshake, Loader2, MessageCircle, PieChart, ReceiptText, RefreshCw, Store, TrendingUp, UserRound, Wallet } from "lucide-react";

import { GetDashboardStats } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";
import { LanguageContext } from "../../context/LanguageContext";

const chartColors = ["#2563EB", "#16A34A", "#D97706", "#7C3AED", "#DC2626", "#0891B2"];

const formatCurrency = (value) => {
  const numeric = Number(value || 0);
  return new Intl.NumberFormat("fr-MA", {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numeric) ? numeric : 0);
};

const statusLabel = (value) =>
  String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await GetDashboardStats();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || t("dashboard.load_error", "Unable to load statistics."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const workspace = useMemo(() => {
    if (user?.role === "AGENCY_OWNER") {
      return {
        title: "Agency command center",
        description: "Suivez les offres, collaborations, messages et revenus de votre agence.",
        icon: Building2,
        scopeLabel: user?.agency?.agency_name || user?.agency_name || "Agence",
      };
    }

    if (user?.role === "AGENCY_AGENT") {
      return {
        title: "Agent workspace",
        description: "Gardez une vue directe sur vos collaborations, conversations et commissions.",
        icon: UserRound,
        scopeLabel: [user?.agent?.first_name, user?.agent?.last_name].filter(Boolean).join(" ") || user?.username || "Agent",
      };
    }

    return {
      title: "Marketplace command center",
      description: "A single operational snapshot for offers, collaborations, finance, and conversations.",
      icon: Activity,
      scopeLabel: user?.role || t("nav.workspace", "Workspace"),
    };
  }, [t, user]);

  const cards = useMemo(() => {
    if (!data) return [];
    const ownPrefix = user?.role === "AGENCY_AGENT" ? "My " : "";
    return [
      { key: "offers", title: `${ownPrefix}Offers`, value: data.overview.offers_count, icon: CreditCard },
      { key: "collabs", title: `${ownPrefix}Collaborations`, value: data.overview.collaborations_count, icon: Handshake },
      { key: "invoices", title: "Invoices", value: data.overview.invoices_count, icon: ReceiptText },
      { key: "messages", title: "Unread messages", value: data.overview.unread_messages, icon: MessageCircle },
      { key: "wallets", title: "Wallet balance", value: `${formatCurrency(data.finance.wallet_balance_total)} MAD`, icon: Wallet },
      { key: "marketplace", title: "Marketplace offers", value: data.marketplace?.active_offers_count ?? 0, icon: Store },
      { key: "paid", title: "Paid commissions", value: `${formatCurrency(data.finance.paid_commissions_total)} MAD`, icon: TrendingUp },
      { key: "attention", title: "Needs attention", value: Object.values(data.health?.requires_attention || {}).reduce((sum, value) => sum + Number(value || 0), 0), icon: AlertTriangle },
    ];
  }, [data, user]);

  const collaborationChart = useMemo(() => (
    data?.charts?.collaboration_status || Object.entries(data?.collaborations?.by_status || {}).map(([label, value]) => ({ label, value }))
  ), [data]);

  const offerChart = useMemo(() => (
    data?.charts?.offer_status || Object.entries(data?.offers?.by_status || {}).map(([label, value]) => ({ label, value }))
  ), [data]);

  const invoiceChart = useMemo(() => (
    data?.charts?.invoice_status || Object.entries(data?.invoices?.by_status || {}).map(([label, value]) => ({ label, value }))
  ), [data]);

  const dailyActivity = data?.charts?.daily_activity || [];

  return (
    <div className="page-shell space-y-6 px-1 py-2">
      <motion.section
        className="page-header-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow">{user?.is_child ? "Child account" : user?.role || t("nav.workspace", "Workspace")}</div>
            <h1 className="mt-4">{workspace.title}</h1>
            <p className="mt-3 max-w-2xl text-app-muted">
              {workspace.description}
            </p>
          </div>
          <button type="button" onClick={fetchStats} className="btn-secondary">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </motion.section>

      {loading ? (
        <div className="surface-card flex items-center justify-center gap-2 py-20 text-app-muted">
          <Loader2 className="animate-spin" size={22} />
          Loading...
        </div>
      ) : null}

      {error ? <div className="alert-danger">{error}</div> : null}

      {!loading && data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div key={card.key} className="metric-card">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-app-muted">{card.title}</p>
                  <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[var(--color-primary-surface)] tone-accent">
                    <card.icon size={18} />
                  </span>
                </div>
                <p className="mt-4 text-[28px] font-medium leading-none">{card.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
            <div className="surface-card space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="tone-accent" />
                <h2>7-day activity</h2>
              </div>
              <ActivityBars items={dailyActivity} />
            </div>

            <div className="surface-card space-y-3">
              <div className="flex items-center gap-2">
                <workspace.icon size={18} className="tone-accent" />
                <h2>Workspace scope</h2>
              </div>
              <StatLine label="Current scope" value={workspace.scopeLabel} />
              <StatLine label="Access mode" value={user?.is_child ? "Restricted child permissions" : "Parent account access"} />
              <StatLine label="Permission count" value={(user?.permissions || []).includes("*") ? "Full access" : String((user?.permissions || []).length)} />
              <StatLine label="Active collaboration rate" value={`${data.health?.rates?.collaboration_active_rate ?? 0}%`} />
              <StatLine label="Payment success rate" value={`${data.health?.rates?.commission_payment_success_rate ?? 0}%`} />
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <DonutStatus title="Collaborations" icon={Handshake} items={collaborationChart} />
            <DonutStatus title="Offers" icon={CreditCard} items={offerChart} />
            <DonutStatus title="Invoices" icon={ReceiptText} items={invoiceChart} />
          </section>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="surface-card space-y-3">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="tone-accent" />
                <h2>Finance</h2>
              </div>
              <StatLine label="Total wallet balance" value={`${formatCurrency(data.finance.wallet_balance_total)} MAD`} />
              <StatLine label="Paid commissions" value={`${formatCurrency(data.finance.paid_commissions_total)} MAD`} />
              <StatLine label="Pending commissions" value={`${formatCurrency(data.finance.pending_commissions_total)} MAD`} />
              <StatLine label="Wallet transfers" value={String(data.finance.transfers_count)} />
              <StatLine label="Transfer volume" value={`${formatCurrency(data.finance.transfers_total_amount)} MAD`} />
            </div>

            <div className="surface-card space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="tone-accent" />
                <h2>Operational focus</h2>
              </div>
              <StatLine label="Awaiting responses" value={String(data.collaborations.by_status.pending || 0)} />
              <StatLine label="Active collaborations" value={String(data.collaborations.by_status.active || 0)} />
              <StatLine label="Unread conversations" value={String(data.overview.unread_messages)} />
              <StatLine label="Created last 7 days" value={String(data.collaborations.created_last_7_days)} />
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="surface-card space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <h2>Needs attention</h2>
              </div>
              {Object.entries(data.health?.requires_attention || {}).map(([label, value]) => (
                <StatLine key={label} label={statusLabel(label)} value={String(value)} />
              ))}
            </div>

            <div className="surface-card space-y-4">
              <div className="flex items-center gap-2">
                <Store size={18} className="tone-accent" />
                <h2>Marketplace health</h2>
              </div>
              <StatLine label="Active public offers" value={String(data.marketplace?.active_offers_count ?? 0)} />
              <StatLine label="Providers" value={String(data.marketplace?.providers_count ?? 0)} />
              <StatLine label="Agency offers" value={String(data.marketplace?.agency_owner_offers_count ?? 0)} />
              <StatLine label="Agent offers" value={String(data.marketplace?.agency_agent_offers_count ?? 0)} />
              <StatLine label="Average offer price" value={`${formatCurrency(data.marketplace?.average_offer_price)} MAD`} />
            </div>
          </section>

          <section className="surface-card space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard size={18} className="tone-accent" />
              <h2>Top offers by collaboration activity</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(data.offers?.top_by_collaborations || []).length ? (
                data.offers.top_by_collaborations.map((offer) => (
                  <div key={offer.id} className="surface-card-muted">
                    <p className="truncate text-sm font-semibold text-app-strong">{offer.titre}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <StatLine label="All collabs" value={String(offer.collaborations_count)} />
                      <StatLine label="Active" value={String(offer.active_collaborations_count)} />
                    </div>
                    <p className="mt-3 text-xs text-app-muted">{formatCurrency(offer.prix)} {offer.currency}</p>
                  </div>
                ))
              ) : (
                <div className="empty-state md:col-span-2 xl:col-span-3">No offer activity yet.</div>
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <MiniCard icon={TrendingUp} label="Invoice total" value={`${formatCurrency(data.invoices?.total_amount)} MAD`} />
            <MiniCard icon={Bell} label="Conversations" value={data.overview.conversations_count} />
            <MiniCard icon={Bell} label="Last update" value={new Date(data.last_updated_at).toLocaleString()} />
          </section>
        </>
      ) : null}
    </div>
  );
};

const StatLine = ({ label, value }) => (
  <div className="surface-card-muted">
    <p className="ui-label text-app-muted">{label}</p>
    <p className="mt-2 text-h3">{value}</p>
  </div>
);

const ActivityBars = ({ items }) => {
  if (!items?.length) {
    return <div className="empty-state py-12">No activity yet.</div>;
  }

  const maxValue = Math.max(
    1,
    ...items.map((item) => item.offers + item.collaborations + item.messages + item.transfers)
  );

  return (
    <div className="grid min-h-[260px] grid-cols-7 items-end gap-2">
      {items.map((item) => {
        const total = item.offers + item.collaborations + item.messages + item.transfers;
        const height = Math.max(8, Math.round((total / maxValue) * 190));
        return (
          <div key={item.date} className="flex min-w-0 flex-col items-center gap-2">
            <div className="flex h-[200px] w-full items-end rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              <div
                className="w-full rounded-md bg-primary-600 transition-all dark:bg-primary-400"
                style={{ height }}
                title={`${total} events`}
              />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-app-strong">{total}</p>
              <p className="text-[11px] text-app-muted">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DonutStatus = ({ title, icon: Icon, items }) => {
  const normalizedItems = (items || []).filter((item) => Number(item.value) > 0);
  const total = normalizedItems.reduce((sum, item) => sum + Number(item.value || 0), 0);
  let cursor = 0;
  const gradient = normalizedItems.length
    ? normalizedItems.map((item, index) => {
        const start = cursor;
        const next = cursor + (Number(item.value) / total) * 100;
        cursor = next;
        return `${chartColors[index % chartColors.length]} ${start}% ${next}%`;
      }).join(", ")
    : "#E2E8F0 0% 100%";

  return (
    <div className="surface-card space-y-4">
      <div className="flex items-center gap-2">
        <Icon size={18} className="tone-accent" />
        <h2>{title}</h2>
      </div>
      <div className="flex items-center gap-5">
        <div
          className="grid h-28 w-28 flex-shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-center shadow-sm dark:bg-slate-900">
            <PieChart size={18} className="mx-auto tone-accent" />
            <span className="text-xs font-semibold">{total}</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {(items || []).map((item, index) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-app-muted">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                />
                <span className="truncate">{statusLabel(item.label)}</span>
              </span>
              <span className="font-semibold text-app-strong">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MiniCard = ({ icon: Icon, label, value }) => (
  <div className="metric-card">
    <div className="flex items-center gap-2 text-app-muted">
      <Icon size={16} />
      <p className="text-sm">{label}</p>
    </div>
    <p className="mt-3 text-h2">{value}</p>
  </div>
);

export default Dashboard;
