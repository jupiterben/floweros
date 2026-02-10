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

// W3C CSS Color Module Level 3 扩展颜色关键字（SVG 1.0）+ rebeccapurple，hex 小写，en 为 CSS 关键字
const COLOR_NAMES: { hex: string; en: string; zh: string }[] = [
  { hex: '#f0f8ff', en: 'aliceblue', zh: '爱丽丝蓝' },
  { hex: '#faebd7', en: 'antiquewhite', zh: '古董白' },
  { hex: '#00ffff', en: 'aqua', zh: '青色' },
  { hex: '#7fffd4', en: 'aquamarine', zh: '碧绿' },
  { hex: '#f0ffff', en: 'azure', zh: '天蓝' },
  { hex: '#f5f5dc', en: 'beige', zh: '米色' },
  { hex: '#ffe4c4', en: 'bisque', zh: '橘黄' },
  { hex: '#000000', en: 'black', zh: '黑色' },
  { hex: '#ffebcd', en: 'blanchedalmond', zh: '杏仁白' },
  { hex: '#0000ff', en: 'blue', zh: '蓝色' },
  { hex: '#8a2be2', en: 'blueviolet', zh: '蓝紫' },
  { hex: '#a52a2a', en: 'brown', zh: '棕色' },
  { hex: '#deb887', en: 'burlywood', zh: '原木色' },
  { hex: '#5f9ea0', en: 'cadetblue', zh: '军蓝' },
  { hex: '#7fff00', en: 'chartreuse', zh: '黄绿' },
  { hex: '#d2691e', en: 'chocolate', zh: '巧克力色' },
  { hex: '#ff7f50', en: 'coral', zh: '珊瑚色' },
  { hex: '#6495ed', en: 'cornflowerblue', zh: '矢车菊蓝' },
  { hex: '#fff8dc', en: 'cornsilk', zh: '玉米丝色' },
  { hex: '#dc143c', en: 'crimson', zh: '深红' },
  { hex: '#00ffff', en: 'cyan', zh: '青色' },
  { hex: '#00008b', en: 'darkblue', zh: '深蓝' },
  { hex: '#008b8b', en: 'darkcyan', zh: '深青' },
  { hex: '#b8860b', en: 'darkgoldenrod', zh: '深金菊' },
  { hex: '#a9a9a9', en: 'darkgray', zh: '深灰' },
  { hex: '#006400', en: 'darkgreen', zh: '深绿' },
  { hex: '#bdb76b', en: 'darkkhaki', zh: '深卡其' },
  { hex: '#8b008b', en: 'darkmagenta', zh: '深洋红' },
  { hex: '#556b2f', en: 'darkolivegreen', zh: '深橄榄绿' },
  { hex: '#ff8c00', en: 'darkorange', zh: '深橙' },
  { hex: '#9932cc', en: 'darkorchid', zh: '深兰紫' },
  { hex: '#8b0000', en: 'darkred', zh: '深红' },
  { hex: '#e9967a', en: 'darksalmon', zh: '深鲑红' },
  { hex: '#8fbc8f', en: 'darkseagreen', zh: '深海绿' },
  { hex: '#483d8b', en: 'darkslateblue', zh: '深板岩蓝' },
  { hex: '#2f4f4f', en: 'darkslategray', zh: '深板岩灰' },
  { hex: '#00ced1', en: 'darkturquoise', zh: '深青绿' },
  { hex: '#9400d3', en: 'darkviolet', zh: '深紫' },
  { hex: '#ff1493', en: 'deeppink', zh: '深粉' },
  { hex: '#00bfff', en: 'deepskyblue', zh: '深天蓝' },
  { hex: '#696969', en: 'dimgray', zh: '暗灰' },
  { hex: '#1e90ff', en: 'dodgerblue', zh: '道奇蓝' },
  { hex: '#b22222', en: 'firebrick', zh: '砖红' },
  { hex: '#fffaf0', en: 'floralwhite', zh: '花白' },
  { hex: '#228b22', en: 'forestgreen', zh: '森林绿' },
  { hex: '#ff00ff', en: 'fuchsia', zh: '洋红' },
  { hex: '#dcdcdc', en: 'gainsboro', zh: '庚斯伯勒灰' },
  { hex: '#f8f8ff', en: 'ghostwhite', zh: '幽灵白' },
  { hex: '#ffd700', en: 'gold', zh: '金色' },
  { hex: '#daa520', en: 'goldenrod', zh: '金菊' },
  { hex: '#808080', en: 'gray', zh: '灰色' },
  { hex: '#008000', en: 'green', zh: '绿色' },
  { hex: '#adff2f', en: 'greenyellow', zh: '黄绿' },
  { hex: '#f0fff0', en: 'honeydew', zh: '蜜瓜色' },
  { hex: '#ff69b4', en: 'hotpink', zh: '亮粉' },
  { hex: '#cd5c5c', en: 'indianred', zh: '印度红' },
  { hex: '#4b0082', en: 'indigo', zh: '靛蓝' },
  { hex: '#fffff0', en: 'ivory', zh: '象牙白' },
  { hex: '#f0e68c', en: 'khaki', zh: '卡其' },
  { hex: '#e6e6fa', en: 'lavender', zh: '薰衣草' },
  { hex: '#fff0f5', en: 'lavenderblush', zh: '薰衣草红' },
  { hex: '#7cfc00', en: 'lawngreen', zh: '草坪绿' },
  { hex: '#fffacd', en: 'lemonchiffon', zh: '柠檬绸' },
  { hex: '#add8e6', en: 'lightblue', zh: '浅蓝' },
  { hex: '#f08080', en: 'lightcoral', zh: '浅珊瑚' },
  { hex: '#e0ffff', en: 'lightcyan', zh: '浅青' },
  { hex: '#fafad2', en: 'lightgoldenrodyellow', zh: '浅金菊黄' },
  { hex: '#d3d3d3', en: 'lightgray', zh: '浅灰' },
  { hex: '#90ee90', en: 'lightgreen', zh: '浅绿' },
  { hex: '#ffb6c1', en: 'lightpink', zh: '浅粉' },
  { hex: '#ffa07a', en: 'lightsalmon', zh: '浅鲑红' },
  { hex: '#20b2aa', en: 'lightseagreen', zh: '浅海绿' },
  { hex: '#87cefa', en: 'lightskyblue', zh: '浅天蓝' },
  { hex: '#778899', en: 'lightslategray', zh: '浅板岩灰' },
  { hex: '#b0c4de', en: 'lightsteelblue', zh: '浅钢青' },
  { hex: '#ffffe0', en: 'lightyellow', zh: '浅黄' },
  { hex: '#00ff00', en: 'lime', zh: '酸橙绿' },
  { hex: '#32cd32', en: 'limegreen', zh: '柠檬绿' },
  { hex: '#faf0e6', en: 'linen', zh: '亚麻色' },
  { hex: '#ff00ff', en: 'magenta', zh: '洋红' },
  { hex: '#800000', en: 'maroon', zh: '栗色' },
  { hex: '#66cdaa', en: 'mediumaquamarine', zh: '中碧绿' },
  { hex: '#0000cd', en: 'mediumblue', zh: '中蓝' },
  { hex: '#ba55d3', en: 'mediumorchid', zh: '中兰紫' },
  { hex: '#9370db', en: 'mediumpurple', zh: '中紫' },
  { hex: '#3cb371', en: 'mediumseagreen', zh: '中海绿' },
  { hex: '#7b68ee', en: 'mediumslateblue', zh: '中板岩蓝' },
  { hex: '#00fa9a', en: 'mediumspringgreen', zh: '中春绿' },
  { hex: '#48d1cc', en: 'mediumturquoise', zh: '中青绿' },
  { hex: '#c71585', en: 'mediumvioletred', zh: '中紫红' },
  { hex: '#191970', en: 'midnightblue', zh: '午夜蓝' },
  { hex: '#f5fffa', en: 'mintcream', zh: '薄荷乳白' },
  { hex: '#ffe4e1', en: 'mistyrose', zh: '雾玫瑰' },
  { hex: '#ffe4b5', en: 'moccasin', zh: '鹿皮鞋色' },
  { hex: '#ffdead', en: 'navajowhite', zh: '纳瓦白' },
  { hex: '#000080', en: 'navy', zh: '藏青' },
  { hex: '#fdf5e6', en: 'oldlace', zh: '旧蕾丝色' },
  { hex: '#808000', en: 'olive', zh: '橄榄绿' },
  { hex: '#6b8e23', en: 'olivedrab', zh: '橄榄褐' },
  { hex: '#ffa500', en: 'orange', zh: '橙色' },
  { hex: '#ff4500', en: 'orangered', zh: '橙红' },
  { hex: '#da70d6', en: 'orchid', zh: '兰花紫' },
  { hex: '#eee8aa', en: 'palegoldenrod', zh: '浅金菊' },
  { hex: '#98fb98', en: 'palegreen', zh: '浅绿' },
  { hex: '#afeeee', en: 'paleturquoise', zh: '浅青绿' },
  { hex: '#db7093', en: 'palevioletred', zh: '浅紫红' },
  { hex: '#ffefd5', en: 'papayawhip', zh: '番木瓜色' },
  { hex: '#ffdab9', en: 'peachpuff', zh: '桃色' },
  { hex: '#cd853f', en: 'peru', zh: '秘鲁色' },
  { hex: '#ffc0cb', en: 'pink', zh: '粉色' },
  { hex: '#dda0dd', en: 'plum', zh: '梅红' },
  { hex: '#b0e0e6', en: 'powderblue', zh: '粉蓝' },
  { hex: '#800080', en: 'purple', zh: '紫色' },
  { hex: '#663399', en: 'rebeccapurple', zh: '丽贝卡紫' },
  { hex: '#ff0000', en: 'red', zh: '红色' },
  { hex: '#bc8f8f', en: 'rosybrown', zh: '玫瑰棕' },
  { hex: '#4169e1', en: 'royalblue', zh: '宝蓝' },
  { hex: '#8b4513', en: 'saddlebrown', zh: '马鞍棕' },
  { hex: '#fa8072', en: 'salmon', zh: '鲑红' },
  { hex: '#f4a460', en: 'sandybrown', zh: '沙棕' },
  { hex: '#2e8b57', en: 'seagreen', zh: '海绿' },
  { hex: '#fff5ee', en: 'seashell', zh: '海贝色' },
  { hex: '#a0522d', en: 'sienna', zh: '赭色' },
  { hex: '#c0c0c0', en: 'silver', zh: '银色' },
  { hex: '#87ceeb', en: 'skyblue', zh: '天蓝' },
  { hex: '#6a5acd', en: 'slateblue', zh: '板岩蓝' },
  { hex: '#708090', en: 'slategray', zh: '板岩灰' },
  { hex: '#fffafa', en: 'snow', zh: '雪白' },
  { hex: '#00ff7f', en: 'springgreen', zh: '春绿' },
  { hex: '#4682b4', en: 'steelblue', zh: '钢青' },
  { hex: '#d2b48c', en: 'tan', zh: '茶色' },
  { hex: '#008080', en: 'teal', zh: '青绿' },
  { hex: '#d8bfd8', en: 'thistle', zh: '蓟色' },
  { hex: '#ff6347', en: 'tomato', zh: '番茄红' },
  { hex: '#40e0d0', en: 'turquoise', zh: '青绿' },
  { hex: '#ee82ee', en: 'violet', zh: '紫罗兰' },
  { hex: '#f5deb3', en: 'wheat', zh: '麦色' },
  { hex: '#ffffff', en: 'white', zh: '白色' },
  { hex: '#f5f5f5', en: 'whitesmoke', zh: '烟白' },
  { hex: '#ffff00', en: 'yellow', zh: '黄色' },
  { hex: '#9acd32', en: 'yellowgreen', zh: '黄绿' },
]

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

function getClosestColorName(r: number, g: number, b: number): { en: string; zh: string } | null {
  let best: { en: string; zh: string } | null = null
  let bestD = Infinity
  for (const { hex, en, zh } of COLOR_NAMES) {
    const rgb = hexToRgb(hex)
    if (!rgb) continue
    const d = colorDistance(r, g, b, rgb.r, rgb.g, rgb.b)
    if (d < bestD) {
      bestD = d
      best = { en, zh }
    }
  }
  return best
}

// 按色系排序：先按色相 H，中性灰（低饱和度）放最后按明度
const COLOR_NAMES_BY_HUE: { hex: string; en: string; zh: string }[] = [...COLOR_NAMES].sort((a, b) => {
  const rgbA = hexToRgb(a.hex)!
  const rgbB = hexToRgb(b.hex)!
  const hslA = rgbToHsl(rgbA.r, rgbA.g, rgbA.b)
  const hslB = rgbToHsl(rgbB.r, rgbB.g, rgbB.b)
  const neutral = (s: number) => s < 12
  if (neutral(hslA.s) && neutral(hslB.s)) return hslA.l - hslB.l // 灰系按明度
  if (neutral(hslA.s)) return 1
  if (neutral(hslB.s)) return -1
  const hA = hslA.h === 0 && hslA.s === 0 ? 0 : hslA.h
  const hB = hslB.h === 0 && hslB.s === 0 ? 0 : hslB.h
  if (Math.abs(hA - hB) > 1) return hA - hB
  return hslB.s - hslA.s // 同色相按饱和度降序
})

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

  const colorName = getClosestColorName(color.r, color.g, color.b)

  return (
    <div className="h-full w-full min-h-0 overflow-auto p-3 sm:p-4">
      <div className="mx-auto max-w-lg space-y-3 sm:space-y-4">
        {/* 预览 + 取色器 */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg border-2 border-gray-300 shadow-inner" style={{ backgroundColor: color.hex }} />
          <div className="min-w-0 flex-1 space-y-2">
            {colorName && (
              <p className="text-sm text-gray-600 truncate" title="颜色名称 / Color name">
                {colorName.zh} <span className="text-gray-400">({colorName.en})</span>
              </p>
            )}
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

        {/* 所有支持的英文颜色快速设置 */}
        <div className="space-y-2 min-w-0">
          <p className="text-sm font-medium text-gray-700">快速设置 · 按色系排序 ({COLOR_NAMES_BY_HUE.length} 个)</p>
          <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-48 overflow-auto rounded border border-gray-200 p-2 bg-gray-50/50">
            {COLOR_NAMES_BY_HUE.map(({ hex, en, zh }) => (
              <button
                key={en}
                type="button"
                onClick={() => applyColor(parseInputToState(hex))}
                className="group relative h-7 min-w-0 rounded border border-gray-200 hover:border-gray-400 hover:ring-1 hover:ring-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                style={{ backgroundColor: hex }}
                title={`${en} · ${zh} · ${hex}`}
              >
                <span className="absolute inset-0 flex items-center justify-center rounded bg-black/60 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 group-focus:opacity-100 truncate px-0.5">
                  {en}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorTool
