'use client'

import React from 'react'
import { useOS } from '@/context/OSContext'
import { Home, Search, Settings } from 'lucide-react'

const Taskbar: React.FC = () => {
  const { windows, openWindow, setActiveWindow, apps } = useOS()

  const handleWindowClick = (windowId: string) => {
    const window = windows.find(w => w.id === windowId)
    if (window?.isMinimized) {
      setActiveWindow(windowId)
    } else {
      setActiveWindow(windowId)
    }
  }

  const handleSettingsClick = () => {
    const settingsApp = apps.find(app => app.id === 'system-settings')
    if (settingsApp) {
      openWindow(settingsApp)
    }
  }

  return (
    <div className="taskbar">
      {/* 开始按钮 */}
      <div className="taskbar-item mr-2">
        <Home className="w-5 h-5 text-white" />
      </div>

      {/* 搜索 */}
      <div className="taskbar-item mr-4">
        <Search className="w-5 h-5 text-white" />
      </div>

      {/* 打开的窗口 */}
      <div className="flex-1 flex items-center">
        {windows.map((window) => (
          <div
            key={window.id}
            className={`taskbar-item mx-1 px-3 min-w-32 ${
              !window.isMinimized ? 'bg-white/30' : 'bg-white/10'
            }`}
            onClick={() => handleWindowClick(window.id)}
          >
            <span className="text-white text-sm truncate">{window.title}</span>
          </div>
        ))}
      </div>

      {/* 系统托盘 */}
      <div className="flex items-center space-x-2">
        <div className="taskbar-item" onClick={handleSettingsClick}>
          <Settings className="w-5 h-5 text-white" />
        </div>
        
        <div className="text-white text-sm">
          {new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  )
}

export default Taskbar
