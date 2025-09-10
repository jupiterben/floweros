'use client'

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw, Home, Search, Star, MoreVertical } from 'lucide-react'

const Browser: React.FC = () => {
  const [url, setUrl] = useState('https://www.example.com')
  const [currentUrl, setCurrentUrl] = useState('https://www.example.com')
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState(['https://www.example.com'])
  const [historyIndex, setHistoryIndex] = useState(0)

  const bookmarks = [
    { name: '搜索引擎', url: 'https://www.google.com' },
    { name: '新闻', url: 'https://news.example.com' },
    { name: '视频', url: 'https://video.example.com' },
    { name: '音乐', url: 'https://music.example.com' },
  ]

  const handleNavigate = (newUrl?: string) => {
    const targetUrl = newUrl || url
    setIsLoading(true)
    setCurrentUrl(targetUrl)
    
    // 添加到历史记录
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(targetUrl)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    // 模拟加载
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      const prevUrl = history[historyIndex - 1]
      setCurrentUrl(prevUrl)
      setUrl(prevUrl)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      const nextUrl = history[historyIndex + 1]
      setCurrentUrl(nextUrl)
      setUrl(nextUrl)
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }

  const handleHome = () => {
    handleNavigate('https://www.example.com')
    setUrl('https://www.example.com')
  }

  return (
    <div className="h-full flex flex-col">
      {/* 浏览器工具栏 */}
      <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-1 mr-4">
          <button
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-200 rounded"
          >
            <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleHome}
            className="p-2 hover:bg-gray-200 rounded"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* 地址栏 */}
        <div className="flex-1 flex items-center bg-white border border-gray-300 rounded">
          <Search className="w-4 h-4 text-gray-500 ml-3" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleNavigate()}
            className="flex-1 px-3 py-2 outline-none"
            placeholder="输入网址或搜索..."
          />
        </div>

        <div className="flex items-center space-x-1 ml-4">
          <button className="p-2 hover:bg-gray-200 rounded">
            <Star className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-200 rounded">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 书签栏 */}
      <div className="flex items-center p-2 bg-gray-100 border-b border-gray-200">
        <span className="text-xs text-gray-600 mr-3">书签:</span>
        {bookmarks.map((bookmark, index) => (
          <button
            key={index}
            onClick={() => {
              setUrl(bookmark.url)
              handleNavigate(bookmark.url)
            }}
            className="px-3 py-1 text-xs hover:bg-gray-200 rounded mr-2"
          >
            {bookmark.name}
          </button>
        ))}
      </div>

      {/* 网页内容区域 */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">正在加载...</p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                欢迎使用 FlowerOS 浏览器
              </h1>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-blue-800 mb-3">
                  当前访问: {currentUrl}
                </h2>
                <p className="text-blue-600">
                  这是一个模拟的浏览器界面。在真实的WebOS中，这里可以嵌入iframe或者实现更复杂的网页渲染功能。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">功能特性</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• 地址栏导航</li>
                    <li>• 前进后退按钮</li>
                    <li>• 刷新功能</li>
                    <li>• 书签管理</li>
                    <li>• 历史记录</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">快捷操作</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Ctrl+L: 聚焦地址栏</li>
                    <li>• Ctrl+R: 刷新页面</li>
                    <li>• Alt+←: 后退</li>
                    <li>• Alt+→: 前进</li>
                    <li>• Ctrl+D: 添加书签</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="px-4 py-1 bg-gray-100 border-t border-gray-200 text-xs text-gray-600">
        {isLoading ? '正在加载...' : '完成'}
      </div>
    </div>
  )
}

export default Browser
