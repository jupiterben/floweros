'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

export interface AppWindow {
  id: string
  title: string
  component: string
  isMinimized: boolean
  isMaximized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
}

export interface DesktopApp {
  id: string
  name: string
  icon: string
  component: string
}

interface OSContextType {
  windows: AppWindow[]
  apps: DesktopApp[]
  activeWindowId: string | null
  openWindow: (app: DesktopApp) => void
  closeWindow: (windowId: string) => void
  minimizeWindow: (windowId: string) => void
  maximizeWindow: (windowId: string) => void
  setActiveWindow: (windowId: string) => void
  updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void
  updateWindowSize: (windowId: string, size: { width: number; height: number }) => void
}

const OSContext = createContext<OSContextType | undefined>(undefined)

export const useOS = () => {
  const context = useContext(OSContext)
  if (!context) {
    throw new Error('useOS must be used within an OSProvider')
  }
  return context
}

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<AppWindow[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  const [nextZIndex, setNextZIndex] = useState(1000)

  const apps: DesktopApp[] = [
    { id: 'file-manager', name: '文件管理器', icon: '📁', component: 'FileManager' },
    { id: 'app-store', name: '应用商店', icon: '🏪', component: 'AppStore' },
    { id: 'system-settings', name: '系统设置', icon: '⚙️', component: 'SystemSettings' },
    { id: 'calculator', name: '计算器', icon: '🧮', component: 'Calculator' },
    { id: 'notepad', name: '记事本', icon: '📝', component: 'Notepad' },
    { id: 'browser', name: '浏览器', icon: '🌐', component: 'Browser' },
    { id: 'native-app-manager', name: '应用管理器', icon: '🏢', component: 'NativeAppManager' },
  ]

  const openWindow = useCallback((app: DesktopApp) => {
    const existingWindow = windows.find(w => w.id === app.id)
    if (existingWindow) {
      setActiveWindowId(app.id)
      if (existingWindow.isMinimized) {
        setWindows(prev => prev.map(w => 
          w.id === app.id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w
        ))
        setNextZIndex(prev => prev + 1)
      }
      return
    }

    const newWindow: AppWindow = {
      id: app.id,
      title: app.name,
      component: app.component,
      isMinimized: false,
      isMaximized: false,
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      size: { width: 800, height: 600 },
      zIndex: nextZIndex,
    }

    setWindows(prev => [...prev, newWindow])
    setActiveWindowId(app.id)
    setNextZIndex(prev => prev + 1)
  }, [windows, nextZIndex])

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId))
    setActiveWindowId(prev => prev === windowId ? null : prev)
  }, [])

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMinimized: true } : w
    ))
    setActiveWindowId(prev => prev === windowId ? null : prev)
  }, [])

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ))
  }, [])

  const setActiveWindow = useCallback((windowId: string) => {
    setActiveWindowId(windowId)
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, zIndex: nextZIndex } : w
    ))
    setNextZIndex(prev => prev + 1)
  }, [nextZIndex])

  const updateWindowPosition = useCallback((windowId: string, position: { x: number; y: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, position } : w
    ))
  }, [])

  const updateWindowSize = useCallback((windowId: string, size: { width: number; height: number }) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, size } : w
    ))
  }, [])

  return (
    <OSContext.Provider value={{
      windows,
      apps,
      activeWindowId,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      setActiveWindow,
      updateWindowPosition,
      updateWindowSize,
    }}>
      {children}
    </OSContext.Provider>
  )
}
