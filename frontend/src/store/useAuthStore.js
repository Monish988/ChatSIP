import { create } from "zustand";
export const useAuthStore = create((set) => ({
  user: {
    name:"demo",
    id:"1234"
  },
  isLoggedIn:false,
  login:()=>{
    
    set({isLoggedIn:true})
    console.log("user logged in")
    
  },
 
}));