import React from "react";
import { LogOut, UserCircle2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const ProfileHeader = () => {
  const { authUser, logout } = useAuthStore();

  return (
    <div className="flex items-center justify-between border-b border-slate-700/60 p-4">
      <div className="flex items-center gap-3">
        {authUser?.profilePic ? (
          <img
            src={authUser.profilePic}
            alt={authUser.fullname}
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <UserCircle2 className="size-10 text-slate-300" />
        )}
        <div>
          <p className="text-sm font-semibold text-slate-100">{authUser?.fullname || "Unknown"}</p>
          <p className="text-xs text-slate-400">@{authUser?.username || "member"}</p>
        </div>
      </div>
      <button
        className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:text-white"
        onClick={logout}
        title="Logout"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
};

export default ProfileHeader;