'use client'

import Desktop from '@/components/Desktop/Desktop'
import Taskbar from '@/components/Taskbar/Taskbar'
import WindowManager from '@/components/WindowManager/WindowManager'
import { OSProvider, useOS } from '@/context/OSContext'

function OSShell() {
  const { appearance } = useOS()
  return (
    <div className={`h-full relative ${appearance.theme === 'dark' ? 'dark' : ''}`}>
      <Desktop />
      <WindowManager />
      <Taskbar />
    </div>
  )
}

export default function Home() {
  return (
    <OSProvider>
      <OSShell />
    </OSProvider>
  )
}
