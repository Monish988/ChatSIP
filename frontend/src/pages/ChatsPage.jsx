import React from "react";
import AnimatedBorderContainer from "../components/AnimatedBorderContainer";
import { useChatStore } from "../store/useChatStore";
import ChatContainer from "../components/ChatContainer";
import NoConvoPlaceHolder from "../components/NoConvoPlaceHolder";
import ChatsList from "../components/ChatsList";
import ContactsList from "../components/ContactsList";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import { useEffect } from "react";

const ChatsPage = () => {
  const { activeTab, selectedUser, connectRealtime, disconnectRealtime } = useChatStore();

  useEffect(() => {
    connectRealtime();
    return () => disconnectRealtime();
  }, [connectRealtime, disconnectRealtime]);

  return (
    <div className="relative h-[90vh] w-full max-w-6xl">
      <AnimatedBorderContainer className="h-full overflow-hidden md:flex">
        {/* LEFT SIDE */}
        <div className="flex w-full flex-col bg-slate-800/50 backdrop-blur-sm md:w-80 md:flex-none">
          <ProfileHeader />
          <ActiveTabSwitch />

          <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
            {activeTab === "chats" ? <ChatsList /> : <ContactsList />}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden flex-1 flex-col bg-slate-900/50 backdrop-blur-sm md:flex min-h-0">
          {selectedUser ? <ChatContainer /> : <NoConvoPlaceHolder />}
        </div>
      </AnimatedBorderContainer>
    </div>
  );
};

export default ChatsPage;
