'use client'

import React, { useEffect, useState } from 'react'

interface DynamicWallpaperProps {
  type: 'gradient' | 'particles' | 'waves'
  speed: 'slow' | 'normal' | 'fast'
  enabled: boolean
}

const DynamicWallpaper: React.FC<DynamicWallpaperProps> = ({ type, speed, enabled }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  // 生成粒子
  useEffect(() => {
    if (type === 'particles' && enabled) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
      }))
      setParticles(newParticles)
    }
  }, [type, enabled])

  const getSpeedClass = () => {
    switch (speed) {
      case 'slow': return 'duration-[8000ms]'
      case 'fast': return 'duration-[2000ms]'
      default: return 'duration-[4000ms]'
    }
  }

  if (!enabled) return null

  // 渐变动态背景
  if (type === 'gradient') {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-gradient-x ${getSpeedClass()}`} />
        <div className={`absolute inset-0 bg-gradient-to-tl from-blue-400 via-purple-500 to-pink-500 opacity-50 animate-gradient-y ${getSpeedClass()}`} />
        <div className={`absolute inset-0 bg-gradient-to-tr from-green-400 via-blue-500 to-purple-600 opacity-30 animate-pulse ${getSpeedClass()}`} />
      </div>
    )
  }

  // 粒子动态背景
  if (type === 'particles') {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-1 h-1 bg-white rounded-full animate-ping opacity-60`}
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: speed === 'slow' ? '4s' : speed === 'fast' ? '1s' : '2s',
            }}
          />
        ))}
        {/* 流星效果 */}
        <div className="absolute top-1/4 left-1/4 w-px h-20 bg-gradient-to-b from-white to-transparent opacity-70 animate-meteor" />
        <div className="absolute top-1/2 right-1/3 w-px h-16 bg-gradient-to-b from-white to-transparent opacity-50 animate-meteor delay-1000" />
      </div>
    )
  }

  // 波浪动态背景
  if (type === 'waves') {
    return (
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-cyan-400 overflow-hidden">
        <div className={`absolute inset-0 opacity-30`}>
          <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/20 to-transparent animate-wave ${getSpeedClass()}`} />
          <div className={`absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/10 to-transparent animate-wave delay-500 ${getSpeedClass()}`} />
          <div className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/15 to-transparent animate-wave delay-1000 ${getSpeedClass()}`} />
        </div>
        {/* 气泡效果 */}
        <div className="absolute bottom-10 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-bubble" />
        <div className="absolute bottom-16 right-1/3 w-1 h-1 bg-white/40 rounded-full animate-bubble delay-700" />
        <div className="absolute bottom-8 left-1/2 w-1.5 h-1.5 bg-white/20 rounded-full animate-bubble delay-1400" />
      </div>
    )
  }

  return null
}

export default DynamicWallpaper
