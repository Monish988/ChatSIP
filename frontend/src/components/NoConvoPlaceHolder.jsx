import React from "react";
import { MessageCircleHeart } from "lucide-react";

const NoConvoPlaceHolder = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-300">
      <MessageCircleHeart className="size-10 text-cyan-400" />
      <h3 className="text-lg font-semibold">Select a chat to start messaging</h3>
      <p className="max-w-sm text-center text-sm text-slate-400">
        Pick a contact from the sidebar or search by username to start a private conversation.
      </p>
    </div>
  );
};

export default NoConvoPlaceHolder;