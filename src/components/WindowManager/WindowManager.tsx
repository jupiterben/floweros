'use client'

import React from 'react'
import { useOS } from '@/context/OSContext'
import Window from './Window'

const WindowManager: React.FC = () => {
  const { windows } = useOS()

  return (
    <>
      {windows.map((window) => (
        <Window key={window.id} window={window} />
      ))}
    </>
  )
}

export default WindowManager
