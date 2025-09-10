import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface FileItem {
  name: string
  type: 'file' | 'folder'
  size?: string
  modified: string
  path: string
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function isValidPath(requestedPath: string): boolean {
  // 安全检查：防止访问系统敏感目录
  const dangerousPaths = [
    'C:\\Windows',
    'C:\\Program Files',
    'C:\\System',
    '/etc',
    '/var',
    '/usr/bin',
    '/bin',
    '/sbin'
  ]
  
  const normalizedPath = path.normalize(requestedPath)
  return !dangerousPaths.some(dangerous => 
    normalizedPath.toLowerCase().startsWith(dangerous.toLowerCase())
  )
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedPath = searchParams.get('path') || process.cwd()
    
    // 安全检查
    if (!isValidPath(requestedPath)) {
      return NextResponse.json(
        { error: '无法访问此目录' },
        { status: 403 }
      )
    }

    const resolvedPath = path.resolve(requestedPath)
    
    // 检查路径是否存在
    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json(
        { error: '路径不存在' },
        { status: 404 }
      )
    }

    const stats = fs.statSync(resolvedPath)
    
    if (!stats.isDirectory()) {
      return NextResponse.json(
        { error: '请求的路径不是目录' },
        { status: 400 }
      )
    }

    const items = fs.readdirSync(resolvedPath)
    const fileList: FileItem[] = []

    for (const item of items) {
      try {
        const itemPath = path.join(resolvedPath, item)
        const itemStats = fs.statSync(itemPath)
        
        // 跳过隐藏文件（以.开头的文件）
        if (item.startsWith('.')) continue
        
        fileList.push({
          name: item,
          type: itemStats.isDirectory() ? 'folder' : 'file',
          size: itemStats.isFile() ? formatFileSize(itemStats.size) : undefined,
          modified: itemStats.mtime.toLocaleDateString('zh-CN'),
          path: itemPath
        })
      } catch (error) {
        // 跳过无法访问的文件
        continue
      }
    }

    // 排序：文件夹在前，然后按名称排序
    fileList.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1
      }
      return a.name.localeCompare(b.name, 'zh-CN')
    })

    return NextResponse.json({
      currentPath: resolvedPath,
      files: fileList,
      parentPath: path.dirname(resolvedPath)
    })

  } catch (error) {
    console.error('文件系统访问错误:', error)
    return NextResponse.json(
      { error: '无法读取目录内容' },
      { status: 500 }
    )
  }
}
