'use client'

import React, { useState, useRef, useCallback } from 'react'
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react'

// 列定义接口
export interface ColumnDef<T = any> {
  id: string
  header: string
  accessor: keyof T | ((row: T) => any)
  width?: number
  minWidth?: number
  maxWidth?: number
  sortable?: boolean
  resizable?: boolean
  render?: (value: any, row: T, index: number) => React.ReactNode
}

// 排序配置
export interface SortConfig {
  column: string
  direction: 'asc' | 'desc' | null
}

// Table组件属性
export interface TableProps<T = any> {
  data: T[]
  columns: ColumnDef<T>[]
  className?: string
  headerClassName?: string
  rowClassName?: string | ((row: T, index: number) => string)
  sortable?: boolean
  resizable?: boolean
  draggable?: boolean
  onSort?: (sortConfig: SortConfig) => void
  onRowClick?: (row: T, index: number) => void
  onColumnReorder?: (newOrder: string[]) => void
  loading?: boolean
  emptyMessage?: string
}

// 拖拽状态
interface DragState {
  isDragging: boolean
  draggedColumn: string | null
  dragOverColumn: string | null
}

export const Table = <T,>({
  data,
  columns: initialColumns,
  className = '',
  headerClassName = '',
  rowClassName = '',
  sortable = true,
  resizable = true,
  draggable = true,
  onSort,
  onRowClick,
  onColumnReorder,
  loading = false,
  emptyMessage = '暂无数据'
}: TableProps<T>) => {
  const [columns, setColumns] = useState(initialColumns)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: '', direction: null })
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedColumn: null,
    dragOverColumn: null
  })
  const [resizing, setResizing] = useState<{ column: string; startX: number; startWidth: number } | null>(null)
  
  const tableRef = useRef<HTMLTableElement>(null)

  // 处理排序
  const handleSort = useCallback((columnId: string) => {
    if (!sortable) return

    const column = columns.find(col => col.id === columnId)
    if (!column?.sortable) return

    let direction: 'asc' | 'desc' | null = 'asc'
    if (sortConfig.column === columnId) {
      direction = sortConfig.direction === 'asc' ? 'desc' : sortConfig.direction === 'desc' ? null : 'asc'
    }

    const newSortConfig = { column: columnId, direction }
    setSortConfig(newSortConfig)
    onSort?.(newSortConfig)
  }, [columns, sortConfig, sortable, onSort])

  // 处理列拖拽开始
  const handleDragStart = useCallback((e: React.DragEvent, columnId: string) => {
    if (!draggable) return
    
    e.dataTransfer.effectAllowed = 'move'
    setDragState({
      isDragging: true,
      draggedColumn: columnId,
      dragOverColumn: null
    })
  }, [draggable])

  // 处理拖拽悬停
  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    if (!dragState.isDragging || !dragState.draggedColumn) return
    
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    
    if (columnId !== dragState.draggedColumn) {
      setDragState(prev => ({ ...prev, dragOverColumn: columnId }))
    }
  }, [dragState])

  // 处理列拖拽结束
  const handleDrop = useCallback((e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    
    const { draggedColumn } = dragState
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDragState({ isDragging: false, draggedColumn: null, dragOverColumn: null })
      return
    }

    const newColumns = [...columns]
    const draggedIndex = newColumns.findIndex(col => col.id === draggedColumn)
    const targetIndex = newColumns.findIndex(col => col.id === targetColumnId)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const [draggedCol] = newColumns.splice(draggedIndex, 1)
      newColumns.splice(targetIndex, 0, draggedCol)
      
      setColumns(newColumns)
      onColumnReorder?.(newColumns.map(col => col.id))
    }

    setDragState({ isDragging: false, draggedColumn: null, dragOverColumn: null })
  }, [dragState, columns, onColumnReorder])

  // 处理列宽调整开始
  const handleResizeStart = useCallback((e: React.MouseEvent, columnId: string) => {
    if (!resizable) return
    
    e.preventDefault()
    const column = columns.find(col => col.id === columnId)
    if (!column?.resizable) return

    const startX = e.clientX
    const startWidth = column.width || 150

    setResizing({ column: columnId, startX, startWidth })
  }, [resizable, columns])

  // 处理列宽调整
  const handleResize = useCallback((e: MouseEvent) => {
    if (!resizing) return

    const deltaX = e.clientX - resizing.startX
    const newWidth = Math.max(50, resizing.startWidth + deltaX)
    
    setColumns(prev => prev.map(col => 
      col.id === resizing.column 
        ? { ...col, width: Math.min(newWidth, col.maxWidth || 500) }
        : col
    ))
  }, [resizing])

  // 处理列宽调整结束
  const handleResizeEnd = useCallback(() => {
    setResizing(null)
  }, [])

  // 监听鼠标事件
  React.useEffect(() => {
    if (resizing) {
      document.addEventListener('mousemove', handleResize)
      document.addEventListener('mouseup', handleResizeEnd)
      return () => {
        document.removeEventListener('mousemove', handleResize)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [resizing, handleResize, handleResizeEnd])

  // 获取单元格值
  const getCellValue = useCallback((row: T, column: ColumnDef<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row)
    }
    return row[column.accessor as keyof T]
  }, [])

  // 渲染排序图标
  const renderSortIcon = (columnId: string) => {
    if (!sortable) return null
    
    const column = columns.find(col => col.id === columnId)
    if (!column?.sortable) return null

    if (sortConfig.column === columnId) {
      return sortConfig.direction === 'asc' ? (
        <ChevronUp className="w-4 h-4 ml-1" />
      ) : sortConfig.direction === 'desc' ? (
        <ChevronDown className="w-4 h-4 ml-1" />
      ) : null
    }
    
    return <div className="w-4 h-4 ml-1" />
  }

  return (
    <div className={`overflow-auto ${className}`}>
      <table ref={tableRef} className="w-full border-collapse">
        <thead>
          <tr className={`bg-gray-50 border-b border-gray-200 ${headerClassName}`}>
            {columns.map((column, index) => (
              <th
                key={column.id}
                draggable={draggable}
                onDragStart={(e) => handleDragStart(e, column.id)}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id)}
                className={`
                  relative px-4 py-3 text-left text-sm font-medium text-gray-600 select-none
                  ${sortable && column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                  ${draggable ? 'cursor-move' : ''}
                  ${dragState.dragOverColumn === column.id ? 'bg-blue-100' : ''}
                  ${dragState.draggedColumn === column.id ? 'opacity-50' : ''}
                `}
                style={{ 
                  width: column.width || 'auto',
                  minWidth: column.minWidth || 50,
                  maxWidth: column.maxWidth || 'none'
                }}
                onClick={() => handleSort(column.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {draggable && (
                      <GripVertical className="w-4 h-4 mr-2 text-gray-400" />
                    )}
                    <span>{column.header}</span>
                    {renderSortIcon(column.id)}
                  </div>
                  
                  {/* 列宽调整手柄 */}
                  {resizable && column.resizable !== false && (
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 opacity-0 hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleResizeStart(e, column.id)}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2" />
                  加载中...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={`
                  border-b border-gray-100 hover:bg-gray-50 transition-colors
                  ${onRowClick ? 'cursor-pointer' : ''}
                  ${typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName}
                `}
              >
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className="px-4 py-3 text-sm text-gray-900"
                    style={{ 
                      width: column.width || 'auto',
                      minWidth: column.minWidth || 50,
                      maxWidth: column.maxWidth || 'none'
                    }}
                  >
                    {column.render ? 
                      column.render(getCellValue(row, column), row, rowIndex) : 
                      String(getCellValue(row, column) || '')
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
