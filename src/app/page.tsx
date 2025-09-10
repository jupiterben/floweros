'use client'

import { useState } from 'react'
import Desktop from '@/components/Desktop/Desktop'
import Taskbar from '@/components/Taskbar/Taskbar'
import WindowManager from '@/components/WindowManager/WindowManager'
import { OSProvider } from '@/context/OSContext'

export default function Home() {
  return (
    <OSProvider>
      <div className="h-full relative">
        <Desktop />
        <WindowManager />
        <Taskbar />
      </div>
    </OSProvider>
  )
}
