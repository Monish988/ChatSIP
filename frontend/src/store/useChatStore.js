import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { Users } from "lucide-react";
import toast from "react-hot-toast";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: localStorage.getItem("isSoundEnabled") === true,
  toggleSound: () => {
    set(localStorage.setItem("isSoundEnabled"), !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },
  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },
  getAllContacts: async () => {
    try {
      set({ isUsersLoading: true });
      const res = axiosInstance.get("/messages/contacts")
      set({allContacts:(await res).data})
      set({isUsersLoading:false})
    } catch (err) {
      console.log("ER", err);
      toast.error(err.response.data.message)
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getAllChatPartners: async () => {},
}));
