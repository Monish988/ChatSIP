import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { ENV } from "./env.js";

let ioInstance;

const userSockets = new Map();

const getUserSet = (userId) => {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }
  return userSockets.get(userId);
};

const getOnlineUserIds = () => Array.from(userSockets.keys());

const extractToken = (socket) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return null;

  const parsed = cookie.parse(cookieHeader);
  return parsed.jwt || null;
};

const socketAuth = (socket, next) => {
  try {
    const token = extractToken(socket);
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    socket.userId = decoded.userID;
    return next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
};

const emitPresence = () => {
  ioInstance.emit("presence:update", { onlineUserIds: getOnlineUserIds() });
};

const handleSocketEvents = (socket) => {
  const userId = socket.userId.toString();
  const sockets = getUserSet(userId);

  sockets.add(socket.id);
  socket.join(`user:${userId}`);
  emitPresence();

  socket.on("typing:start", ({ toUserId }) => {
    if (!toUserId) return;
    ioInstance.to(`user:${toUserId}`).emit("typing:start", { fromUserId: userId });
  });

  socket.on("typing:stop", ({ toUserId }) => {
    if (!toUserId) return;
    ioInstance.to(`user:${toUserId}`).emit("typing:stop", { fromUserId: userId });
  });

  socket.on("disconnect", () => {
    const userSet = userSockets.get(userId);
    if (userSet) {
      userSet.delete(socket.id);
      if (userSet.size === 0) {
        userSockets.delete(userId);
      }
    }
    emitPresence();
  });
};

export const initSocket = (httpServer, corsOptions) => {
  ioInstance = new Server(httpServer, {
    cors: corsOptions || {
      origin: ENV.CLIENT_URL,
      credentials: true,
    },
  });

  ioInstance.use(socketAuth);
  ioInstance.on("connection", handleSocketEvents);
  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized");
  }
  return ioInstance;
};

export const isUserOnline = (userId) => userSockets.has(userId.toString());

export const emitToUser = (userId, eventName, payload) => {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(eventName, payload);
};
