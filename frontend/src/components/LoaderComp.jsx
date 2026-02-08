import React from 'react'
import {Loader} from 'lucide-react'

const LoaderComp = () => {
  return (
    <div className=' flex items-center justify-center bg-white/5 min-h-screen'>
      <Loader className='animate-spin' size={50} color='white' />
    </div>
  )
}

export default LoaderComp