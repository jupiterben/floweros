'use client'

import Desktop from '@/components/Desktop/Desktop'
import Taskbar from '@/components/Taskbar/Taskbar'
import WindowManager from '@/components/WindowManager/WindowManager'
import { OSProvider } from '@/context/OSContext'
import Link from 'next/link'

export default function Home() {
  return (
    <OSProvider>
      <div className="h-full relative">
        <Desktop />
        <WindowManager />
        <Taskbar />
        
        {/* 屏幕流演示快捷访问 */}
        <div className="absolute top-4 right-4 z-50">
          <Link 
            href="/screen-demo" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg transition-colors text-sm font-medium"
          >
            屏幕流演示
          </Link>
        </div>
      </div>
    </OSProvider>
  )
}
