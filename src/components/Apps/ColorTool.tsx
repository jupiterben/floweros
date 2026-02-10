'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Pipette, Copy, ImagePlus, RotateCcw } from 'lucide-react'

type ColorState = { hex: string; r: number; g: number; b: number; h: number; s: number; l: number }

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace(/^#/, '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return null
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100
  let r: number, g: number, b: number
  if (s === 0) r = g = b = l
  else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }
  return { r: r * 255, g: g * 255, b: b * 255 }
}

const defaultColor: ColorState = { hex: '#3b82f6', r: 59, g: 130, b: 246, h: 217, s: 91, l: 60 }

function parseInputToState(hex: string, rgb?: { r: number; g: number; b: number }): ColorState {
  let r: number, g: number, b: number
  if (rgb) {
    r = rgb.r; g = rgb.g; b = rgb.b
    hex = rgbToHex(r, g, b)
  } else {
    const parsed = hexToRgb(hex)
    if (!parsed) return defaultColor
    r = parsed.r; g = parsed.g; b = parsed.b
  }
  const { h, s, l } = rgbToHsl(r, g, b)
  return { hex, r, g, b, h: Math.round(h), s: Math.round(s), l: Math.round(l) }
}

const ColorTool: React.FC = () => {
  const [color, setColor] = useState<ColorState>(defaultColor)
  const [hexInput, setHexInput] = useState(color.hex)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const applyColor = useCallback((next: Partial<ColorState>) => {
    let hex = next.hex ?? color.hex
    let r = next.r ?? color.r, g = next.g ?? color.g, b = next.b ?? color.b
    if (next.hex !== undefined) {
      const rgb = hexToRgb(next.hex)
      if (rgb) { r = rgb.r; g = rgb.g; b = rgb.b }
    } else if (next.r !== undefined || next.g !== undefined || next.b !== undefined) {
      hex = rgbToHex(r, g, b)
    } else if (next.h !== undefined || next.s !== undefined || next.l !== undefined) {
      const h = next.h ?? color.h, s = next.s ?? color.s, l = next.l ?? color.l
      const rgb = hslToRgb(h, s, l)
      r = rgb.r; g = rgb.g; b = rgb.b
      hex = rgbToHex(r, g, b)
    }
    const { h, s, l } = rgbToHsl(r, g, b)
    const state: ColorState = { hex, r: Math.round(r), g: Math.round(g), b: Math.round(b), h: Math.round(h), s: Math.round(s), l: Math.round(l) }
    setColor(state)
    setHexInput(state.hex)
  }, [color])

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 800)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  useEffect(() => {
    if (!imageDataUrl || !canvasRef.current) return
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const max = 280
      let w = img.naturalWidth, h = img.naturalHeight
      if (w > max || h > max) {
        if (w > h) { h = (h / w) * max; w = max } else { w = (w / h) * max; h = max }
      }
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, w, h)
    }
    img.src = imageDataUrl
  }, [imageDataUrl])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !imageDataUrl) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((e.clientX - rect.left) * scaleX)))
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((e.clientY - rect.top) * scaleY)))
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const d = ctx.getImageData(x, y, 1, 1).data
    const r = d[0], g = d[1], b = d[2]
    applyColor(parseInputToState(rgbToHex(r, g, b), { r, g, b }))
  }

  const reset = () => {
    setColor(defaultColor)
    setHexInput(defaultColor.hex)
    setImageDataUrl(null)
  }

  return (
    <div className="h-full w-full min-h-0 overflow-auto p-3 sm:p-4">
      <div className="mx-auto max-w-lg space-y-3 sm:space-y-4">
        {/* 预览 + 取色器 */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg border-2 border-gray-300 shadow-inner" style={{ backgroundColor: color.hex }} />
          <div className="min-w-0 flex-1 space-y-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="color"
                value={color.hex}
                onChange={e => applyColor(parseInputToState(e.target.value))}
                className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded border cursor-pointer"
              />
              <span className="truncate">取色器</span>
            </label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded whitespace-nowrap">
                <ImagePlus size={14} className="shrink-0" /> 从图片取色
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <button type="button" onClick={reset} className="p-1 text-gray-500 hover:text-gray-700 shrink-0" title="重置">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* 从图片取色画布 */}
        {imageDataUrl && (
          <div className="space-y-1 min-w-0">
            <span className="text-sm text-gray-600 flex items-center gap-1"><Pipette size={14} className="shrink-0" /> 点击图片取色</span>
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="max-w-full w-full rounded border border-gray-300 cursor-crosshair block"
              style={{ maxHeight: 'min(40vh, 200px)' }}
            />
          </div>
        )}

        {/* HEX */}
        <div className="flex items-center gap-2 min-w-0">
          <label className="w-10 sm:w-12 shrink-0 text-sm text-gray-600">HEX</label>
          <input
            type="text"
            value={hexInput}
            onChange={e => setHexInput(e.target.value)}
            onBlur={() => applyColor(parseInputToState(hexInput))}
            className="min-w-0 flex-1 px-2 py-1.5 border rounded font-mono text-sm"
            placeholder="#000000"
          />
          <button type="button" onClick={() => copy(color.hex, 'hex')} className="p-1.5 rounded hover:bg-gray-100 shrink-0" title="复制">
            <Copy size={14} /> {copied === 'hex' ? '✓' : ''}
          </button>
        </div>

        {/* RGB */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <label className="w-10 sm:w-12 shrink-0 text-sm text-gray-600">RGB</label>
          {(['r', 'g', 'b'] as const).map(ch => (
            <input
              key={ch}
              type="number"
              min={0}
              max={255}
              value={color[ch]}
              onChange={e => applyColor({ [ch]: parseInt(e.target.value, 10) || 0 })}
              className="w-12 sm:w-16 min-w-0 px-2 py-1.5 border rounded text-sm"
            />
          ))}
          <span className="text-sm text-gray-500 font-mono truncate min-w-0">rgb({color.r}, {color.g}, {color.b})</span>
          <button type="button" onClick={() => copy(`rgb(${color.r}, ${color.g}, ${color.b})`, 'rgb')} className="p-1.5 rounded hover:bg-gray-100 shrink-0">
            <Copy size={14} /> {copied === 'rgb' ? '✓' : ''}
          </button>
        </div>

        {/* HSL */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <label className="w-10 sm:w-12 shrink-0 text-sm text-gray-600">HSL</label>
          <input type="number" min={0} max={360} value={color.h} onChange={e => applyColor({ h: parseInt(e.target.value, 10) || 0 })} className="w-12 sm:w-14 min-w-0 px-2 py-1.5 border rounded text-sm" />
          <input type="number" min={0} max={100} value={color.s} onChange={e => applyColor({ s: parseInt(e.target.value, 10) || 0 })} className="w-12 sm:w-14 min-w-0 px-2 py-1.5 border rounded text-sm" />
          <input type="number" min={0} max={100} value={color.l} onChange={e => applyColor({ l: parseInt(e.target.value, 10) || 0 })} className="w-12 sm:w-14 min-w-0 px-2 py-1.5 border rounded text-sm" />
          <span className="text-sm text-gray-500 font-mono truncate min-w-0">hsl({color.h}, {color.s}%, {color.l}%)</span>
          <button type="button" onClick={() => copy(`hsl(${color.h}, ${color.s}%, ${color.l}%)`, 'hsl')} className="p-1.5 rounded hover:bg-gray-100 shrink-0">
            <Copy size={14} /> {copied === 'hsl' ? '✓' : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ColorTool
