'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Play, Pause, Settings, Maximize2, Minimize2 } from 'lucide-react'

interface ScreenStreamProps {
    className?: string
    wsUrl?: string
    autoStart?: boolean
    onConnectionChange?: (connected: boolean) => void
    onError?: (error: string) => void
}

interface StreamStats {
    fps: number
    latency: number
    bytesReceived: number
    framesReceived: number
}

interface StreamOptions {
    frameRate: number
    quality: number
    autoReconnect: boolean
}

export const ScreenStream: React.FC<ScreenStreamProps> = ({
    className = '',
    wsUrl = `ws://localhost:3001/api/screen-stream`,
    autoStart = false,
    onConnectionChange,
    onError
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const wsRef = useRef<WebSocket | null>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
    const frameBufferRef = useRef<ImageData[]>([])
    const animationRef = useRef<number>(0)
    const lastFrameTimeRef = useRef<number>(0)

    const [isConnected, setIsConnected] = useState(false)
    const [isStreaming, setIsStreaming] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [stats, setStats] = useState<StreamStats>({
        fps: 0,
        latency: 0,
        bytesReceived: 0,
        framesReceived: 0
    })
    const [options, setOptions] = useState<StreamOptions>({
        frameRate: 30,
        quality: 0.8,
        autoReconnect: true
    })

    // 初始化 Canvas
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) return

        ctxRef.current = ctx

        // 设置高 DPI 支持
        const dpr = window.devicePixelRatio || 1
        const rect = canvas.getBoundingClientRect()

        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        canvas.style.width = rect.width + 'px'
        canvas.style.height = rect.height + 'px'

        ctx.scale(dpr, dpr)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // 设置默认背景
        ctx.fillStyle = '#1f2937'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // 绘制等待文本
        ctx.fillStyle = '#9ca3af'
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('等待屏幕流...', rect.width / 2, rect.height / 2)
    }, [])

    // WebSocket 连接
    const connectWebSocket = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return
        }

        // 清理现有连接
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }

        try {
            console.log('尝试连接 WebSocket:', wsUrl)
            const ws = new WebSocket(wsUrl)
            wsRef.current = ws

            // 设置连接超时
            const connectionTimeout = setTimeout(() => {
                if (ws.readyState === WebSocket.CONNECTING) {
                    console.error('WebSocket 连接超时')
                    ws.close()
                    onError?.('连接超时')
                }
            }, 10000) // 10秒超时

            ws.onopen = () => {
                clearTimeout(connectionTimeout)
                console.log('WebSocket 连接已建立')
                setIsConnected(true)
                onConnectionChange?.(true)
                
                if (autoStart) {
                    startStream()
                }
            }

            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data)
                    handleWebSocketMessage(message)
                } catch (error) {
                    console.error('消息解析失败:', error, '原始数据:', event.data)
                }
            }

            ws.onclose = (event) => {
                clearTimeout(connectionTimeout)
                console.log('WebSocket 连接已关闭', '代码:', event.code, '原因:', event.reason)
                setIsConnected(false)
                setIsStreaming(false)
                onConnectionChange?.(false)

                // 自动重连（避免无限重连）
                if (options.autoReconnect && event.code !== 1000) { // 1000 是正常关闭
                    console.log('3秒后尝试重新连接...')
                    setTimeout(() => {
                        connectWebSocket()
                    }, 3000)
                }
            }

            ws.onerror = (error) => {
                clearTimeout(connectionTimeout)
                console.error('WebSocket 错误:', error)
                console.error('WebSocket 状态:', ws.readyState)
                console.error('WebSocket URL:', wsUrl)
                
                let errorMsg = '连接失败'
                if (ws.readyState === WebSocket.CONNECTING) {
                    errorMsg = '无法连接到服务器'
                } else if (ws.readyState === WebSocket.CLOSING) {
                    errorMsg = '连接正在关闭'
                } else if (ws.readyState === WebSocket.CLOSED) {
                    errorMsg = '连接已断开'
                }
                
                onError?.(errorMsg)
                setIsConnected(false)
            }

        } catch (error) {
            console.error('WebSocket 连接创建失败:', error)
            const msg = error instanceof Error ? error.message : String(error)
            onError?.('连接创建失败: ' + msg)
        }
    }, [wsUrl, autoStart, options.autoReconnect, onConnectionChange, onError])

    // 处理 WebSocket 消息
    const handleWebSocketMessage = useCallback((message: any) => {
        switch (message.type) {
            case 'frame':
                handleFrame(message)
                break
            case 'stream_started':
                setIsStreaming(true)
                console.log('流传输已开始')
                break
            case 'stream_stopped':
                setIsStreaming(false)
                console.log('流传输已停止')
                break
            case 'error':
                onError?.(message.message)
                break
            default:
                console.log('未知消息类型:', message.type)
        }
    }, [onError])

    // 处理帧数据
    const handleFrame = useCallback((frameMessage: any) => {
        const { data: base64Data, timestamp, size } = frameMessage
        
        // 更新统计信息
        setStats(prev => ({
            ...prev,
            bytesReceived: prev.bytesReceived + size,
            framesReceived: prev.framesReceived + 1,
            latency: Date.now() - timestamp
        }))

        // 创建图像并添加到缓冲区
        const img = new Image()
        img.onload = () => {
            const canvas = canvasRef.current
            if (!canvas || !ctxRef.current) return

            // 调整 canvas 大小匹配图像
            if (canvas.width !== img.width || canvas.height !== img.height) {
                canvas.width = img.width
                canvas.height = img.height
                canvas.style.width = img.width + 'px'
                canvas.style.height = img.height + 'px'
            }

            // 创建 ImageData 并添加到缓冲区
            ctxRef.current.drawImage(img, 0, 0)
            const imageData = ctxRef.current.getImageData(0, 0, img.width, img.height)
            
            frameBufferRef.current.push(imageData)
            
            // 限制缓冲区大小
            if (frameBufferRef.current.length > 3) {
                frameBufferRef.current.shift()
            }
        }
        img.src = `data:image/png;base64,${base64Data}`
    }, [])

    // 渲染循环
    const startRenderLoop = useCallback(() => {
        const render = (currentTime: number) => {
            if (frameBufferRef.current.length > 0 && ctxRef.current) {
                const frame = frameBufferRef.current.shift()!
                ctxRef.current.putImageData(frame, 0, 0)
                
                // 计算 FPS
                if (lastFrameTimeRef.current) {
                    const fps = 1000 / (currentTime - lastFrameTimeRef.current)
                    setStats(prev => ({ ...prev, fps: Math.round(fps) }))
                }
                lastFrameTimeRef.current = currentTime
            }
            
            animationRef.current = requestAnimationFrame(render)
        }
        
        animationRef.current = requestAnimationFrame(render)
    }, [])

    // 控制函数
    const startStream = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'start_stream',
                options: {
                    frameRate: options.frameRate,
                    quality: options.quality
                }
            }))
        }
    }, [options])

    const stopStream = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'stop_stream'
            }))
        }
    }, [])

    const toggleFullscreen = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        if (!isFullscreen) {
            if (canvas.requestFullscreen) {
                canvas.requestFullscreen()
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
    }, [isFullscreen])

    // 生命周期
    useEffect(() => {
        initCanvas()
        startRenderLoop()
        
        // 启动 WebSocket 服务器
        console.log('正在启动 WebSocket 服务器...')
        fetch('/api/screen-stream', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }
                return response.json()
            })
            .then(data => {
                console.log('服务器响应:', data)
                if (data.success) {
                    console.log('WebSocket 服务器启动成功，准备连接...')
                    // 延迟连接，确保服务器已完全启动
                    setTimeout(() => {
                        connectWebSocket()
                    }, 2000)
                } else {
                    throw new Error(data.error || '服务器启动失败')
                }
            })
            .catch(error => {
                console.error('启动服务器失败:', error)
                const msg = error instanceof Error ? error.message : String(error)
                onError?.('服务器启动失败: ' + msg)
                
                // 即使服务器启动失败，也尝试连接（可能服务器已经在运行）
                setTimeout(() => {
                    console.log('尝试直接连接 WebSocket...')
                    connectWebSocket()
                }, 3000)
            })

        // 全屏事件监听
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
            if (wsRef.current) {
                wsRef.current.close()
            }
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [initCanvas, startRenderLoop, connectWebSocket, onError])

    return (
        <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setShowControls(!showControls)}
            />
            
            {/* 控制面板 */}
            {showControls && (
                <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                        <button
                            onClick={isStreaming ? stopStream : startStream}
                            disabled={!isConnected}
                            className="p-2 rounded hover:bg-white/20 disabled:opacity-50"
                            title={isStreaming ? '停止流' : '开始流'}
                        >
                            {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        
                        <button
                            onClick={toggleFullscreen}
                            className="p-2 rounded hover:bg-white/20"
                            title="全屏"
                        >
                            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                    
                    {/* 状态信息 */}
                    <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                            <span>连接:</span>
                            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                                {isConnected ? '已连接' : '未连接'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>FPS:</span>
                            <span>{stats.fps}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>延迟:</span>
                            <span>{stats.latency}ms</span>
                        </div>
                        <div className="flex justify-between">
                            <span>帧数:</span>
                            <span>{stats.framesReceived}</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* 连接状态指示器 */}
            <div className="absolute bottom-4 left-4">
                <div className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                } ${isStreaming ? 'animate-pulse' : ''}`} />
            </div>
        </div>
    )
}

export default ScreenStream
