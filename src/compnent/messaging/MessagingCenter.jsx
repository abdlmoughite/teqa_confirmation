import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  Bell,
  Check,
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

const formatRelativeTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 1) return "Now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffMinutes < 1440) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffMinutes < 2880) return "Yesterday";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getCurrentParticipant = (user) => {
  if (!user) return { type: null, id: null };
  if (user.role === "STORE") return { type: "STORE", id: user.store?.id };
  if (user.role === "AGENCY_OWNER") return { type: "AGENCY_OWNER", id: user.agency?.id || user.agent?.agency };
  if (user.role === "AGENCY_AGENT") return { type: "AGENCY_AGENT", id: user.agent?.id };
  return { type: user.role, id: user.id };
};

const getConversationTitle = (conversation) => {
  const subject = conversation?.subject?.trim();
  if (subject) return subject;

  const offerTitle = conversation?.offer_details?.titre;
  if (offerTitle) return offerTitle;

  const displayName = conversation?.other_participant?.display_name;
  if (displayName) return displayName;

  return conversation?.other_participant?.label || "Conversation";
};

const getInitial = (conversation) =>
  getConversationTitle(conversation).trim().charAt(0).toUpperCase() || "M";

const tabs = [
  { key: "active", label: "Active", icon: MessageCircle },
  { key: "unread", label: "Unread", icon: Bell },
  { key: "archived", label: "Archived", icon: Archive },
];

const getParticipantName = (conversation) =>
  conversation?.other_participant?.display_name ||
  conversation?.other_participant?.label ||
  "User";

const getParticipantSubtitle = (conversation) =>
  conversation?.other_participant?.subtitle ||
  conversation?.other_participant?.type?.replaceAll("_", " ") ||
  "";

const getParticipantAvatar = (conversation) =>
  conversation?.other_participant?.avatar ||
  conversation?.other_participant?.profile?.logo ||
  conversation?.other_participant?.profile?.photo ||
  conversation?.other_participant?.profile?.avatar ||
  null;

const MessagingCenter = () => {
  const { user } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);
  const composerRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const currentParticipant = useMemo(() => getCurrentParticipant(user), [user]);
  const conversationId = searchParams.get("conversation_id");
  const receiverType = searchParams.get("receiver_type");
  const receiverId = searchParams.get("receiver_id");
  const collaborationId = searchParams.get("collaboration_id");
  const subject = searchParams.get("subject");

  const enrichConversationProfiles = useCallback(async (conversationList) => {
    const uniqueParticipants = new Map();

    conversationList.forEach((conversation) => {
      const participant = conversation.other_participant;
      if (participant?.type && participant?.id) {
        uniqueParticipants.set(`${participant.type}:${participant.id}`, participant);
      }
    });

    if (!uniqueParticipants.size) return conversationList;

    const resolvedEntries = await Promise.all(
      Array.from(uniqueParticipants.entries()).map(async ([key, participant]) => {
        try {
          const response = await resolvePublicEntity({
            type: participant.type,
            id: participant.id,
          });
          return [key, response.data];
        } catch {
          return [key, null];
        }
      })
    );

    const resolvedByKey = Object.fromEntries(resolvedEntries);

    return conversationList.map((conversation) => {
      const participant = conversation.other_participant;
      const resolved = participant?.type && participant?.id
        ? resolvedByKey[`${participant.type}:${participant.id}`]
        : null;

      if (!resolved) return conversation;

      return {
        ...conversation,
        other_participant: {
          ...participant,
          display_name: resolved.display_name,
          subtitle: resolved.subtitle,
          avatar: resolved.avatar,
          user: resolved.user,
          profile: resolved.profile,
        },
      };
    });
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== "unread") params.status = activeTab;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const [conversationRes, statsRes] = await Promise.all([
        activeTab === "unread" ? GetUnreadConversations() : GetConversations(params),
        GetConversationStats().catch(() => ({ data: null })),
      ]);

      const list = Array.isArray(conversationRes.data)
        ? conversationRes.data
        : conversationRes.data?.conversations || conversationRes.data?.results || [];

      const enrichedList = await enrichConversationProfiles(list);

      setConversations(enrichedList);
      if (statsRes.data?.success) setStats(statsRes.data);

      setSelectedConversation((previous) => {
        if (!previous) return previous;
        return enrichedList.find((item) => item.id === previous.id) || null;
      });
    } catch (error) {
      toast.error("Unable to load conversations");
    } finally {
      setLoading(false);
    }
  }, [activeTab, enrichConversationProfiles, searchTerm, toast]);

  const fetchMessages = useCallback(async (conversation) => {
    if (!conversation?.id) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    try {
      const response = await GetConversationMessages(conversation.id);
      const list = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setMessages(list);
      await MarkConversationRead(conversation.id).catch(() => null);
    } catch (error) {
      toast.error("Unable to load messages");
    } finally {
      setMessagesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const createFromParams = async () => {
      if (!receiverType || !receiverId) return;

      try {
        const response = await CreateConversation({
          receiver_type: receiverType,
          receiver_id: receiverId,
          subject: subject || undefined,
        });
        const conversation = response.data;

        if (collaborationId) {
          await InjectConversationCollaboration(conversation.id, {
            collaboration_id: collaborationId,
          }).catch(() => null);
        }

        setSelectedConversation(conversation);
        navigate(`/messages?conversation_id=${conversation.id}`, { replace: true });
        await fetchConversations();
      } catch (error) {
        toast.error("Unable to create conversation");
      }
    };

    createFromParams();
  }, [collaborationId, fetchConversations, navigate, receiverId, receiverType, subject, toast]);

  useEffect(() => {
    if (!conversationId || !conversations.length) return;
    const found = conversations.find((conversation) => conversation.id === conversationId);
    if (found && found.id !== selectedConversation?.id) setSelectedConversation(found);
  }, [conversationId, conversations, selectedConversation?.id]);

  useEffect(() => {
    fetchMessages(selectedConversation);
    setMenuOpen(false);
  }, [fetchMessages, selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const text = [
        getConversationTitle(conversation),
        getParticipantName(conversation),
        getParticipantSubtitle(conversation),
        conversation.other_participant?.label,
        conversation.last_message_preview,
      ].filter(Boolean).join(" ").toLowerCase();
      return text.includes(query);
    });
  }, [conversations, searchTerm]);

  const tabCounts = {
    active: stats?.active_count ?? 0,
    unread: stats?.unread_messages ?? 0,
    archived: stats?.archived_count ?? 0,
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    navigate(`/messages?conversation_id=${conversation.id}`);
  };

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
    } catch (error) {
      setDraft(body);
      toast.error("Unable to send message");
    } finally {
      setSending(false);
    }
  };

  const archiveSelected = async () => {
    if (!selectedConversation?.id) return;
    try {
      const response = await ArchiveConversation(selectedConversation.id);
      setSelectedConversation(response.data);
      setActiveTab("archived");
      toast.success("Conversation archived");
    } catch (error) {
      toast.error("Unable to archive conversation");
    }
  };

  const reopenSelected = async () => {
    if (!selectedConversation?.id) return;
    try {
      const response = await ReopenConversation(selectedConversation.id);
      setSelectedConversation(response.data);
      setActiveTab("active");
      toast.success("Conversation reopened");
    } catch (error) {
      toast.error("Unable to reopen conversation");
    }
  };

  const isMine = (message) => {
    const sameOwner =
      message.sender_type === currentParticipant.type &&
      String(message.sender_id) === String(currentParticipant.id);
    return sameOwner || String(message.sender_user_id) === String(user?.id);
  };

  const archived = selectedConversation?.status === "archived";

  return (
    <div className="h-[calc(100vh-8.5rem)] min-h-[620px] w-full overflow-hidden">
      <section className="grid h-full min-h-0 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-slate-200 dark:border-slate-800 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="min-w-0">
              <p className="eyebrow">Messaging</p>
              <h1 className="truncate text-xl font-semibold text-app-strong">Conversations</h1>
            </div>
            <button type="button" onClick={fetchConversations} className="icon-button" aria-label="Refresh conversations">
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="space-y-3 border-b border-slate-200 p-4 dark:border-slate-800">
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="field-input pl-9"
                placeholder="Search conversations"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-2 py-2 text-xs font-medium transition-all ${
                    activeTab === tab.key
                      ? "bg-primary-600 text-white dark:bg-primary-500"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <tab.icon size={14} className="mx-auto mb-1" />
                  {tab.label}
                  <span className="ml-1 opacity-80">{tabCounts[tab.key]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
            {loading ? (
              <LoadingState />
            ) : filteredConversations.length ? (
              filteredConversations.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => selectConversation(conversation)}
                />
              ))
            ) : (
              <EmptyList activeTab={activeTab} />
            )}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col bg-slate-50 dark:bg-slate-950">
          {!selectedConversation ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="max-w-sm text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
                  <Inbox size={28} />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-app-strong">Select a conversation</h2>
                <p className="mt-2 text-sm text-app-muted">
                  Pick a thread on the left to read messages, reply, archive, or reopen it.
                </p>
              </div>
            </div>
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

              <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
                {messagesLoading ? (
                  <LoadingState />
                ) : messages.length ? (
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        mine={isMine(message)}
                        conversation={selectedConversation}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="empty-state mx-auto mt-12 max-w-md">
                    <MessageCircle size={28} className="mx-auto mb-2 text-slate-400" />
                    No messages yet.
                  </div>
                )}
              </div>

              {archived ? (
                <div className="border-t border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                  This conversation is archived.
                  <button type="button" onClick={reopenSelected} className="ml-2 font-semibold underline">
                    Reopen to reply.
                  </button>
                </div>
              ) : (
                <div className="message-input-area">
                  <div className="flex items-end gap-3">
                    <textarea
                      ref={composerRef}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                      rows={1}
                      className="message-input min-h-12"
                      placeholder="Write a message..."
                    />
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={!draft.trim() || sending}
                      className="btn-primary h-12 w-12 p-0"
                      aria-label="Send message"
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </section>
    </div>
  );
};

const ConversationRow = ({ conversation, selected, onClick }) => {
  const unread = conversation.unread_count || 0;
  const title = getConversationTitle(conversation);
  const role = getParticipantSubtitle(conversation) || conversation.other_participant?.type || "User";
  const lastMessage = conversation.last_message_preview || "No messages yet";
  const avatar = getParticipantAvatar(conversation);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-2 flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all ${
        selected
          ? "bg-primary-50 text-primary-800 ring-1 ring-primary-200 dark:bg-primary-500/10 dark:text-primary-200 dark:ring-primary-500/30"
          : "hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      <div className="relative grid h-11 w-11 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-900 text-sm font-semibold text-white dark:bg-slate-700">
        {avatar ? (
          <img src={avatar} alt={title} className="h-full w-full object-cover" />
        ) : (
          getInitial(conversation)
        )}
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-app-strong">{title}</p>
          <span className="text-[11px] text-app-muted">
            {formatRelativeTime(conversation.last_message_at || conversation.updated_at || conversation.created_at)}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-app-muted">{lastMessage}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="badge badge--new">{role}</span>
          {conversation.status === "archived" ? <span className="badge badge--pending">Archived</span> : null}
        </div>
      </div>
    </button>
  );
};

const ConversationHeader = ({ conversation, menuOpen, setMenuOpen, onArchive, onReopen, onBack }) => {
  const archived = conversation.status === "archived";
  const avatar = getParticipantAvatar(conversation);
  const title = getConversationTitle(conversation);

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onBack} className="icon-button lg:hidden" aria-label="Back to conversations">
          <ChevronLeft size={18} />
        </button>
        <div className="grid h-11 w-11 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-600 text-sm font-semibold text-white">
          {avatar ? (
            <img src={avatar} alt={title} className="h-full w-full object-cover" />
          ) : (
            getInitial(conversation)
          )}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-app-strong">{title}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-app-muted">
            <span className="inline-flex items-center gap-1">
              <UserRound size={12} />
              {getParticipantSubtitle(conversation) || getParticipantName(conversation)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {formatRelativeTime(conversation.last_message_at || conversation.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="relative">
        <button type="button" onClick={() => setMenuOpen((value) => !value)} className="icon-button" aria-label="Conversation actions">
          <MoreHorizontal size={18} />
        </button>
        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              {conversation.collaboration_details?.id ? (
                <Link
                  to={`/collaboration/${conversation.collaboration_details.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Handshake size={15} />
                  View collaboration
                </Link>
              ) : null}
              {archived ? (
                <button type="button" onClick={onReopen} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                  <ArchiveRestore size={15} />
                  Reopen conversation
                </button>
              ) : (
                <button type="button" onClick={onArchive} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Archive size={15} />
                  Archive conversation
                </button>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, mine, conversation }) => {
  const injected = message.message_type === "collaboration_injection";

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className={`message-bubble ${mine ? "sent" : "received"}`}>
        {injected ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase opacity-80">
              <Handshake size={14} />
              Collaboration
            </div>
            <p className="font-semibold">{message.metadata?.offer_title || message.body}</p>
            <div className="flex flex-wrap gap-2 text-xs opacity-80">
              {message.metadata?.status ? <span>{message.metadata.status}</span> : null}
              {message.metadata?.price_finale ? (
                <span>{message.metadata.price_finale} {message.metadata?.currency || "MAD"}</span>
              ) : null}
            </div>
            {message.metadata?.collaboration_id ? (
              <Link to={`/collaboration/${message.metadata.collaboration_id}`} className="inline-flex text-xs font-semibold underline">
                Open collaboration
              </Link>
            ) : null}
          </div>
        ) : (
          <p className="whitespace-pre-wrap break-words">{message.body}</p>
        )}
        <div className="message-meta">
          {!mine ? <span>{getParticipantName(conversation) || message.sender_label}</span> : null}
          <span>{formatRelativeTime(message.created_at)}</span>
          {mine ? <Check size={13} /> : null}
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center gap-2 py-12 text-app-muted">
    <Loader2 size={20} className="animate-spin" />
    Loading...
  </div>
);

const EmptyList = ({ activeTab }) => {
  const copy = {
    active: "No active conversations.",
    unread: "No unread messages.",
    archived: "No archived conversations.",
  };

  return (
    <div className="empty-state m-3">
      <XCircle size={24} className="mx-auto mb-2 text-slate-400" />
      {copy[activeTab] || "No conversations."}
    </div>
  );
};

export default MessagingCenter;
