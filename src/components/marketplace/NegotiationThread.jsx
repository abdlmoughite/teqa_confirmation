import { useEffect, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { clsx } from "clsx";

import { GetCollaborationThread } from "../../api/auth";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Skeleton from "../ui/Skeleton";

const NegotiationThread = ({ collaborationId, messages = [], currentUserId, onSend }) => {
  const [thread, setThread] = useState(messages);
  const [loading, setLoading] = useState(Boolean(collaborationId) && messages.length === 0);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!collaborationId || messages.length) return;

    let cancelled = false;
    const loadThread = async () => {
      setLoading(true);
      try {
        const response = await GetCollaborationThread(collaborationId);
        if (!cancelled) setThread(response.data?.thread || response.data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadThread();
    return () => {
      cancelled = true;
    };
  }, [collaborationId, messages.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    await onSend?.(body);
  };

  return (
    <section className="teqa-thread">
      <div className="teqa-thread__messages">
        {loading ? (
          <Skeleton className="h-14" count={4} />
        ) : (
          thread.map((message, index) => (
            <ThreadMessage key={message.id || index} message={message} mine={isMine(message, currentUserId)} />
          ))
        )}
      </div>

      <form className="teqa-thread__footer" onSubmit={handleSubmit}>
        <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ecrire une contre-offre ou un message" />
        <Button type="submit" size="icon" aria-label="Envoyer">
          <Send size={17} />
        </Button>
      </form>
    </section>
  );
};

const ThreadMessage = ({ message, mine }) => {
  const acceptedPrice = message.accepted_price || message.price_finale || message.acceptedPrice;
  const role = message.role || message.created_by_role || (mine ? "Moi" : "Autre partie");

  return (
    <div className={clsx("teqa-thread-message", mine && "mine")}>
      <span className="teqa-thread-message__role">{role}</span>
      <div className={clsx("teqa-thread-message__bubble", mine ? "mine" : "other")}>
        {message.type === "accepted" || message.status === "accepted" ? (
          <span className="teqa-thread-message__accepted">
            <CheckCircle2 size={16} />
            Accepte a {acceptedPrice} MAD
          </span>
        ) : (
          message.body || message.message || message.text
        )}
      </div>
    </div>
  );
};

const isMine = (message, currentUserId) => {
  if (message.mine !== undefined) return Boolean(message.mine);
  if (!currentUserId) return false;
  return String(message.user_id || message.created_by_user_id || message.sender_id) === String(currentUserId);
};

export default NegotiationThread;
