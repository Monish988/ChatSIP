import { io } from "socket.io-client";

let socket;

export const connectSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(
    import.meta.env.MODE === "development" ? "http://localhost:4000" : window.location.origin,
    {
      withCredentials: true,
      transports: ["websocket"],
    },
  );

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
