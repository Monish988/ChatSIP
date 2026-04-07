import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Paperclip, SendHorizonal, SmilePlus, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const toDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const MAX_TEXTAREA_HEIGHT = 220;
const QUICK_REACTIONS = ["👍", "❤️", "😂", "🔥", "🎉"];

const buildReactionSummary = (reactions = []) => {
  const reactionMap = new Map();
  reactions.forEach((reaction) => {
    const currentCount = reactionMap.get(reaction.emoji) || 0;
    reactionMap.set(reaction.emoji, currentCount + 1);
  });
  return Array.from(reactionMap.entries()).map(([emoji, count]) => ({ emoji, count }));
};

const ChatContainer = () => {
  const { authUser } = useAuthStore();
  const {
    selectedUser,
    messages,
    sendMessage,
    loadOlderMessages,
    hasMoreMessages,
    typingUserIds,
    startTyping,
    stopTyping,
    reactToMessage,
  } = useChatStore();

  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [activeReactionMenuFor, setActiveReactionMenuFor] = useState(null);
  const listRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [selectedUser?._id]);

  useEffect(() => {
    if (!listRef.current) return;
    const isNearBottom =
      listRef.current.scrollHeight - listRef.current.scrollTop - listRef.current.clientHeight < 140;
    if (isNearBottom) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const nextHeight = Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
  }, [draft]);

  const handleScroll = async () => {
    if (!listRef.current || !hasMoreMessages) return;
    if (listRef.current.scrollTop > 60) return;
    const oldHeight = listRef.current.scrollHeight;
    await loadOlderMessages();
    requestAnimationFrame(() => {
      if (!listRef.current) return;
      listRef.current.scrollTop = listRef.current.scrollHeight - oldHeight;
    });
  };

  const handleChange = (value) => {
    setDraft(value);
    startTyping();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() && !attachment) return;

    const payload = { text: draft.trim() };
    if (attachment) {
      payload[attachment.type === "image" ? "image" : "file"] = attachment.data;
    }

    await sendMessage(payload);
    setDraft("");
    setAttachment(null);
    stopTyping();

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.overflowY = "hidden";
    }
  };

  const onAttach = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      return;
    }

    const data = await toDataURL(file);
    setAttachment({
      data,
      name: file.name,
      type: isImage ? "image" : "pdf",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isTyping = typingUserIds.includes(selectedUser?._id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3">
        <div>
          <p className="font-semibold text-slate-100">{selectedUser?.fullname}</p>
          <p className="text-xs text-slate-400">@{selectedUser?.username || "member"}</p>
        </div>
      </div>

      <div ref={listRef} onScroll={handleScroll} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((message) => {
          const isMine = String(message.senderId) === String(authUser?._id);
          const reactionSummary = buildReactionSummary(message.reactions || []);

          return (
            <div key={message._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className="relative">
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 md:max-w-[70%] ${
                    isMine ? "bg-cyan-500/80 text-white" : "bg-slate-700/60 text-slate-100"
                  }`}
                >
                  {message.text ? (
                    <div className="prose prose-invert max-w-none text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
                    </div>
                  ) : null}

                  {message.image ? (
                    <img src={message.image} alt="attachment" className="mt-2 max-h-64 rounded-lg object-cover" />
                  ) : null}

                  {message.fileUrl && message.fileType === "pdf" ? (
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block rounded-lg bg-black/20 px-3 py-2 text-xs underline"
                    >
                      Open PDF attachment
                    </a>
                  ) : null}

                  <div className={`mt-1 text-[11px] ${isMine ? "text-cyan-100" : "text-slate-400"}`}>
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isMine ? (message.readAt ? "  ✓✓" : message.deliveredAt ? "  ✓✓" : "  ✓") : ""}
                  </div>
                </div>

                <div className={`mt-1 flex items-center gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                  {reactionSummary.map((reaction) => (
                    <button
                      key={`${message._id}-${reaction.emoji}`}
                      type="button"
                      onClick={() => reactToMessage(message._id, reaction.emoji)}
                      className="rounded-full border border-slate-600 bg-slate-800/70 px-2 py-0.5 text-xs text-slate-100"
                    >
                      {reaction.emoji} {reaction.count}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="rounded-full border border-slate-600 bg-slate-800/70 p-1 text-slate-200"
                    onClick={() =>
                      setActiveReactionMenuFor((current) => (current === message._id ? null : message._id))
                    }
                  >
                    <SmilePlus className="size-3.5" />
                  </button>
                </div>

                {activeReactionMenuFor === message._id ? (
                  <div className="absolute mt-1 flex gap-1 rounded-full border border-slate-700 bg-slate-900/95 p-1 shadow-lg">
                    {QUICK_REACTIONS.map((emoji) => (
                      <button
                        key={`${message._id}-${emoji}`}
                        type="button"
                        className="rounded-full px-1.5 py-1 text-sm hover:bg-slate-700"
                        onClick={() => {
                          reactToMessage(message._id, emoji);
                          setActiveReactionMenuFor(null);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
        {isTyping ? <p className="text-xs text-slate-400">{selectedUser?.fullname} is typing...</p> : null}
      </div>

      <form onSubmit={onSend} className="border-t border-slate-700/60 p-3">
        {attachment ? (
          <div className="mb-2 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-xs text-slate-200">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate">Attached: {attachment.name}</p>
              <button
                type="button"
                className="rounded p-1 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => setAttachment(null)}
              >
                <X className="size-3.5" />
              </button>
            </div>
            {attachment.type === "image" ? (
              <img src={attachment.data} alt={attachment.name} className="max-h-40 rounded-md object-cover" />
            ) : null}
          </div>
        ) : null}
        <div className="flex gap-2">
          <label className="flex cursor-pointer items-center justify-center rounded-xl border border-slate-700 bg-slate-800/40 px-3 text-slate-200 hover:border-slate-500">
            <Paperclip className="size-4" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={onAttach}
            />
          </label>
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            rows={1}
            placeholder="Write a message (Markdown supported)..."
            className="flex-1 resize-none overflow-hidden rounded-xl border border-slate-700 bg-slate-800/40 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-cyan-500 px-4 text-white transition hover:bg-cyan-600"
          >
            <SendHorizonal className="size-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatContainer;