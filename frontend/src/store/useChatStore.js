import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { connectSocket, disconnectSocket, getSocket } from "../lib/socket";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  hasMoreMessages: false,
  nextCursor: null,
  onlineUserIds: [],
  typingUserIds: [],
  isSoundEnabled: localStorage.getItem("isSoundEnabled") === "true",

  toggleSound: () => {
    const next = !get().isSoundEnabled;
    localStorage.setItem("isSoundEnabled", String(next));
    set({ isSoundEnabled: next });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user, messages: [], nextCursor: null, hasMoreMessages: false });
    if (user?._id) {
      get().getMessages(user._id);
    }
  },

  getAllContacts: async () => {
    try {
      set({ isUsersLoading: true });
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data.users || [] });
    } catch (err) {

      toast.error(err.response?.data?.message || "Failed to fetch contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getAllChatPartners: async () => {
    try {
      set({ isUsersLoading: true });
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data.partners || [], onlineUserIds: res.data.onlineUserIds || [] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    try {
      set({ isMessagesLoading: true });
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({
        messages: res.data.chats || [],
        nextCursor: res.data.nextCursor,
        hasMoreMessages: res.data.hasMore,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  loadOlderMessages: async () => {
    const { selectedUser, nextCursor, hasMoreMessages } = get();
    if (!selectedUser?._id || !nextCursor || !hasMoreMessages) return;

    try {
      const res = await axiosInstance.get(`/messages/${selectedUser._id}`, {
        params: { cursor: nextCursor, limit: 20 },
      });

      set((state) => ({
        messages: [...(res.data.chats || []), ...state.messages],
        nextCursor: res.data.nextCursor,
        hasMoreMessages: res.data.hasMore,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load older messages");
    }
  },

  sendMessage: async ({ text = "", image = null, file = null }) => {
    const { selectedUser } = get();
    if (!selectedUser?._id) return;

    try {
      await axiosInstance.post(`/messages/send/${selectedUser._id}`, { text, image, file });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send message");
    }
  },

  reactToMessage: async (messageId, emoji) => {
    if (!messageId || !emoji) return;

    try {
      const res = await axiosInstance.patch(`/messages/reaction/${messageId}`, { emoji });
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: res.data.reactions || [] } : msg,
        ),
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to react to message");
    }
  },

  startTyping: () => {
    const socket = getSocket();
    const { selectedUser } = get();
    if (!socket || !selectedUser?._id) return;
    socket.emit("typing:start", { toUserId: selectedUser._id });
  },

  stopTyping: () => {
    const socket = getSocket();
    const { selectedUser } = get();
    if (!socket || !selectedUser?._id) return;
    socket.emit("typing:stop", { toUserId: selectedUser._id });
  },

  connectRealtime: () => {
    const authUser = useAuthStore.getState().authUser;
    if (!authUser?._id) return;

    const socket = connectSocket();

    socket.off("presence:update");
    socket.on("presence:update", ({ onlineUserIds }) => {
      set({ onlineUserIds: onlineUserIds || [] });
    });

    socket.off("typing:start");
    socket.on("typing:start", ({ fromUserId }) => {
      set((state) => ({
        typingUserIds: state.typingUserIds.includes(fromUserId)
          ? state.typingUserIds
          : [...state.typingUserIds, fromUserId],
      }));
    });

    socket.off("typing:stop");
    socket.on("typing:stop", ({ fromUserId }) => {
      set((state) => ({
        typingUserIds: state.typingUserIds.filter((id) => id !== fromUserId),
      }));
    });

    socket.off("messages:new");
    socket.on("messages:new", ({ message }) => {
      const authUserId = useAuthStore.getState().authUser?._id;
      const { selectedUser } = get();

      if (!authUserId || !selectedUser?._id || !message) return;

      const isSelectedConversation =
        (String(message.senderId) === String(selectedUser._id) &&
          String(message.receiverId) === String(authUserId)) ||
        (String(message.senderId) === String(authUserId) &&
          String(message.receiverId) === String(selectedUser._id));

      if (!isSelectedConversation) {
        return;
      }

      set((state) => ({
        messages: state.messages.some((msg) => msg._id === message._id)
          ? state.messages
          : [...state.messages, message],
      }));
    });

    socket.off("messages:read");
    socket.on("messages:read", ({ byUserId, readAt }) => {
      const authUserId = useAuthStore.getState().authUser?._id;
      if (!authUserId || String(byUserId) !== String(get().selectedUser?._id)) return;

      set((state) => ({
        messages: state.messages.map((msg) =>
          String(msg.senderId) === String(authUserId) ? { ...msg, readAt, deliveredAt: readAt } : msg,
        ),
      }));
    });

    socket.off("messages:reaction");
    socket.on("messages:reaction", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: reactions || [] } : msg,
        ),
      }));
    });
  },

  disconnectRealtime: () => {
    disconnectSocket();
    set({ typingUserIds: [], onlineUserIds: [] });
  },
}));
