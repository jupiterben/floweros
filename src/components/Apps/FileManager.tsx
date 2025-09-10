'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Folder, File, ArrowLeft, Home, Search, RefreshCw, AlertCircle, Grid3X3, List, ArrowUp } from 'lucide-react'
import { HLayout, SpanItem, VLayout, GridLayout } from '../Core/Layout'
import { Table, ColumnDef, SortConfig } from '../Core/Table'

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

interface DetailViewProps extends ViewProps {
  onSort?: (sortConfig: SortConfig) => void
}

const DetailView: React.FC<DetailViewProps> = ({ files, onFileClick, onSort }) => {
  // 定义表格列配置
  const columns: ColumnDef<FileItem>[] = useMemo(() => [
    {
      id: 'name',
      header: '名称',
      accessor: 'name',
      sortable: true,
      resizable: true,
      width: 300,
      minWidth: 200,
      render: (value: string, file: FileItem) => (
        <div className="flex items-center min-w-0">
          {file.name === '..' ? (
            <ArrowUp className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" />
          ) : file.type === 'folder' ? (
            <Folder className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
          ) : (
            <File className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
          )}
          <span className={`text-sm truncate ${file.name === '..' ? 'text-orange-600 font-medium' : ''}`} title={value}>
            {file.name === '..' ? '返回上级目录' : value}
          </span>
        </div>
      )
    },
    {
      id: 'size',
      header: '大小',
      accessor: 'size',
      sortable: true,
      resizable: true,
      width: 96,
      minWidth: 80,
      render: (value: string | undefined) => (
        <span className="text-sm text-gray-600">
          {value || '-'}
        </span>
      )
    },
    {
      id: 'modified',
      header: '修改时间',
      accessor: 'modified',
      sortable: true,
      resizable: true,
      width: 160,
      minWidth: 120,
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value}
        </span>
      )
    }
  ], [])

  return (
    <Table
      data={files}
      columns={columns}
      sortable={true}
      resizable={true}
      draggable={true}
      onSort={onSort}
      onRowClick={(file) => onFileClick(file)}
      emptyMessage="该文件夹为空"
      className="h-full"
    />
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
              {file.name === '..' ? (
                <ArrowUp className="w-12 h-12 text-orange-500 group-hover:text-orange-600" />
              ) : file.type === 'folder' ? (
                <Folder className="w-12 h-12 text-blue-500 group-hover:text-blue-600" />
              ) : (
                <File className="w-12 h-12 text-gray-500 group-hover:text-gray-600" />
              )}
            </div>
            <div className="text-center">
              <div className={`text-xs truncate w-16 mb-1 ${file.name === '..' ? 'text-orange-600 font-medium' : ''}`} title={file.name}>
                {file.name === '..' ? '上级' : file.name}
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
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: null })

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
      if (file.name === '..') {
        // 返回上级目录
        const parentPath = getParentPath(currentPath)
        fetchFiles(parentPath)
      } else {
        fetchFiles(file.path)
      }
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

  // 处理排序
  const handleSort = (newSortConfig: SortConfig) => {
    setSortConfig(newSortConfig)
  }

  // 获取父目录路径
  const getParentPath = (path: string): string => {
    if (!path || path === '/') return ''
    const parts = path.replace(/\\/g, '/').split('/').filter(Boolean)
    if (parts.length <= 1) return ''
    return parts.slice(0, -1).join('/')
  }

  // 排序和过滤文件
  const sortedAndFilteredFiles = useMemo(() => {
    let result = files.filter(file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // 添加返回上级目录项（当不在根目录且没有搜索时）
    if (currentPath && !searchTerm) {
      const parentPath = getParentPath(currentPath)
      const parentItem: FileItem = {
        name: '..',
        type: 'folder',
        size: '',
        modified: '',
        path: parentPath
      }
      result.unshift(parentItem)
    }

    if (sortConfig.column && sortConfig.direction) {
      result.sort((a, b) => {
        // ".." 目录始终排在最前面
        if (a.name === '..') return -1
        if (b.name === '..') return 1

        let aValue: any = ''
        let bValue: any = ''

        switch (sortConfig.column) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'size':
            // 将大小转换为数字进行比较，文件夹排在前面
            if (a.type === 'folder' && b.type === 'file') return -1
            if (a.type === 'file' && b.type === 'folder') return 1
            aValue = a.size ? parseFloat(a.size.replace(/[^0-9.]/g, '')) : 0
            bValue = b.size ? parseFloat(b.size.replace(/[^0-9.]/g, '')) : 0
            break
          case 'modified':
            aValue = new Date(a.modified).getTime()
            bValue = new Date(b.modified).getTime()
            break
          default:
            return 0
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    } else {
      // 默认排序：".." 在最前，然后文件夹在前，最后按名称排序
      result.sort((a, b) => {
        if (a.name === '..') return -1
        if (b.name === '..') return 1
        if (a.type === 'folder' && b.type === 'file') return -1
        if (a.type === 'file' && b.type === 'folder') return 1
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      })
    }

    return result
  }, [files, searchTerm, sortConfig, currentPath])

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
              <DetailView 
                files={sortedAndFilteredFiles} 
                onFileClick={handleFileClick}
                onSort={handleSort}
              />
            ) : (
              <GridView files={sortedAndFilteredFiles} onFileClick={handleFileClick} />
            )}
          </>
        )}
      </VLayout>
    </VLayout>
  )
}

export default FileManager
