import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn:false,
  signUp: async (data) => {
    try {
      set({ isSigningUp: true });

      const res = await axiosInstance.post("/auth/signup", {
        ...data,
        fullname: data.fullname?.trim(),
        username: data.username?.trim(),
        email: data.email?.trim().toLowerCase(),
      });
      set({ authUser: res.data });
      toast.success("Account Created Successfully!");
    } catch (err) {
      console.log("Error in Signing up.. ", err);
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    try {
      set({ isLoggingIn: true });

      const res = await axiosInstance.post("/auth/login", {
        ...data,
        email: data.email?.trim().toLowerCase(),
        password: data.password?.trim(),
      });
      set({ authUser: res.data });
      toast.success("Logged in successfully!");

    } catch (err) {
      console.log("Error in Signing up.. ", err);
     toast.error(err.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check-auth");
      set({ authUser: res.data, isCheckingAuth:false });
    } catch (err) {
      console.log("Error checking auth", err);
      set({ authUser: null, isCheckingAuth: false });
    }
  },
}));
