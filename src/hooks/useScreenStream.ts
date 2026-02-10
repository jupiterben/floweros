'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface StreamStats {
    fps: number
    latency: number
    bytesReceived: number
    framesReceived: number
    connectionTime: number
}

export interface StreamOptions {
    frameRate: number
    quality: number
    autoReconnect: boolean
    reconnectDelay: number
}

export interface UseScreenStreamProps {
    wsUrl?: string
    options?: Partial<StreamOptions>
    onConnectionChange?: (connected: boolean) => void
    onError?: (error: string) => void
    onFrame?: (frameData: any) => void
}

export const useScreenStream = ({
    wsUrl = `ws://localhost:3001/api/screen-stream`,
    options = {},
    onConnectionChange,
    onError,
    onFrame
}: UseScreenStreamProps) => {
    const wsRef = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const connectionStartTime = useRef<number>(0)
    
    const [isConnected, setIsConnected] = useState(false)
    const [isStreaming, setIsStreaming] = useState(false)
    const [stats, setStats] = useState<StreamStats>({
        fps: 0,
        latency: 0,
        bytesReceived: 0,
        framesReceived: 0,
        connectionTime: 0
    })
    
    const defaultOptions: StreamOptions = {
        frameRate: 30,
        quality: 0.8,
        autoReconnect: true,
        reconnectDelay: 3000,
        ...options
    }

    // 连接 WebSocket
    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return Promise.resolve()
        }

        return new Promise<void>((resolve, reject) => {
            try {
                const ws = new WebSocket(wsUrl)
                wsRef.current = ws
                connectionStartTime.current = Date.now()

                ws.onopen = () => {
                    console.log('WebSocket 连接已建立')
                    setIsConnected(true)
                    setStats(prev => ({ 
                        ...prev, 
                        connectionTime: Date.now() - connectionStartTime.current 
                    }))
                    onConnectionChange?.(true)
                    resolve()
                }

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data)
                        handleMessage(message)
                    } catch (error) {
                        console.error('消息解析失败:', error)
                    }
                }

                ws.onclose = () => {
                    console.log('WebSocket 连接已关闭')
                    setIsConnected(false)
                    setIsStreaming(false)
                    onConnectionChange?.(false)

                    // 自动重连
                    if (defaultOptions.autoReconnect) {
                        reconnectTimeoutRef.current = setTimeout(() => {
                            connect()
                        }, defaultOptions.reconnectDelay)
                    }
                }

                ws.onerror = (error) => {
                    console.error('WebSocket 错误:', error)
                    onError?.('连接失败')
                    setIsConnected(false)
                    reject(error)
                }

            } catch (error) {
                console.error('WebSocket 连接失败:', error)
                onError?.('连接失败')
                reject(error)
            }
        })
    }, [wsUrl, defaultOptions.autoReconnect, defaultOptions.reconnectDelay, onConnectionChange, onError])

    // 断开连接
    const disconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
        }
        
        if (wsRef.current) {
            wsRef.current.close()
            wsRef.current = null
        }
        
        setIsConnected(false)
        setIsStreaming(false)
    }, [])

    // 处理消息
    const handleMessage = useCallback((message: any) => {
        switch (message.type) {
            case 'frame':
                handleFrame(message)
                onFrame?.(message)
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
    }, [onFrame, onError])

    // 处理帧数据
    const handleFrame = useCallback((frameMessage: any) => {
        const { timestamp, size } = frameMessage
        
        setStats(prev => ({
            ...prev,
            bytesReceived: prev.bytesReceived + (size || 0),
            framesReceived: prev.framesReceived + 1,
            latency: Date.now() - (timestamp || Date.now())
        }))
    }, [])

    // 开始流传输
    const startStream = useCallback((streamOptions?: Partial<StreamOptions>) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const options = { ...defaultOptions, ...streamOptions }
            wsRef.current.send(JSON.stringify({
                type: 'start_stream',
                options: {
                    frameRate: options.frameRate,
                    quality: options.quality
                }
            }))
            return true
        }
        return false
    }, [defaultOptions])

    // 停止流传输
    const stopStream = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'stop_stream'
            }))
            return true
        }
        return false
    }, [])

    // 更改流质量
    const changeQuality = useCallback((quality: number) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'change_quality',
                quality: Math.max(0.1, Math.min(1.0, quality))
            }))
            return true
        }
        return false
    }, [])

    // 更改帧率
    const changeFrameRate = useCallback((frameRate: number) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'change_framerate',
                frameRate: Math.max(1, Math.min(60, frameRate))
            }))
            return true
        }
        return false
    }, [])

    // 重置统计信息
    const resetStats = useCallback(() => {
        setStats({
            fps: 0,
            latency: 0,
            bytesReceived: 0,
            framesReceived: 0,
            connectionTime: 0
        })
    }, [])

    // FPS 计算
    useEffect(() => {
        const interval = setInterval(() => {
            setStats(prev => {
                const currentFrames = prev.framesReceived
                const fps = currentFrames - (prev.fps || 0)
                return {
                    ...prev,
                    fps: Math.max(0, fps)
                }
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    // 清理
    useEffect(() => {
        return () => {
            disconnect()
        }
    }, [disconnect])

    return {
        // 状态
        isConnected,
        isStreaming,
        stats,
        
        // 方法
        connect,
        disconnect,
        startStream,
        stopStream,
        changeQuality,
        changeFrameRate,
        resetStats,
        
        // WebSocket 实例（只读）
        ws: wsRef.current
    }
}

export default useScreenStream

