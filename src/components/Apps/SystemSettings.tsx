'use client'

import React, { useState } from 'react'
import { Monitor, Volume2, Wifi, Shield, Palette, User } from 'lucide-react'

const SystemSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('display')
  const [settings, setSettings] = useState({
    brightness: 80,
    volume: 65,
    nightMode: false,
    autoSleep: '30',
    theme: 'light',
    wallpaper: 'default',
    dynamicWallpaper: false,
    wallpaperSpeed: 'normal',
  })

  const tabs = [
    { id: 'display', name: '显示', icon: Monitor },
    { id: 'audio', name: '音频', icon: Volume2 },
    { id: 'network', name: '网络', icon: Wifi },
    { id: 'security', name: '安全', icon: Shield },
    { id: 'appearance', name: '外观', icon: Palette },
    { id: 'account', name: '账户', icon: User },
  ]

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'display':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                亮度
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.brightness}
                onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1">{settings.brightness}%</div>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.nightMode}
                  onChange={(e) => updateSetting('nightMode', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">夜间模式</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自动休眠
              </label>
              <select
                value={settings.autoSleep}
                onChange={(e) => updateSetting('autoSleep', e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              >
                <option value="15">15分钟</option>
                <option value="30">30分钟</option>
                <option value="60">1小时</option>
                <option value="never">从不</option>
              </select>
            </div>
          </div>
        )
      
      case 'audio':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                音量
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.volume}
                onChange={(e) => updateSetting('volume', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-500 mt-1">{settings.volume}%</div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">输出设备</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="output" defaultChecked className="mr-2" />
                  <span className="text-sm">内置扬声器</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="output" className="mr-2" />
                  <span className="text-sm">蓝牙音箱</span>
                </label>
              </div>
            </div>
          </div>
        )
      
      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主题
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => updateSetting('theme', 'light')}
                  className={`p-3 border rounded text-sm ${
                    settings.theme === 'light'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  浅色主题
                </button>
                <button
                  onClick={() => updateSetting('theme', 'dark')}
                  className={`p-3 border rounded text-sm ${
                    settings.theme === 'dark'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300'
                  }`}
                >
                  深色主题
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                壁纸
              </label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {['default', 'nature', 'abstract', 'gradient', 'particles', 'waves'].map((wallpaper) => (
                  <button
                    key={wallpaper}
                    onClick={() => updateSetting('wallpaper', wallpaper)}
                    className={`aspect-video border rounded bg-gradient-to-br text-xs relative overflow-hidden ${
                      settings.wallpaper === wallpaper
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300'
                    } ${
                      wallpaper === 'default'
                        ? 'from-blue-400 to-purple-500'
                        : wallpaper === 'nature'
                        ? 'from-green-400 to-blue-500'
                        : wallpaper === 'abstract'
                        ? 'from-purple-400 to-pink-500'
                        : wallpaper === 'gradient'
                        ? 'from-orange-400 via-red-500 to-purple-600'
                        : wallpaper === 'particles'
                        ? 'from-indigo-900 via-purple-900 to-pink-900'
                        : 'from-cyan-400 via-blue-500 to-indigo-600'
                    }`}
                  >
                    {/* 动态效果指示器 */}
                    {['gradient', 'particles', 'waves'].includes(wallpaper) && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-pulse opacity-80" />
                    )}
                    <span className="relative z-10 text-white font-medium drop-shadow-md">
                      {wallpaper === 'default' ? '默认' 
                        : wallpaper === 'nature' ? '自然' 
                        : wallpaper === 'abstract' ? '抽象'
                        : wallpaper === 'gradient' ? '渐变'
                        : wallpaper === 'particles' ? '粒子'
                        : '波浪'}
                    </span>
                  </button>
                ))}
              </div>
              
              {/* 动态壁纸设置 */}
              {['gradient', 'particles', 'waves'].includes(settings.wallpaper) && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.dynamicWallpaper}
                        onChange={(e) => updateSetting('dynamicWallpaper', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">启用动态效果</span>
                    </label>
                  </div>
                  
                  {settings.dynamicWallpaper && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        动画速度
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['slow', 'normal', 'fast'].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => updateSetting('wallpaperSpeed', speed)}
                            className={`py-2 px-3 text-xs rounded ${
                              settings.wallpaperSpeed === speed
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {speed === 'slow' ? '慢速' : speed === 'normal' ? '正常' : '快速'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 动态壁纸预览 */}
                  {settings.dynamicWallpaper && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        预览效果
                      </label>
                      <div className={`h-20 rounded border-2 border-gray-300 relative overflow-hidden ${
                        settings.wallpaper === 'gradient'
                          ? 'bg-gradient-to-r from-purple-400 via-pink-500 to-red-500'
                          : settings.wallpaper === 'particles'
                          ? 'bg-gradient-to-br from-indigo-900 to-purple-900'
                          : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                      }`}>
                        {/* 动态效果模拟 */}
                        <div className={`absolute inset-0 opacity-30 ${
                          settings.wallpaperSpeed === 'slow' ? 'animate-pulse' :
                          settings.wallpaperSpeed === 'normal' ? 'animate-bounce' : 'animate-ping'
                        }`}>
                          {settings.wallpaper === 'particles' && (
                            <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-ping" />
                          )}
                          {settings.wallpaper === 'particles' && (
                            <div className="absolute top-4 right-4 w-1 h-1 bg-white rounded-full animate-ping delay-75" />
                          )}
                          {settings.wallpaper === 'waves' && (
                            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/20 to-transparent animate-pulse" />
                          )}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {settings.wallpaper === 'gradient' ? '彩色渐变' :
                             settings.wallpaper === 'particles' ? '星空粒子' : '海洋波浪'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      
      default:
        return (
          <div className="text-center text-gray-500 py-8">
            该功能正在开发中...
          </div>
        )
    }
  }

  return (
    <div className="h-full flex">
      {/* 侧边栏 */}
      <div className="w-48 border-r border-gray-200 p-4">
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="text-sm">{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          {tabs.find(tab => tab.id === activeTab)?.name}
        </h2>
        {renderTabContent()}
      </div>
    </div>
  )
}

export default SystemSettings
