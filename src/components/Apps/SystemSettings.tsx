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
              <div className="grid grid-cols-3 gap-3">
                {['default', 'nature', 'abstract'].map((wallpaper) => (
                  <button
                    key={wallpaper}
                    onClick={() => updateSetting('wallpaper', wallpaper)}
                    className={`aspect-video border rounded bg-gradient-to-br text-xs ${
                      settings.wallpaper === wallpaper
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-300'
                    } ${
                      wallpaper === 'default'
                        ? 'from-blue-400 to-purple-500'
                        : wallpaper === 'nature'
                        ? 'from-green-400 to-blue-500'
                        : 'from-purple-400 to-pink-500'
                    }`}
                  >
                    {wallpaper === 'default' ? '默认' : wallpaper === 'nature' ? '自然' : '抽象'}
                  </button>
                ))}
              </div>
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
