'use client'

import React, { useState, useEffect } from 'react'
import { Folder, File, ArrowLeft, Home, Search, RefreshCw, AlertCircle, Grid3X3, List } from 'lucide-react'
import { HLayout, SpanItem, VLayout, GridLayout } from '../WindowManager/Layout'

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

interface ViewProps {
  files: FileItem[]
  onFileClick: (file: FileItem) => void
}

const DetailView: React.FC<ViewProps> = ({ files, onFileClick }) => {
  return (
    <VLayout>
      {/* 表头 */}
      <div className="w-full grid grid-cols-[1fr_96px_128px] gap-4 p-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
        <div>名称</div>
        <div>大小</div>
        <div>修改时间</div>
      </div>

      {/* 文件列表 */}
      <VLayout>
        {files.map((file, index) => (
          <div
            key={index}
            onClick={() => onFileClick(file)}
            className="grid grid-cols-[1fr_96px_128px] gap-4 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
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
        <SpanItem />
      </VLayout>
    </VLayout>
  )
}

const GridView: React.FC<ViewProps> = ({ files, onFileClick }) => {
  return (
    <div className="p-4">
      <GridLayout cols="auto" gap={4} minColWidth={100}>
        {files.map((file, index) => (
          <div
            key={index}
            onClick={() => onFileClick(file)}
            className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group"
          >
            <div className="mb-2">
              {file.type === 'folder' ? (
                <Folder className="w-12 h-12 text-blue-500 group-hover:text-blue-600" />
              ) : (
                <File className="w-12 h-12 text-gray-500 group-hover:text-gray-600" />
              )}
            </div>
            <div className="text-center">
              <div className="text-xs truncate w-16 mb-1" title={file.name}>
                {file.name}
              </div>
              {file.size && (
                <div className="text-xs text-gray-500">
                  {file.size}
                </div>
              )}
            </div>
          </div>
        ))}
      </GridLayout>
    </div>
  )
}



type ViewType = 'detail' | 'grid'

const FileManager: React.FC = () => {
  const [currentPath, setCurrentPath] = useState('')
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewType, setViewType] = useState<ViewType>('detail')

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
    <VLayout>
      {/* 工具栏 */}
      <HLayout className="flex items-center space-x-2 p-2 border-b border-gray-200 flex-shrink-0">
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
        
        {/* 视图切换按钮 */}
        <div className="flex border border-gray-300 rounded overflow-hidden">
          <button
            onClick={() => setViewType('detail')}
            className={`p-2 ${viewType === 'detail' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'}`}
            title="详细视图"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewType('grid')}
            className={`p-2 ${viewType === 'grid' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-50'}`}
            title="网格视图"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
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
      </HLayout>

      {/* 地址栏 */}
      <HLayout className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <span className="text-sm text-gray-600 truncate">当前位置: {currentPath || '加载中...'}</span>
      </HLayout>

      {/* 内容区域 */}
      <VLayout>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">加载中...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
            <span className="text-red-500">{error}</span>
          </div>
        ) : (
          <>
            {viewType === 'detail' ? (
              <DetailView files={filteredFiles} onFileClick={handleFileClick} />
            ) : (
              <GridView files={filteredFiles} onFileClick={handleFileClick} />
            )}
          </>
        )}
      </VLayout>
    </VLayout>
  )
}

export default FileManager
