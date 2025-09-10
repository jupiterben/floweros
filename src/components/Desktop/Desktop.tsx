'use client'

import React from 'react'
import { useOS } from '@/context/OSContext'

const Desktop: React.FC = () => {
  const { apps, openWindow } = useOS()

  const handleAppClick = (app: any) => {
    openWindow(app)
  }

  return (
    <div className="h-full p-4">
      <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
        {apps.map((app) => (
          <div
            key={app.id}
            className="desktop-icon"
            onClick={() => handleAppClick(app)}
          >
            <div className="text-2xl mb-1">{app.icon}</div>
            <span className="text-center">{app.name}</span>
          </div>
        ))}
      </div>
      
      {/* 桌面时钟 */}
      <div className="absolute top-4 right-4 text-white">
        <div className="text-2xl font-light">
          {new Date().toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
        <div className="text-sm opacity-80">
          {new Date().toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </div>
  )
}

export default Desktop
