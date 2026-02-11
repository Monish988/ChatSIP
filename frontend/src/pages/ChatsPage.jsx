import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import AnimatedBorderContainer from "../components/AnimatedBorderContainer";
import { useChatStore } from "../store/useChatStore";
import ChatContainer from "../components/ChatContainer";
import NoConvoPlaceHolder from "../components/NoConvoPlaceHolder";
import ChatsList from "../components/ChatsList";
import ContactsList from "../components/ContactsList";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";

const ChatsPage = () => {
  const {activeTab,selectedUser} = useChatStore();

  return (
    <div className="relative w-full max-w-6xl h-[800px]">
      <AnimatedBorderContainer>
        {/* LEFT SIDE */}
        <div className="w-80 bg-slate-800/50 backdrop-blur-sm flex flex-col">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activeTab === "chats" ? <ChatsList /> : <ContactsList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 flex flex-col bg-slate-900/50 backdrop-blur-sm">
          {selectedUser ? <ChatContainer /> : <NoConvoPlaceHolder />}
        </div>
      </AnimatedBorderContainer>
    </div>
  );
};

export default ChatsPage;
