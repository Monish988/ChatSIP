import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
export const useAuthStore = create((set) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  signUp: async (data) => {


    try{
      set({isSigningUp:true})

      const res = await axiosInstance.post("/auth/signup",data)
      set({authUser:res.data})
      toast.success("Account Created Successfully!")

    }
    catch(err){
      console.log("Error in Signing up.. ",err)
      toast.error(err.data.message)
      
    }
    finally{
      set({isSigningUp:false})
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check-auth");
      set({ authUser: res.data });
      
    } catch (err) {
      console.log("Error checking auth", err);
      set({ authUser: null, isCheckingAuth: false });
    }
  },
}));
