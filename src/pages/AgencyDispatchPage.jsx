import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, UserRound } from "lucide-react";

import {
  getChildUsers,
  GetInternalAssignmentRules,
  GetInternalPerformance,
  GetMySourceConnections,
  SaveInternalAssignmentRule,
} from "../api/auth";
import { useToast } from "../context/ToastContext";

const labelForRule = (rule) => {
  if (rule.assignment_type === "SOURCE") {
    return `Source complete - ${rule.source_connection_id}`;
  }
  if (rule.assignment_type === "PRODUCT") {
    return `Produit ${rule.external_product_id} - source ${rule.source_connection_id}`;
  }
  return `Manuel - collaboration ${String(rule.collaboration_id).slice(0, 8)}`;
};

const userLabel = (user) =>
  [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || user.email || user.id;

const buildRuleKey = (rule) =>
  [
    rule.collaboration_id,
    rule.assignment_type,
    rule.source_connection_id || "",
    rule.external_product_id || "",
  ].join("|");

const AgencyDispatchPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [children, setChildren] = useState([]);
  const [marketplaceRules, setMarketplaceRules] = useState([]);
  const [internalRules, setInternalRules] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [selectedRuleKey, setSelectedRuleKey] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [childrenRes, sourceRes, internalRes, performanceRes] = await Promise.all([
        getChildUsers().catch(() => ({ data: [] })),
        GetMySourceConnections(),
        GetInternalAssignmentRules().catch(() => ({ data: [] })),
        GetInternalPerformance().catch(() => ({ data: { results: [] } })),
      ]);
      const activeChildren = (childrenRes.data || []).filter((child) => child.is_active);
      const rules = sourceRes.data?.assignment_rules || [];
      setChildren(activeChildren);
      setMarketplaceRules(rules);
      setInternalRules(Array.isArray(internalRes.data) ? internalRes.data : []);
      setPerformance(performanceRes.data?.results || []);
      setSelectedRuleKey((prev) => prev || (rules[0] ? buildRuleKey(rules[0]) : ""));
      setSelectedUserId((prev) => prev || (activeChildren[0]?.id || ""));
    } catch (error) {
      toast.error(error.response?.data?.detail || "Unable to load dispatch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedRule = useMemo(
    () => marketplaceRules.find((rule) => buildRuleKey(rule) === selectedRuleKey),
    [marketplaceRules, selectedRuleKey]
  );

  const selectedUser = useMemo(
    () => children.find((child) => String(child.id) === String(selectedUserId)),
    [children, selectedUserId]
  );

  const handleSave = async () => {
    if (!selectedRule || !selectedUser) {
      toast.error("Select a collaboration rule and an internal user.");
      return;
    }

    setSaving(true);
    try {
      await SaveInternalAssignmentRule({
        collaboration_id: selectedRule.collaboration_id,
        assignment_type: selectedRule.assignment_type,
        source_connection_id: selectedRule.source_connection_id || null,
        external_product_id: selectedRule.external_product_id || null,
        assigned_to_user_id: selectedUser.id,
        assigned_to_label: userLabel(selectedUser),
        priority: selectedRule.priority || 100,
        is_active: true,
        metadata: {
          integration_product_id: selectedRule.integration_product_id || null,
        },
      });
      toast.success("Internal assignment saved.");
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Unable to save internal assignment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell space-y-6 px-1 py-2">
      <header className="page-header-card">
        <p className="eyebrow">Agency operations</p>
        <h1 className="mt-4">Internal dispatch</h1>
        <p className="mt-3 max-w-2xl text-app-muted">
          Assign collaboration sources or products to internal users. Billing, commissions and invoices stay on the parent provider account.
        </p>
      </header>

      {loading ? (
        <div className="empty-state !p-6 inline-flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          Loading dispatch data...
        </div>
      ) : (
        <>
          <section className="surface-card space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-h3">Assign a rule</h2>
                <p className="text-sm text-app-muted">Use active marketplace collaboration rules as the source of truth.</p>
              </div>
              <button type="button" onClick={loadData} className="btn-secondary inline-flex items-center gap-2">
                <RefreshCw size={14} />
                Refresh
              </button>
            </div>

            {!marketplaceRules.length || !children.length ? (
              <div className="empty-state !p-6">
                {!marketplaceRules.length
                  ? "No active collaboration source/product rules yet."
                  : "No active child users available for dispatch."}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_auto]">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-app-strong">Source or product</span>
                  <select
                    value={selectedRuleKey}
                    onChange={(event) => setSelectedRuleKey(event.target.value)}
                    className="field-select"
                  >
                    {marketplaceRules.map((rule) => (
                      <option key={buildRuleKey(rule)} value={buildRuleKey(rule)}>
                        {labelForRule(rule)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-app-strong">Internal user</span>
                  <select
                    value={selectedUserId}
                    onChange={(event) => setSelectedUserId(event.target.value)}
                    className="field-select"
                  >
                    {children.map((child) => (
                      <option key={child.id} value={child.id}>
                        {userLabel(child)}
                      </option>
                    ))}
                  </select>
                </label>

                <button type="button" onClick={handleSave} disabled={saving} className="btn-primary self-end">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : "Assign"}
                </button>
              </div>
            )}
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="surface-card space-y-4">
              <h2 className="text-h3">Active internal rules</h2>
              {!internalRules.length ? (
                <div className="empty-state !p-6">No internal dispatch rules yet.</div>
              ) : (
                <div className="space-y-3">
                  {internalRules.map((rule) => (
                    <article key={rule.id} className="rounded-[var(--radius-lg)] border border-[var(--teqa-border)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="badge badge--active">{rule.assignment_type}</span>
                        <span className="text-xs text-app-muted">{rule.is_active ? "active" : "inactive"}</span>
                      </div>
                      <p className="mt-3 text-sm font-medium text-app-strong">{rule.assigned_to_label || rule.assigned_to_user_id}</p>
                      <p className="mt-1 text-xs text-app-muted">{rule.source_connection_id || "manual"} {rule.external_product_id ? `- ${rule.external_product_id}` : ""}</p>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="surface-card space-y-4">
              <h2 className="text-h3">Internal performance</h2>
              {!performance.length ? (
                <div className="empty-state !p-6">Performance will appear after internal users confirm orders.</div>
              ) : (
                <div className="space-y-3">
                  {performance.map((item) => (
                    <article key={item.assigned_to_user_id} className="rounded-[var(--radius-lg)] border border-[var(--teqa-border)] p-4">
                      <div className="flex items-center gap-3">
                        <UserRound size={18} className="tone-accent" />
                        <div>
                          <p className="text-sm font-medium text-app-strong">{item.assigned_to_label || item.assigned_to_user_id}</p>
                          <p className="text-xs text-app-muted">{item.active_rules} active rules</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <Metric label="Confirmed" value={item.confirmed_orders} />
                        <Metric label="Delivered" value={item.delivered_orders} />
                        <Metric label="Delivery" value={`${item.delivery_rate}%`} />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div className="rounded-[var(--radius-md)] bg-[var(--color-neutral-surface)] p-3">
    <CheckCircle2 size={14} className="mx-auto tone-accent" />
    <p className="mt-2 text-lg font-semibold text-app-strong">{value}</p>
    <p className="text-xs text-app-muted">{label}</p>
  </div>
);

export default AgencyDispatchPage;
