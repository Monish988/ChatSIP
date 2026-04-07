import React from 'react'

const AnimatedBorderContainer = ({children, className = ""}) => {
  return (
    <div className={`w-full rounded-2xl border border-transparent bg-[linear-gradient(45deg,#172033,#1e293b_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),#4755697a_80%,#6366f1_86%,#a5b4fc_90%,#6366f1_94%,#4755697a)_border-box] animate-border ${className}`}>
        {children}
    </div>
  )
}
 
export default AnimatedBorderContainer