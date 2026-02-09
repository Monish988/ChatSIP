import React from 'react'
import {Loader} from 'lucide-react'

const LoaderComp = () => {
  return (
    <div className=' min-h-screen flex items-center justify-center bg-white/5 '>
      <Loader className='animate-spin' size={50} color='white' />
    </div>
  )
}

export default LoaderComp