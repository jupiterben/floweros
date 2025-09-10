'use client'

import React from 'react'
import { useOS } from '@/context/OSContext'
import Window from './Window'

// 动态导入应用组件
const AppComponents: { [key: string]: React.ComponentType } = {
  FileManager: React.lazy(() => import('../Apps/FileManager')),
  AppStore: React.lazy(() => import('../Apps/AppStore')),
  SystemSettings: React.lazy(() => import('../Apps/SystemSettings')),
  Calculator: React.lazy(() => import('../Apps/Calculator')),
  Notepad: React.lazy(() => import('../Apps/Notepad')),
  Browser: React.lazy(() => import('../Apps/Browser')),
}

const WindowManager: React.FC = () => {
  const { windows } = useOS()

  return (
    <>
      {windows.map((window) => {
        const AppComponent = AppComponents[window.component]
        
        return (
          <Window key={window.id} window={window}>
            <React.Suspense fallback={<div className="flex items-center justify-center h-32">加载中...</div>}>
              {AppComponent && <AppComponent />}
            </React.Suspense>
          </Window>
        )
      })}
    </>
  )
}

export default WindowManager
