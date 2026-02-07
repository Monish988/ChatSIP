import React from 'react'
import { useAuthStore } from '../store/useAuthStore'

const ChatsPage = () => {
  const {user,isLoggedIn,login} = useAuthStore();
  console.log(user,isLoggedIn,login)
  return (
     <button className=' z-10' onClick={login}>Login</button>
  )
}

export default ChatsPage