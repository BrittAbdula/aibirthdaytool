'use client'

import React from 'react'
import { isMobile } from 'react-device-detect'

interface IsMobileWrapperProps {
  children: (isMobile: boolean) => React.ReactNode
}

const IsMobileWrapper: React.FC<IsMobileWrapperProps> = ({ children }) => {
  return <>{children(isMobile)}</>
}

export default IsMobileWrapper