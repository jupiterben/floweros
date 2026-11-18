'use client'

import React, { useState, useEffect } from 'react'
import { Copy, RefreshCw } from 'lucide-react'

const TimestampConverter: React.FC = () => {
  const [timestampInput, setTimestampInput] = useState('')
  const [dateResult, setDateResult] = useState<string | null>(null)
  const [dateInput, setDateInput] = useState('')
  const [timestampResult, setTimestampResult] = useState<string | null>(null)
  const [unit, setUnit] = useState<'s' | 'ms'>('s')
  const [copied, setCopied] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 800)
  }

  useEffect(() => {
    const raw = timestampInput.trim()
    if (!raw) {
      setDateResult(null)
      return
    }
    const num = parseInt(raw, 10)
    if (Number.isNaN(num)) {
      setDateResult('无效数字')
      return
    }
    const ms = unit === 's' ? num * 1000 : num
    const d = new Date(ms)
    if (Number.isNaN(d.getTime())) {
      setDateResult('超出范围')
      return
    }
    setDateResult(d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }))
  }, [timestampInput, unit])

  useEffect(() => {
    const raw = dateInput.trim()
    if (!raw) {
      setTimestampResult(null)
      return
    }
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) {
      setTimestampResult('无效日期')
      return
    }
    const ts = unit === 's' ? Math.floor(d.getTime() / 1000) : d.getTime()
    setTimestampResult(String(ts))
  }, [dateInput, unit])

  const useNow = () => {
    const ts = unit === 's' ? Math.floor(now / 1000) : now
    setTimestampInput(String(ts))
  }

  return (
    <div className="h-full w-full min-h-0 overflow-auto p-3 sm:p-4">
      <div className="mx-auto max-w-md space-y-4">
        {/* 当前时间 */}
        <div className="flex items-center justify-between gap-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <span className="text-sm text-gray-600 dark:text-gray-400">当前时间</span>
          <span className="font-mono text-sm">
            {new Date(now).toLocaleString('zh-CN', { hour12: false })}
          </span>
          <button
            type="button"
            onClick={useNow}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            title="使用当前时间"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* 单位切换 */}
        <div className="flex gap-2">
          {(['s', 'ms'] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                unit === u
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              {u === 's' ? '秒' : '毫秒'}
            </button>
          ))}
        </div>

        {/* 时间戳 → 日期 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">时间戳 → 日期</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={timestampInput}
              onChange={(e) => setTimestampInput(e.target.value)}
              placeholder={unit === 's' ? '如 1707782400' : '如 1707782400000'}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            />
          </div>
          {dateResult && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{dateResult}</span>
              <button
                type="button"
                onClick={() => copy(dateResult, 'date')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                title="复制"
              >
                <Copy className="w-4 h-4" />
              </button>
              {copied === 'date' && <span className="text-xs text-green-600">已复制</span>}
            </div>
          )}
        </div>

        {/* 日期 → 时间戳 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">日期 → 时间戳</label>
          <input
            type="text"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            placeholder="如 2024-02-14 00:00:00 或 ISO 格式"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
          />
          {timestampResult && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{timestampResult}</span>
              <button
                type="button"
                onClick={() => copy(timestampResult, 'ts')}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                title="复制"
              >
                <Copy className="w-4 h-4" />
              </button>
              {copied === 'ts' && <span className="text-xs text-green-600">已复制</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TimestampConverter
