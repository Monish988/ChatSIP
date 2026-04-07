import React from "react";
import { useChatStore } from "../store/useChatStore";

const ActiveTabSwitch = () => {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-700/40 p-1">
        <button
          className={`rounded-lg py-2 text-sm font-medium transition ${
            activeTab === "chats" ? "bg-cyan-500 text-white" : "text-slate-300 hover:bg-slate-700"
          }`}
          onClick={() => setActiveTab("chats")}
        >
          Chats
        </button>
        <button
          className={`rounded-lg py-2 text-sm font-medium transition ${
            activeTab === "contacts" ? "bg-cyan-500 text-white" : "text-slate-300 hover:bg-slate-700"
          }`}
          onClick={() => setActiveTab("contacts")}
        >
          Contacts
        </button>
      </div>
    </div>
  );
};

export default ActiveTabSwitch;