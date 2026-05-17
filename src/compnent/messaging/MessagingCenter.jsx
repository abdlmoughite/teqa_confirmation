import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  Bell,
  Check,
  CheckCheck,
  ChevronLeft,
  Clock,
  Handshake,
  Inbox,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  ArchiveConversation,
  CreateConversation,
  GetConversationMessages,
  GetConversationStats,
  GetConversations,
  GetUnreadConversations,
  InjectConversationCollaboration,
  MarkConversationRead,
  ReopenConversation,
  resolvePublicEntity,
  SendConversationMessage,
} from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

const formatRelativeTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 1)    return "Now";
  if (diffMinutes < 60)   return `${diffMinutes}m`;
  if (diffMinutes < 1440) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffMinutes < 2880) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getCurrentParticipant = (user) => {
  if (!user) return { type: null, id: null };
  if (user.role === "STORE")        return { type: "STORE",        id: user.store?.id };
  if (user.role === "AGENCY_OWNER") return { type: "AGENCY_OWNER", id: user.agency?.id || user.agent?.agency };
  if (user.role === "AGENCY_AGENT") return { type: "AGENCY_AGENT", id: user.agent?.id };
  return { type: user.role, id: user.id };
};

const getConversationTitle = (c) => {
  const subject = c?.subject?.trim();
  if (subject) return subject;
  const offerTitle = c?.offer_details?.titre;
  if (offerTitle) return offerTitle;
  const displayName = c?.other_participant?.display_name;
  if (displayName) return displayName;
  return c?.other_participant?.label || "Conversation";
};

const getInitial = (c) =>
  getConversationTitle(c).trim().charAt(0).toUpperCase() || "M";

const getParticipantName     = (c) => c?.other_participant?.display_name || c?.other_participant?.label || "User";
const getParticipantSubtitle = (c) => c?.other_participant?.subtitle || c?.other_participant?.type?.replaceAll("_", " ") || "";
const getParticipantAvatar   = (c) =>
  c?.other_participant?.avatar ||
  c?.other_participant?.profile?.logo ||
  c?.other_participant?.profile?.photo ||
  c?.other_participant?.profile?.avatar ||
  null;

const tabs = [
  { key: "active",   label: "Active",   icon: MessageCircle },
  { key: "unread",   label: "Unread",   icon: Bell          },
  { key: "archived", label: "Archived", icon: Archive       },
];

/* ─────────────────────────────────────────────────────────────
   STYLES (TEQA tokens — évite les classes Tailwind couleurs)
───────────────────────────────────────────────────────────── */

const S = {
  /* Shell */
  shell: {
    display: "flex",
    height: "100%",
    width: "100%",
    overflow: "hidden",
    borderRadius: 14,
    border: "0.5px solid var(--teqa-border)",
    background: "var(--teqa-surface)",
  },
  /* Sidebar */
  sidebar: {
    display: "flex",
    flexDirection: "column",
    width: 300,
    flexShrink: 0,
    borderRight: "0.5px solid var(--teqa-border)",
    background: "var(--teqa-sidebar)",
    overflow: "hidden",
  },
  /* Sidebar header */
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 16px",
    borderBottom: "0.5px solid var(--teqa-border)",
  },
  /* Main */
  main: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    overflow: "hidden",
    background: "var(--teqa-bg)",
  },
  /* Conversation header */
  convHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "12px 16px",
    borderBottom: "0.5px solid var(--teqa-border)",
    background: "var(--teqa-surface)",
    flexShrink: 0,
  },
  /* Messages area */
  messagesArea: {
    flex: 1,
    overflowY: "auto",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  /* Input area */
  inputArea: {
    borderTop: "0.5px solid var(--teqa-border)",
    background: "var(--teqa-surface)",
    padding: "12px 14px",
  },
  /* Avatar */
  avatar: (size = 40) => ({
    width: size,
    height: size,
    borderRadius: 10,
    background: "var(--teqa-green-dim)",
    border: "0.5px solid rgba(34,197,94,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--teqa-green)",
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: size * 0.35,
    flexShrink: 0,
    overflow: "hidden",
    position: "relative",
  }),
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */

const MessagingCenter = () => {
  const { user } = useContext(AuthContext);
  const toast     = useToast();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  const composerRef    = useRef(null);

  const [conversations,       setConversations]       = useState([]);
  const [messages,            setMessages]            = useState([]);
  const [selectedConversation,setSelectedConversation]= useState(null);
  const [stats,               setStats]               = useState(null);
  const [activeTab,           setActiveTab]           = useState("active");
  const [searchTerm,          setSearchTerm]          = useState("");
  const [loading,             setLoading]             = useState(true);
  const [messagesLoading,     setMessagesLoading]     = useState(false);
  const [sending,             setSending]             = useState(false);
  const [draft,               setDraft]               = useState("");
  const [menuOpen,            setMenuOpen]            = useState(false);

  const currentParticipant = useMemo(() => getCurrentParticipant(user), [user]);
  const conversationId  = searchParams.get("conversation_id");
  const receiverType    = searchParams.get("receiver_type");
  const receiverId      = searchParams.get("receiver_id");
  const collaborationId = searchParams.get("collaboration_id");
  const subject         = searchParams.get("subject");

  /* ---------- data ---------- */

  const enrichConversationProfiles = useCallback(async (list) => {
    const uniqueParticipants = new Map();
    list.forEach((c) => {
      const p = c.other_participant;
      if (p?.type && p?.id) uniqueParticipants.set(`${p.type}:${p.id}`, p);
    });
    if (!uniqueParticipants.size) return list;

    const resolved = await Promise.all(
      Array.from(uniqueParticipants.entries()).map(async ([key, p]) => {
        try {
          const res = await resolvePublicEntity({ type: p.type, id: p.id });
          return [key, res.data];
        } catch { return [key, null]; }
      })
    );
    const resolvedByKey = Object.fromEntries(resolved);

    return list.map((c) => {
      const p  = c.other_participant;
      const r  = p?.type && p?.id ? resolvedByKey[`${p.type}:${p.id}`] : null;
      if (!r) return c;
      return { ...c, other_participant: { ...p, display_name: r.display_name, subtitle: r.subtitle, avatar: r.avatar, user: r.user, profile: r.profile } };
    });
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== "unread") params.status = activeTab;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [convRes, statsRes] = await Promise.all([
        activeTab === "unread" ? GetUnreadConversations() : GetConversations(params),
        GetConversationStats().catch(() => ({ data: null })),
      ]);

      const list = Array.isArray(convRes.data)
        ? convRes.data
        : convRes.data?.conversations || convRes.data?.results || [];

      const enrichedList = await enrichConversationProfiles(list);
      setConversations(enrichedList);
      if (statsRes.data?.success) setStats(statsRes.data);
      setSelectedConversation((prev) => {
        if (!prev) return prev;
        return enrichedList.find((c) => c.id === prev.id) || null;
      });
    } catch {
      toast.error("Unable to load conversations");
    } finally {
      setLoading(false);
    }
  }, [activeTab, enrichConversationProfiles, searchTerm, toast]);

  const fetchMessages = useCallback(async (conversation) => {
    if (!conversation?.id) { setMessages([]); return; }
    setMessagesLoading(true);
    try {
      const res  = await GetConversationMessages(conversation.id);
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setMessages(list);
      await MarkConversationRead(conversation.id).catch(() => null);
    } catch {
      toast.error("Unable to load messages");
    } finally {
      setMessagesLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    const createFromParams = async () => {
      if (!receiverType || !receiverId) return;
      try {
        const res = await CreateConversation({ receiver_type: receiverType, receiver_id: receiverId, subject: subject || undefined });
        const conv = res.data;
        if (collaborationId) await InjectConversationCollaboration(conv.id, { collaboration_id: collaborationId }).catch(() => null);
        setSelectedConversation(conv);
        navigate(`/messages?conversation_id=${conv.id}`, { replace: true });
        await fetchConversations();
      } catch { toast.error("Unable to create conversation"); }
    };
    createFromParams();
  }, [collaborationId, fetchConversations, navigate, receiverId, receiverType, subject, toast]);

  useEffect(() => {
    if (!conversationId || !conversations.length) return;
    const found = conversations.find((c) => c.id === conversationId);
    if (found && found.id !== selectedConversation?.id) setSelectedConversation(found);
  }, [conversationId, conversations, selectedConversation?.id]);

  useEffect(() => { fetchMessages(selectedConversation); setMenuOpen(false); }, [fetchMessages, selectedConversation]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);

  const filteredConversations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((c) => {
      const text = [getConversationTitle(c), getParticipantName(c), getParticipantSubtitle(c), c.other_participant?.label, c.last_message_preview]
        .filter(Boolean).join(" ").toLowerCase();
      return text.includes(query);
    });
  }, [conversations, searchTerm]);

  const tabCounts = { active: stats?.active_count ?? 0, unread: stats?.unread_messages ?? 0, archived: stats?.archived_count ?? 0 };

  const selectConversation = (c) => { setSelectedConversation(c); navigate(`/messages?conversation_id=${c.id}`); };

  const sendMessage = async () => {
    const body = draft.trim();
    if (!body || !selectedConversation || sending) return;
    setSending(true);
    setDraft("");
    try {
      await SendConversationMessage(selectedConversation.id, { body });
      await fetchMessages(selectedConversation);
      await fetchConversations();
      composerRef.current?.focus();
    } catch { setDraft(body); toast.error("Unable to send message"); }
    finally { setSending(false); }
  };

  const archiveSelected = async () => {
    if (!selectedConversation?.id) return;
    try { const res = await ArchiveConversation(selectedConversation.id); setSelectedConversation(res.data); setActiveTab("archived"); toast.success("Conversation archived"); }
    catch { toast.error("Unable to archive conversation"); }
  };

  const reopenSelected = async () => {
    if (!selectedConversation?.id) return;
    try { const res = await ReopenConversation(selectedConversation.id); setSelectedConversation(res.data); setActiveTab("active"); toast.success("Conversation reopened"); }
    catch { toast.error("Unable to reopen conversation"); }
  };

  const isMine = (msg) =>
    (msg.sender_type === currentParticipant.type && String(msg.sender_id) === String(currentParticipant.id)) ||
    String(msg.sender_user_id) === String(user?.id);

  const archived = selectedConversation?.status === "archived";

  /* ---------- render ---------- */

  return (
    <div style={{ height: "100vh", maxHeight: "100vh", background: "var(--teqa-bg)", padding: 16, overflow: "hidden" }}>
      <div style={S.shell}>

        {/* ── SIDEBAR ── */}
        <aside style={S.sidebar}>

          {/* Sidebar header */}
          <div style={S.sidebarHeader}>
            <div>
              <p className="text-label" style={{ marginBottom: 2 }}>Messaging</p>
              <h1 style={{ fontSize: 18, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--teqa-text)", margin: 0 }}>
                Conversations
              </h1>
            </div>
            <button
              onClick={fetchConversations}
              className="icon-button"
              title="Refresh"
            >
              <RefreshCw size={15} style={{ color: loading ? "var(--teqa-green)" : "var(--teqa-hint)" }} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: "12px 14px", borderBottom: "0.5px solid var(--teqa-border)" }}>
            <div style={{ position: "relative", marginBottom: 10 }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--teqa-hint)", pointerEvents: "none" }} />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations…"
                style={{ paddingLeft: 36, width: "100%", padding: "9px 12px 9px 36px" }}
                className="teqa-input"
              />
            </div>

            {/* Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4 }}>
              {tabs.map((tab) => {
                const active = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      padding: "8px 4px",
                      borderRadius: 8,
                      border: "0.5px solid",
                      borderColor: active ? "rgba(34,197,94,0.3)" : "var(--teqa-border)",
                      background: active ? "var(--teqa-green-dim)" : "transparent",
                      color: active ? "var(--teqa-green)" : "var(--teqa-muted)",
                      fontSize: 11,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <tab.icon size={14} />
                    <span>{tab.label}</span>
                    {tabCounts[tab.key] > 0 && (
                      <span style={{
                        fontSize: 10,
                        background: active ? "var(--teqa-green)" : "var(--teqa-surface3)",
                        color: active ? "#fff" : "var(--teqa-muted)",
                        borderRadius: 20,
                        padding: "1px 6px",
                        fontWeight: 600,
                      }}>
                        {tabCounts[tab.key]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px" }} className="app-scrollbar">
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                <Loader2 size={22} style={{ color: "var(--teqa-green)" }} className="animate-spin" />
              </div>
            ) : filteredConversations.length ? (
              filteredConversations.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conversation={conv}
                  selected={selectedConversation?.id === conv.id}
                  onClick={() => selectConversation(conv)}
                />
              ))
            ) : (
              <EmptyList activeTab={activeTab} />
            )}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={S.main}>
          {!selectedConversation ? (
            <EmptyInbox />
          ) : (
            <>
              <ConversationHeader
                conversation={selectedConversation}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                onArchive={archiveSelected}
                onReopen={reopenSelected}
                onBack={() => setSelectedConversation(null)}
              />

              {/* Messages */}
              <div style={S.messagesArea} className="app-scrollbar">
                {messagesLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
                    <Loader2 size={22} style={{ color: "var(--teqa-green)" }} className="animate-spin" />
                  </div>
                ) : messages.length ? (
                  <>
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} mine={isMine(msg)} conversation={selectedConversation} />
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <EmptyMessages />
                )}
              </div>

              {/* Input */}
              {archived ? (
                <ArchivedBanner onReopen={reopenSelected} />
              ) : (
                <MessageComposer
                  ref={composerRef}
                  draft={draft}
                  setDraft={setDraft}
                  sending={sending}
                  onSend={sendMessage}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   CONVERSATION ROW
───────────────────────────────────────────────────────────── */

const ConversationRow = ({ conversation, selected, onClick }) => {
  const unread      = conversation.unread_count || 0;
  const title       = getConversationTitle(conversation);
  const role        = getParticipantSubtitle(conversation) || conversation.other_participant?.type || "User";
  const lastMessage = conversation.last_message_preview || "No messages yet";
  const avatar      = getParticipantAvatar(conversation);
  const isArchived  = conversation.status === "archived";

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        borderRadius: 10,
        padding: "10px 10px",
        textAlign: "left",
        border: "0.5px solid",
        borderColor: selected ? "rgba(34,197,94,0.3)" : "transparent",
        background: selected ? "var(--teqa-green-dim)" : "transparent",
        cursor: "pointer",
        transition: "all 0.15s",
        marginBottom: 3,
        display: "block",
      }}
      onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.background = "var(--teqa-surface2)"; e.currentTarget.style.borderColor = "var(--teqa-border)"; } }}
      onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

        {/* Avatar */}
        <div style={{ ...S.avatar(38), position: "relative" }}>
          {avatar ? (
            <img src={avatar} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
          ) : (
            getInitial(conversation)
          )}
          {unread > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              background: "var(--teqa-red)",
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              borderRadius: 20,
              minWidth: 16, height: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px",
            }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 3 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: selected ? "var(--teqa-green)" : "var(--teqa-text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {title}
            </p>
            <span style={{ fontSize: 10, color: "var(--teqa-hint)", flexShrink: 0 }}>
              {formatRelativeTime(conversation.last_message_at || conversation.updated_at || conversation.created_at)}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "var(--teqa-muted)", margin: "0 0 5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {lastMessage}
          </p>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              borderRadius: 20, padding: "2px 7px",
              background: "var(--teqa-surface3)",
              color: "var(--teqa-muted)",
              fontSize: 10, fontWeight: 500,
            }}>
              <UserRound size={9} />{role}
            </span>
            {isArchived && (
              <span className="badge badge-neutral" style={{ padding: "2px 7px", fontSize: 10 }}>
                <Archive size={9} /> Archived
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

/* ─────────────────────────────────────────────────────────────
   CONVERSATION HEADER
───────────────────────────────────────────────────────────── */

const ConversationHeader = ({ conversation, menuOpen, setMenuOpen, onArchive, onReopen, onBack }) => {
  const archived = conversation.status === "archived";
  const avatar   = getParticipantAvatar(conversation);
  const title    = getConversationTitle(conversation);

  return (
    <div style={S.convHeader}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <button onClick={onBack} className="icon-button" style={{ display: "none" /* shown via CSS on mobile */ }}>
          <ChevronLeft size={16} />
        </button>

        <div style={S.avatar(38)}>
          {avatar
            ? <img src={avatar} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
            : getInitial(conversation)
          }
        </div>

        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--teqa-text)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
            <span style={{ fontSize: 11, color: "var(--teqa-muted)", display: "flex", alignItems: "center", gap: 4 }}>
              <UserRound size={11} />
              {getParticipantSubtitle(conversation) || getParticipantName(conversation)}
            </span>
            <span style={{ fontSize: 11, color: "var(--teqa-hint)", display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={11} />
              {formatRelativeTime(conversation.last_message_at || conversation.created_at)}
            </span>
            {archived && <span className="badge badge-neutral" style={{ fontSize: 10, padding: "1px 7px" }}>Archived</span>}
          </div>
        </div>
      </div>

      {/* Actions menu */}
      <div style={{ position: "relative" }}>
        <button onClick={() => setMenuOpen(!menuOpen)} className="icon-button">
          <MoreHorizontal size={16} />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "absolute", right: 0, top: 46,
                zIndex: 20, width: 220,
                background: "var(--teqa-surface)",
                border: "0.5px solid var(--teqa-border-md)",
                borderRadius: 12,
                padding: 6,
                boxShadow: "var(--shadow-md)",
              }}
            >
              {conversation.collaboration_details?.id && (
                <Link
                  to={`/collaboration/${conversation.collaboration_details.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 10px", borderRadius: 8,
                    fontSize: 13, color: "var(--teqa-text)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--teqa-surface2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <Handshake size={14} style={{ color: "var(--teqa-green)" }} />
                  View collaboration
                </Link>
              )}

              {archived ? (
                <button
                  onClick={onReopen}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, width: "100%", fontSize: 13, color: "var(--teqa-text)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--teqa-surface2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <ArchiveRestore size={14} style={{ color: "var(--teqa-green)" }} />
                  Reopen conversation
                </button>
              ) : (
                <button
                  onClick={onArchive}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, width: "100%", fontSize: 13, color: "var(--teqa-text)", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--teqa-surface2)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <Archive size={14} style={{ color: "var(--teqa-muted)" }} />
                  Archive conversation
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
───────────────────────────────────────────────────────────── */

const MessageBubble = ({ message, mine, conversation }) => {
  const injected = message.message_type === "collaboration_injection";

  return (
    <div
      style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}
      className="teqa-fade-in"
    >
      <div style={{
        maxWidth: "72%",
        padding: "10px 14px",
        borderRadius: mine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
        background: mine ? "var(--teqa-green)" : "var(--teqa-surface)",
        border: mine ? "none" : "0.5px solid var(--teqa-border)",
        color: mine ? "var(--teqa-on-brand)" : "var(--teqa-text)",
      }}>

        {injected ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", opacity: 0.75 }}>
              <Handshake size={11} />
              Collaboration
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>
              {message.metadata?.offer_title || message.body}
            </p>
            <div style={{ display: "flex", gap: 8, fontSize: 11, opacity: 0.8 }}>
              {message.metadata?.status && (
                <span className={`badge badge-${message.metadata.status === "active" ? "green" : "neutral"}`} style={{ fontSize: 10 }}>
                  {message.metadata.status}
                </span>
              )}
              {message.metadata?.price_finale && (
                <span style={{ fontWeight: 600 }}>
                  {message.metadata.price_finale} {message.metadata?.currency || "MAD"}
                </span>
              )}
            </div>
            {message.metadata?.collaboration_id && (
              <Link
                to={`/collaboration/${message.metadata.collaboration_id}`}
                style={{ fontSize: 12, fontWeight: 600, color: mine ? "rgba(255,255,255,0.9)" : "var(--teqa-green)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                Open collaboration →
              </Link>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-words" }}>
            {message.body}
          </p>
        )}

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 6, fontSize: 10, color: mine ? "rgba(255,255,255,0.55)" : "var(--teqa-hint)" }}>
          {!mine && <span>{getParticipantName(conversation) || message.sender_label}</span>}
          <span>{formatRelativeTime(message.created_at)}</span>
          {mine && <CheckCheck size={11} />}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MESSAGE COMPOSER
───────────────────────────────────────────────────────────── */

const MessageComposer = ({ draft, setDraft, sending, onSend, ref }) => (
  <div style={S.inputArea}>
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
      <textarea
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
        rows={1}
        placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
        style={{
          flex: 1,
          resize: "none",
          background: "var(--teqa-bg)",
          border: "0.5px solid var(--teqa-border-md)",
          borderRadius: 10,
          padding: "10px 14px",
          fontSize: 14,
          color: "var(--teqa-text)",
          fontFamily: "var(--font-body)",
          outline: "none",
          minHeight: 42,
          maxHeight: 120,
        }}
        onFocus={(e) => { e.target.style.borderColor = "var(--teqa-green)"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.15)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "var(--teqa-border-md)"; e.target.style.boxShadow = "none"; }}
      />
      <button
        onClick={onSend}
        disabled={!draft.trim() || sending}
        style={{
          width: 42, height: 42,
          borderRadius: 10,
          background: draft.trim() && !sending ? "var(--teqa-green)" : "var(--teqa-surface3)",
          border: "none",
          color: draft.trim() && !sending ? "#fff" : "var(--teqa-hint)",
          cursor: draft.trim() && !sending ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
      </button>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   EMPTY STATES
───────────────────────────────────────────────────────────── */

const EmptyInbox = () => (
  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
    <div style={{ width: 56, height: 56, borderRadius: 14, background: "var(--teqa-green-dim)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Inbox size={26} style={{ color: "var(--teqa-green)" }} />
    </div>
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--teqa-text)", margin: "0 0 4px" }}>Select a conversation</p>
      <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: 0 }}>Choose a thread to start messaging</p>
    </div>
  </div>
);

const EmptyMessages = () => (
  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
    <MessageCircle size={28} style={{ color: "var(--teqa-hint)" }} />
    <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: 0 }}>No messages yet</p>
    <p style={{ fontSize: 12, color: "var(--teqa-hint)", margin: 0 }}>Send the first message to start the conversation</p>
  </div>
);

const EmptyList = ({ activeTab }) => {
  const config = {
    active:   { message: "No active conversations", icon: MessageCircle },
    unread:   { message: "No unread messages",       icon: Bell          },
    archived: { message: "No archived conversations",icon: Archive       },
  };
  const { message, icon: Icon } = config[activeTab] || config.active;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px", textAlign: "center", gap: 8 }}>
      <Icon size={22} style={{ color: "var(--teqa-hint)" }} />
      <p style={{ fontSize: 13, color: "var(--teqa-muted)", margin: 0 }}>{message}</p>
    </div>
  );
};

const ArchivedBanner = ({ onReopen }) => (
  <div style={{ borderTop: "0.5px solid var(--teqa-border)", background: "rgba(245,158,11,0.08)", padding: "12px 16px", textAlign: "center" }}>
    <p style={{ fontSize: 13, color: "var(--teqa-warning)", margin: 0 }}>
      This conversation is archived.{" "}
      <button
        onClick={onReopen}
        style={{ fontWeight: 600, color: "var(--teqa-warning)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontSize: 13 }}
      >
        Reopen to reply
      </button>
    </p>
  </div>
);

export default MessagingCenter;