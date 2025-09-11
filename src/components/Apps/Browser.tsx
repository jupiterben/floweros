'use client'

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw, Home, Search, Star, MoreVertical } from 'lucide-react'

const Browser: React.FC = () => {
  const [url, setUrl] = useState('https://www.bing.com')
  const [currentUrl, setCurrentUrl] = useState('https://www.bing.com')
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [useProxy, setUseProxy] = useState(false)
  const [history, setHistory] = useState(['https://www.bing.com'])
  const [historyIndex, setHistoryIndex] = useState(0)

  const bookmarks = [
    { name: 'Bing搜索', url: 'https://www.bing.com', iframe: true, protocol: 'https' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com', iframe: true, protocol: 'https' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org', iframe: true, protocol: 'https' },
    { name: 'GitHub', url: 'https://github.com', iframe: false, protocol: 'https' },
    { name: 'StackOverflow', url: 'https://stackoverflow.com', iframe: false, protocol: 'https' },
    { name: 'MDN', url: 'https://developer.mozilla.org', iframe: false, protocol: 'https' },
    { name: 'HTTP示例', url: 'http://httpbin.org', iframe: false, protocol: 'http' },
  ]

  const checkMixedContent = (targetUrl: string) => {
    // 检查是否存在混合内容问题
    if (typeof window !== 'undefined') {
      const isPageHttps = window.location.protocol === 'https:'
      const isTargetHttp = targetUrl.startsWith('http:')
      return isPageHttps && isTargetHttp
    }
    return false
  }

  const handleNavigate = (newUrl?: string) => {
    const targetUrl = newUrl || url
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      // 如果不是完整URL，则作为搜索查询处理
      const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(targetUrl)}`
      setUrl(searchUrl)
      setCurrentUrl(searchUrl)
    } else {
      setCurrentUrl(targetUrl)
      // 检查混合内容问题，如果存在则自动启用代理模式
      if (checkMixedContent(targetUrl)) {
        setUseProxy(true)
      }
    }
    
    setIsLoading(true)
    setHasError(false)
    
    // 添加到历史记录
    const actualUrl = targetUrl.startsWith('http') ? targetUrl : `https://www.bing.com/search?q=${encodeURIComponent(targetUrl)}`
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(actualUrl)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
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
    handleNavigate('https://www.bing.com')
    setUrl('https://www.bing.com')
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const getProxyUrl = (targetUrl: string) => {
    if (useProxy) {
      return `/api/proxy?url=${encodeURIComponent(targetUrl)}`
    }
    return targetUrl
  }

  const retryWithProxy = () => {
    setUseProxy(true)
    setHasError(false)
    setIsLoading(true)
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
          <button 
            onClick={() => setUseProxy(!useProxy)}
            className={`p-2 rounded text-xs font-medium transition-colors ${
              useProxy 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={useProxy ? '代理模式已启用' : '点击启用代理模式'}
          >
            代理
          </button>
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
              // 如果网站不支持iframe或是HTTP协议，自动启用代理模式
              if (!bookmark.iframe || checkMixedContent(bookmark.url)) {
                setUseProxy(true)
              }
            }}
            className="px-3 py-1 text-xs hover:bg-gray-200 rounded mr-2 flex items-center space-x-1"
            title={
              bookmark.protocol === 'http' 
                ? 'HTTP网站 - 需要代理模式访问' 
                : bookmark.iframe 
                ? '支持直接访问' 
                : '需要代理模式访问'
            }
          >
            <span>{bookmark.name}</span>
            {bookmark.protocol === 'http' && (
              <span className="text-red-500 text-xs" title="HTTP协议">⚠️</span>
            )}
            {!bookmark.iframe && bookmark.protocol !== 'http' && (
              <span className="text-orange-500 text-xs" title="需要代理">🔒</span>
            )}
          </button>
        ))}
      </div>

      {/* 网页内容区域 */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {/* 加载遮罩 */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">正在加载 {currentUrl}</p>
            </div>
          </div>
        )}
        
        {/* 错误页面 */}
        {hasError ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">
                {checkMixedContent(currentUrl) ? '⚠️' : '🚫'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {checkMixedContent(currentUrl) ? '混合内容被阻止' : '无法加载网页'}
              </h2>
              <p className="text-gray-600 mb-6">
                {checkMixedContent(currentUrl) ? (
                  <span>
                    HTTPS页面无法直接加载HTTP内容。这是浏览器的安全策略，
                    用于防止中间人攻击和数据泄露。
                  </span>
                ) : (
                  <span>
                    该网站可能设置了X-Frame-Options限制，不允许在iframe中显示，
                    或者网络连接出现问题。
                  </span>
                )}
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>URL:</strong> {currentUrl}
                </p>
                {checkMixedContent(currentUrl) && (
                  <p className="text-sm text-red-600 mt-2">
                    <strong>问题:</strong> HTTP内容被HTTPS页面阻止
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {!useProxy && (
                  <button 
                    onClick={retryWithProxy}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    🔄 使用代理模式重试
                  </button>
                )}
                <button 
                  onClick={handleRefresh}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  重试
                </button>
                <button 
                  onClick={handleHome}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            key={`${currentUrl}-${useProxy}`} // 强制重新渲染iframe
            src={getProxyUrl(currentUrl)}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
            loading="eager"
            title="Browser Content"
          />
        )}
      </div>

      {/* 状态栏 */}
      <div className="px-4 py-1 bg-gray-100 border-t border-gray-200 text-xs text-gray-600 flex justify-between">
        <div className="flex items-center space-x-2">
          <span>
            {isLoading ? '正在加载...' : hasError ? '加载失败' : '完成'}
          </span>
          {useProxy && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
              代理模式
            </span>
          )}
        </div>
        <span className="text-gray-500 truncate max-w-md">
          {currentUrl}
        </span>
      </div>
    </div>
  )
}

export default Browser
