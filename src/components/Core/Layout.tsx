import React from 'react'

interface LayoutProps {
    children?: React.ReactNode
    className?: string
}

interface GridLayoutProps extends LayoutProps {
    cols?: number | 'auto'
    rows?: number
    gap?: number
    minColWidth?: number // 最小列宽 (px)
}

export const HLayout = ({ children, className = '' }: LayoutProps) => {
    return (
        <div className={`flex flex-row overflow-x-auto w-full ${className}`}>
            {children}
        </div>
    )
}

export const VLayout = ({ children, className = '' }: LayoutProps) => {
    return (
        <div className={`flex flex-col overflow-y-auto h-full ${className}`}>
            {children}
        </div>
    )
}

export const GridLayout = ({
    children,
    className = '',
    cols = 2,
    rows,
    gap = 4,
    minColWidth = 120
}: GridLayoutProps) => {
    const getGridCols = (cols: number | 'auto') => {
        // 自动列配置
        if (cols === 'auto') {
            return `grid-cols-[repeat(auto-fill,minmax(${minColWidth}px,1fr))]`
        }
        
        // 固定列数配置
        const colsMap: { [key: number]: string } = {
            1: 'grid-cols-1',
            2: 'grid-cols-2',
            3: 'grid-cols-3',
            4: 'grid-cols-4',
            5: 'grid-cols-5',
            6: 'grid-cols-6',
            7: 'grid-cols-7',
            8: 'grid-cols-8',
            9: 'grid-cols-9',
            10: 'grid-cols-10',
            11: 'grid-cols-11',
            12: 'grid-cols-12'
        }
        return colsMap[cols as number] || 'grid-cols-2'
    }

    const getGridRows = (rows?: number) => {
        if (!rows) return ''
        const rowsMap: { [key: number]: string } = {
            1: 'grid-rows-1',
            2: 'grid-rows-2',
            3: 'grid-rows-3',
            4: 'grid-rows-4',
            5: 'grid-rows-5',
            6: 'grid-rows-6'
        }
        return rowsMap[rows] || ''
    }

    const getGap = (gap: number) => {
        const gapMap: { [key: number]: string } = {
            0: 'gap-0',
            1: 'gap-1',
            2: 'gap-2',
            3: 'gap-3',
            4: 'gap-4',
            5: 'gap-5',
            6: 'gap-6',
            8: 'gap-8',
            10: 'gap-10',
            12: 'gap-12'
        }
        return gapMap[gap] || 'gap-4'
    }

    const gridClasses = [
        'grid',
        getGridCols(cols),
        getGridRows(rows),
        getGap(gap),
        className
    ].filter(Boolean).join(' ')

    return (
        <div className={gridClasses}>
            {children}
        </div>
    )
}

export const SpanItem = ({ children, className = '' }: LayoutProps) => {
    return (
        <span className={`flex-1 ${className}`}>
            {children}
        </span>
    )
}