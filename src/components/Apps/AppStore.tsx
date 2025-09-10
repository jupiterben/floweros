'use client'

import React, { useState } from 'react'
import { Star, Download, Search } from 'lucide-react'

interface App {
  id: string
  name: string
  icon: string
  description: string
  rating: number
  downloads: string
  category: string
  installed: boolean
}

const AppStore: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [apps] = useState<App[]>([
    {
      id: '1',
      name: 'VSCode Web',
      icon: '💻',
      description: '强大的代码编辑器，支持多种编程语言',
      rating: 4.8,
      downloads: '1M+',
      category: '开发工具',
      installed: false,
    },
    {
      id: '2',
      name: '音乐播放器',
      icon: '🎵',
      description: '支持多种音频格式的音乐播放器',
      rating: 4.5,
      downloads: '500K+',
      category: '娱乐',
      installed: true,
    },
    {
      id: '3',
      name: '图片编辑器',
      icon: '🎨',
      description: '轻量级图片编辑工具，支持基础编辑功能',
      rating: 4.3,
      downloads: '300K+',
      category: '工具',
      installed: false,
    },
    {
      id: '4',
      name: '聊天应用',
      icon: '💬',
      description: '即时通讯工具，支持文字、语音、视频聊天',
      rating: 4.6,
      downloads: '2M+',
      category: '社交',
      installed: false,
    },
  ])

  const categories = ['全部', '开发工具', '娱乐', '工具', '社交', '教育', '办公']

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === '全部' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleInstall = (appId: string) => {
    // 这里可以实现安装逻辑
    console.log(`安装应用: ${appId}`)
  }

  return (
    <div className="h-full flex flex-col">
      {/* 搜索栏 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search className="w-5 h-5 text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="搜索应用..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none"
          />
        </div>
      </div>

      <div className="flex-1 flex">
        {/* 分类侧边栏 */}
        <div className="w-48 p-4 border-r border-gray-200">
          <h3 className="font-medium text-gray-700 mb-3">分类</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 应用列表 */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredApps.map((app) => (
              <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start">
                  <div className="text-3xl mr-3">{app.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{app.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{app.description}</p>
                    
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">{app.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="w-4 h-4 text-gray-500 mr-1" />
                        <span className="text-sm text-gray-600">{app.downloads}</span>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {app.category}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      {app.installed ? (
                        <button
                          disabled
                          className="px-4 py-2 bg-gray-100 text-gray-500 rounded cursor-not-allowed text-sm"
                        >
                          已安装
                        </button>
                      ) : (
                        <button
                          onClick={() => handleInstall(app.id)}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                        >
                          安装
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppStore
