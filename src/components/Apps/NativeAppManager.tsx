'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Monitor, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Minimize2, 
  X, 
  ExternalLink,
  Settings,
  Filter,
  Search,
  Download,
  Play,
  Square,
  AlertCircle,
  Cpu,
  MemoryStick
} from 'lucide-react'

interface NativeApp {
  id: string
  title: string
  executable: string
  pid: number
  windowId?: string
  bounds?: {
    x: number
    y: number
    width: number
    height: number
  }
  icon?: string
  isVisible: boolean
  isMinimized: boolean
}

interface AppScreenshot {
  [key: string]: {
    data: string
    timestamp: number
  }
}

const NativeAppManager: React.FC = () => {
  // 状态管理
  const [apps, setApps] = useState<NativeApp[]>([])
  const [screenshots, setScreenshots] = useState<AppScreenshot>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [platform, setPlatform] = useState<string>('unknown')
  
  // 过滤和搜索
  const [searchTerm, setSearchTerm] = useState('')
  const [includeMinimized, setIncludeMinimized] = useState(false)
  const [onlyVisible, setOnlyVisible] = useState(true)
  const [selectedApp, setSelectedApp] = useState<NativeApp | null>(null)
  
  // 实时更新设置
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000) // 5秒
  const [captureQuality, setCaptureQuality] = useState(70)
  
  // Refs
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 获取应用程序列表
  const fetchApps = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        includeMinimized: includeMinimized.toString(),
        onlyVisible: onlyVisible.toString()
      })
      
      const response = await fetch(`/api/native-apps?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setApps(data.apps || [])
        setPlatform(data.platform || 'unknown')
      } else {
        setError(data.error || '获取应用程序列表失败')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络请求失败')
    } finally {
      setLoading(false)
    }
  }, [includeMinimized, onlyVisible])

  // 捕获窗口截图
  const captureAppScreenshot = useCallback(async (app: NativeApp) => {
    try {
      const response = await fetch('/api/native-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capture',
          windowId: app.windowId || app.id,
          options: {
            quality: captureQuality,
            scale: 0.5,
            format: 'jpeg'
          }
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setScreenshots(prev => ({
          ...prev,
          [app.id]: {
            data: data.data,
            timestamp: Date.now()
          }
        }))
      }
    } catch (error) {
      console.error('截图失败:', error)
    }
  }, [captureQuality])

  // 批量截图
  const captureAllScreenshots = useCallback(async () => {
    const visibleApps = apps.filter(app => app.isVisible && !app.isMinimized)
    const promises = visibleApps.slice(0, 10).map(app => captureAppScreenshot(app)) // 限制并发数
    await Promise.allSettled(promises)
  }, [apps, captureAppScreenshot])

  // 窗口操作
  const performWindowAction = useCallback(async (
    app: NativeApp, 
    action: 'focus' | 'minimize' | 'close'
  ) => {
    try {
      const response = await fetch('/api/native-apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          windowId: app.windowId || app.id,
          appId: app.id
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // 操作成功后刷新列表
        setTimeout(fetchApps, 500)
      } else {
        setError(data.error || `${action}操作失败`)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '操作失败')
    }
  }, [fetchApps])

  // 过滤应用程序
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.executable.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // 自动刷新
  useEffect(() => {
    if (autoRefresh) {
      const startAutoRefresh = () => {
        refreshTimeoutRef.current = setTimeout(() => {
          fetchApps().then(() => {
            if (autoRefresh) {
              startAutoRefresh()
            }
          })
        }, refreshInterval)
      }
      
      startAutoRefresh()
      
      return () => {
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }
      }
    }
  }, [autoRefresh, refreshInterval, fetchApps])

  // 初始化
  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  // 清理资源
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* 标题栏 */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Monitor className="w-6 h-6" />
          <div>
            <h1 className="text-lg font-semibold">原生应用管理器</h1>
            <p className="text-sm text-gray-400">
              管理本地运行的应用程序 ({platform}) - {filteredApps.length} 个应用
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              fetchApps()
              captureAllScreenshots()
            }}
            disabled={loading}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
            title="刷新列表"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="p-4 bg-gray-800 border-b border-gray-700 space-y-4">
        {/* 搜索栏 */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索应用程序或进程..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <button
            onClick={captureAllScreenshots}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors"
          >
            📸 批量截图
          </button>
        </div>
        
        {/* 过滤选项 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includeMinimized}
                onChange={(e) => setIncludeMinimized(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span>显示最小化窗口</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={onlyVisible}
                onChange={(e) => setOnlyVisible(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span>仅显示可见窗口</span>
            </label>
            
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span>自动刷新</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <label>刷新间隔:</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
              >
                <option value={3000}>3秒</option>
                <option value={5000}>5秒</option>
                <option value={10000}>10秒</option>
                <option value={30000}>30秒</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <label>截图质量:</label>
              <select
                value={captureQuality}
                onChange={(e) => setCaptureQuality(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs"
              >
                <option value={30}>低 (30%)</option>
                <option value={50}>中 (50%)</option>
                <option value={70}>高 (70%)</option>
                <option value={90}>极高 (90%)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 应用程序列表 */}
      <div className="flex-1 overflow-hidden">
        {loading && apps.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-400" />
              <p className="text-gray-400">正在获取应用程序列表...</p>
            </div>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Monitor className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                没有找到应用程序
              </h3>
              <p className="text-gray-500 text-sm">
                {searchTerm ? '尝试修改搜索条件' : '请检查过滤设置或刷新列表'}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-gray-600 transition-all duration-200 ${
                    selectedApp?.id === app.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                >
                  {/* 应用截图 */}
                  <div className="relative h-32 bg-gray-900 flex items-center justify-center">
                    {screenshots[app.id] ? (
                      <img
                        src={`data:image/jpeg;base64,${screenshots[app.id].data}`}
                        alt={app.title}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Monitor className="w-8 h-8 mx-auto mb-2" />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            captureAppScreenshot(app)
                          }}
                          className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                          📷 截图
                        </button>
                      </div>
                    )}
                    
                    {/* 状态指示器 */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {app.isMinimized && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" title="最小化" />
                      )}
                      {!app.isVisible && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" title="不可见" />
                      )}
                      {app.isVisible && !app.isMinimized && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="可见" />
                      )}
                    </div>
                  </div>
                  
                  {/* 应用信息 */}
                  <div className="p-3 space-y-2">
                    <h3 className="font-medium text-sm truncate" title={app.title}>
                      {app.title || 'Unknown Window'}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="truncate" title={app.executable}>
                        {app.executable}
                      </span>
                      <span>PID: {app.pid}</span>
                    </div>
                    
                    {/* 窗口尺寸 */}
                    {app.bounds && (
                      <div className="text-xs text-gray-500">
                        {app.bounds.width} × {app.bounds.height}
                      </div>
                    )}
                    
                    {/* 操作按钮 */}
                    <div className="flex space-x-1 pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          performWindowAction(app, 'focus')
                        }}
                        className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                        title="聚焦窗口"
                      >
                        <ExternalLink className="w-3 h-3 inline mr-1" />
                        聚焦
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          performWindowAction(app, 'minimize')
                        }}
                        className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs transition-colors"
                        title="最小化"
                      >
                        <Minimize2 className="w-3 h-3" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          performWindowAction(app, 'close')
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                        title="关闭窗口"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          captureAppScreenshot(app)
                        }}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs transition-colors"
                        title="截图"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span>平台: {platform}</span>
            <span>应用数: {filteredApps.length}</span>
            {selectedApp && (
              <span>已选择: {selectedApp.title}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span>
              自动刷新: {autoRefresh ? '开启' : '关闭'}
            </span>
            {autoRefresh && (
              <span>间隔: {refreshInterval / 1000}秒</span>
            )}
            <span>FlowerOS 原生应用管理器</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NativeAppManager
