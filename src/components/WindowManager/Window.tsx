'use client'

import React, { useState, useRef } from 'react'
import { useOS } from '@/context/OSContext'
import { Minus, Square, X } from 'lucide-react'
import type { AppWindow } from '@/context/OSContext'
import { VLayout } from '../Core/Layout'

interface WindowProps {
  window: AppWindow
  children?: React.ReactNode
}

const Window: React.FC<WindowProps> = ({ window, children }) => {
  const { 
    closeWindow, 
    minimizeWindow, 
    maximizeWindow, 
    setActiveWindow,
    updateWindowPosition,
    updateWindowSize,
    activeWindowId 
  } = useOS()

  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const windowRef = useRef<HTMLDivElement>(null)


  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as Element).closest('.window-header')) {
      setActiveWindow(window.id)
      setIsDragging(true)
      setDragStart({
        x: e.clientX - window.position.x,
        y: e.clientY - window.position.y,
      })
    }
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateWindowPosition(window.id, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    } else if (isResizing) {
      const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x))
      const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y))
      updateWindowSize(window.id, { width: newWidth, height: newHeight })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, dragStart, resizeStart])

  const windowStyle = window.isMaximized
    ? { top: 0, left: 0, width: '100vw', height: 'calc(100vh - 48px)' }
    : {
        top: window.position.y,
        left: window.position.x,
        width: window.size.width,
        height: window.size.height,
      }

  // 如果窗口最小化，不渲染任何内容
  if (window.isMinimized) return null

  return (
    <div
      ref={windowRef}
      className={`window fixed animate-scale-in flex flex-col ${
        activeWindowId === window.id ? 'ring-2 ring-blue-400' : ''
      }`}
      style={{
        ...windowStyle,
        zIndex: window.zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 窗口标题栏 */}
      <div className="window-header select-none flex-shrink-0">
        <div className="flex items-center">
          <span className="font-medium text-gray-700">{window.title}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => minimizeWindow(window.id)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => maximizeWindow(window.id)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => closeWindow(window.id)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-200 transition-colors text-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 窗口内容 */}
      <VLayout>
        {children}
      </VLayout>

      {/* 调整大小手柄 */}
      {!window.isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex-shrink-0"
          onMouseDown={handleResizeMouseDown}
        >
          <div className="w-3 h-3 border-r-2 border-b-2 border-gray-400 opacity-50" />
        </div>
      )}
    </div>
  )
}

export default Window
