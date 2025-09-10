'use client'

import React from 'react'
import DynamicWallpaper from './DynamicWallpaper'

interface WallpaperManagerProps {
  wallpaper: string
  dynamicWallpaper: boolean
  wallpaperSpeed: 'slow' | 'normal' | 'fast'
}

const WallpaperManager: React.FC<WallpaperManagerProps> = ({
  wallpaper,
  dynamicWallpaper,
  wallpaperSpeed,
}) => {
  // 静态壁纸样式
  const getStaticWallpaperClass = () => {
    switch (wallpaper) {
      case 'nature':
        return 'bg-gradient-to-br from-green-400 via-blue-500 to-teal-600'
      case 'abstract':
        return 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500'
      case 'default':
      default:
        return 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
    }
  }

  // 动态壁纸类型
  const isDynamicWallpaper = ['gradient', 'particles', 'waves'].includes(wallpaper)

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* 静态背景 */}
      {!isDynamicWallpaper && (
        <div className={`absolute inset-0 ${getStaticWallpaperClass()}`} />
      )}

      {/* 动态背景 */}
      {isDynamicWallpaper && (
        <DynamicWallpaper
          type={wallpaper as 'gradient' | 'particles' | 'waves'}
          speed={wallpaperSpeed}
          enabled={dynamicWallpaper}
        />
      )}

      {/* 静态背景作为动态壁纸的回退 */}
      {isDynamicWallpaper && !dynamicWallpaper && (
        <div className={`absolute inset-0 ${
          wallpaper === 'gradient'
            ? 'bg-gradient-to-br from-orange-400 via-red-500 to-purple-600'
            : wallpaper === 'particles'
            ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900'
            : 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600'
        }`} />
      )}

      {/* 半透明遮罩以确保桌面图标可见性 */}
      <div className="absolute inset-0 bg-black/5" />
    </div>
  )
}

export default WallpaperManager
