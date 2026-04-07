import React, { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { MessageCircleMore } from "lucide-react";

const ChatsList = () => {
  const { chats, selectedUser, setSelectedUser, getAllChatPartners, onlineUserIds } = useChatStore();

  useEffect(() => {
    getAllChatPartners();
  }, [getAllChatPartners]);

  if (!chats.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
        <MessageCircleMore className="size-6" />
        <p className="text-sm">No active chats yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => {
        const isSelected = selectedUser?._id === chat._id;
        const isOnline = onlineUserIds.includes(chat._id);

        return (
          <button
            key={chat._id}
            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
              isSelected
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-slate-700 bg-slate-800/30 hover:border-slate-500"
            }`}
            onClick={() => setSelectedUser(chat)}
          >
            <div className="relative">
              {chat.profilePic ? (
                <img src={chat.profilePic} alt={chat.fullname} className="size-10 rounded-full object-cover" />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-slate-700 text-slate-200">
                  {chat.fullname?.[0] || "U"}
                </div>
              )}
              <span
                className={`absolute bottom-0 right-0 size-2.5 rounded-full border border-slate-900 ${
                  isOnline ? "bg-emerald-400" : "bg-slate-500"
                }`}
              />
            </div>
            <div>
              <p className="font-medium text-slate-100">{chat.fullname}</p>
              <p className="text-xs text-slate-400">@{chat.username || "member"}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChatsList;