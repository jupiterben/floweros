'use client'

import React, { useState, useEffect } from 'react'
import { Folder, File, ArrowLeft, Home, Search, RefreshCw, AlertCircle } from 'lucide-react'

interface FileItem {
  name: string
  type: 'file' | 'folder'
  size?: string
  modified: string
  path: string
}

interface FileResponse {
  currentPath: string
  files: FileItem[]
  parentPath: string
}

const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchFiles = async (path?: string) => {
    setLoading(true)
    setError(null)

    try {
      const targetPath = path || currentPath
      const response = await fetch(`/api/files?path=${encodeURIComponent(targetPath)}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '获取文件列表失败')
      }

      const data: FileResponse = await response.json()
      setFiles(data.files)
      setCurrentPath(data.currentPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误')
      setFiles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [])

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      fetchFiles(file.path)
    }
  }

  const handleBackClick = async () => {
    try {
      const response = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`)
      if (response.ok) {
        const data: FileResponse = await response.json()
        if (data.parentPath !== currentPath) {
          fetchFiles(data.parentPath)
        }
      }
    } catch (err) {
      console.error('导航失败:', err)
    }
  }

  const handleHomeClick = () => {
    fetchFiles('')  // 空字符串将使用服务器的当前工作目录
  }

  const handleRefresh = () => {
    fetchFiles(currentPath)
  }

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center space-x-2 p-2 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={handleBackClick}
          disabled={loading}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="返回上级"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleHomeClick}
          disabled={loading}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="主目录"
        >
          <Home className="w-4 h-4" />
        </button>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
          title="刷新"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
        <div className="flex-1 mx-2">
          <div className="flex items-center bg-gray-100 rounded px-3 py-1">
            <Search className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="搜索文件..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* 地址栏 */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <span className="text-sm text-gray-600 truncate">当前位置: {currentPath || '加载中...'}</span>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden min-h-0">{/* Changed from overflow-auto to overflow-hidden */}
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span className="text-gray-600">加载中...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
            <span className="text-red-600">{error}</span>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-gray-500">
              {searchTerm ? '未找到匹配的文件' : '此目录为空'}
            </span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 表头 */}
            <div className="grid grid-cols-[1fr_96px_128px] gap-4 p-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
              <div>名称</div>
              <div>大小</div>
              <div>修改时间</div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-auto min-h-0" >
              {filteredFiles.map((file, index) => (
                <div
                  key={index}
                  onClick={() => handleFileClick(file)}
                  className="grid grid-cols-[1fr_96px_128px] gap-4 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center min-w-0">
                    {file.type === 'folder' ? (
                      <Folder className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
                    ) : (
                      <File className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                    )}
                    <span className="text-sm truncate" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{file.size || '-'}</div>
                  <div className="text-sm text-gray-600">{file.modified}</div>
                </div>
              ))}

              {/* 添加填充行以确保滚动条可见 */}
              {filteredFiles.length < 10 && Array.from({ length: Math.max(0, 10 - filteredFiles.length) }).map((_, index) => (
                <div key={`empty-${index}`} className="grid grid-cols-[1fr_96px_128px] gap-4 p-3 opacity-0">
                  <div>&nbsp;</div>
                  <div>&nbsp;</div>
                  <div>&nbsp;</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileManager
