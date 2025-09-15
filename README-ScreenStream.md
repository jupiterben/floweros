# WebSocket + Canvas 屏幕流传输集成指南

## 🚀 概述

本项目成功集成了 WebSocket + 优化 Canvas 的屏幕流传输方案，实现了真正的实时屏幕共享功能。

## 📁 文件结构

```
src/
├── app/
│   ├── api/
│   │   └── screen-stream/
│   │       └── route.ts              # WebSocket 服务器 API
│   └── screen-demo/
│       └── page.tsx                  # 演示页面
├── components/
│   ├── Core/
│   │   └── ScreenStream.tsx          # 核心流组件
│   └── Apps/
│       └── ScreenViewer.tsx          # 屏幕查看器应用
├── hooks/
│   └── useScreenStream.ts            # 流管理 Hook
├── next.config.js                    # Next.js 配置
└── package.json                      # 依赖配置
```

## 🔧 安装和配置

### 1. 安装依赖

```bash
npm install ws @types/ws sharp
```

### 2. 环境变量

在 `.env.local` 中配置：

```env
WS_PORT=3001
```

### 3. 启动服务

```bash
npm run dev
```

## 💻 使用方法

### 基础使用

```tsx
import ScreenStream from '@/components/Core/ScreenStream'

function MyApp() {
    return (
        <ScreenStream
            className="w-full h-96"
            autoStart={true}
            onConnectionChange={(connected) => {
                console.log('连接状态:', connected)
            }}
            onError={(error) => {
                console.error('流错误:', error)
            }}
        />
    )
}
```

### 使用 Hook

```tsx
import useScreenStream from '@/hooks/useScreenStream'

function MyComponent() {
    const {
        isConnected,
        isStreaming,
        stats,
        connect,
        startStream,
        stopStream
    } = useScreenStream({
        wsUrl: 'ws://localhost:3001/api/screen-stream',
        options: {
            frameRate: 30,
            quality: 0.8
        },
        onError: (error) => console.error(error)
    })

    return (
        <div>
            <p>连接状态: {isConnected ? '已连接' : '未连接'}</p>
            <p>FPS: {stats.fps}</p>
            <p>延迟: {stats.latency}ms</p>
            <button onClick={() => isStreaming ? stopStream() : startStream()}>
                {isStreaming ? '停止' : '开始'}
            </button>
        </div>
    )
}
```

## 🎯 API 接口

### WebSocket 消息协议

#### 客户端 → 服务器

```typescript
// 开始流传输
{
    type: 'start_stream',
    options: {
        frameRate: 30,
        quality: 0.8
    }
}

// 停止流传输
{
    type: 'stop_stream'
}

// 更改质量
{
    type: 'change_quality',
    quality: 0.5
}

// 更改帧率
{
    type: 'change_framerate',
    frameRate: 15
}
```

#### 服务器 → 客户端

```typescript
// 帧数据
{
    type: 'frame',
    data: 'base64_image_data',
    timestamp: 1234567890,
    size: 12345
}

// 流状态
{
    type: 'stream_started' | 'stream_stopped',
    timestamp: 1234567890
}

// 错误消息
{
    type: 'error',
    message: 'error_description',
    timestamp: 1234567890
}
```

### HTTP API

```typescript
// 启动 WebSocket 服务器
GET /api/screen-stream

// 获取服务器状态
POST /api/screen-stream
{
    "action": "status"
}
```

## ⚡ 性能特性

### 1. 自适应帧率
- 根据网络延迟自动调整帧率
- 支持 1-60 FPS 范围
- 智能降级和恢复

### 2. 图像优化
- 可配置压缩质量 (0.1-1.0)
- 支持 JPEG/PNG 格式
- 自动尺寸适配

### 3. 内存管理
- 帧缓冲限制 (最多3帧)
- 自动垃圾回收
- 临时文件清理

### 4. 错误恢复
- 自动重连机制
- 连接状态监控
- 优雅降级

## 🌍 跨平台支持

### Windows
- PowerShell + .NET Framework
- nircmd 工具支持
- Win32 API 预留

### macOS
- screencapture 命令
- AppleScript 集成
- 窗口 ID 精确截图

### Linux
- ImageMagick import
- xwd + convert
- scrot 轻量级工具
- GNOME screenshot

## 🔧 配置选项

```typescript
interface StreamOptions {
    frameRate: number        // 帧率 (1-60)
    quality: number         // 质量 (0.1-1.0)
    autoReconnect: boolean  // 自动重连
    reconnectDelay: number  // 重连延迟 (ms)
}
```

## 📊 监控和统计

```typescript
interface StreamStats {
    fps: number            // 当前帧率
    latency: number        // 网络延迟 (ms)
    bytesReceived: number  // 接收字节数
    framesReceived: number // 接收帧数
    connectionTime: number // 连接时间 (ms)
}
```

## 🚨 故障排除

### 常见问题

1. **WebSocket 连接失败**
   - 检查端口 3001 是否被占用
   - 确认防火墙设置
   - 验证 Next.js 配置

2. **截图功能不工作**
   - 检查操作系统权限
   - 确认相关工具已安装
   - 查看控制台错误日志

3. **性能问题**
   - 降低帧率和质量设置
   - 检查系统资源使用
   - 优化网络连接

### 调试模式

```bash
DEBUG=screen-stream npm run dev
```

## 🔮 未来扩展

- [ ] 鼠标键盘交互
- [ ] 多屏幕支持
- [ ] 录制功能
- [ ] 音频流传输
- [ ] 移动端适配

## 📝 许可证

MIT License - 详见 LICENSE 文件
