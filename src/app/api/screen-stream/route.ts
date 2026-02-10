'use server'

import { NextRequest } from 'next/server'
import { WebSocketServer, WebSocket } from 'ws'
import { createOsInterface } from '../native-apps/os_interface'
import { createServer } from 'http'

// WebSocket 服务器实例
let wss: WebSocketServer | null = null
let httpServer: any = null

// 屏幕流服务类
class ScreenStreamService {
    private osInterface = createOsInterface()
    private activeStreams = new Map<WebSocket, NodeJS.Timeout>()
    private frameRate = 30 // FPS
    private compressionQuality = 0.8

    constructor(private wss: WebSocketServer) {
        this.setupWebSocketServer()
    }

    private setupWebSocketServer() {
        this.wss.on('connection', (ws: WebSocket, request) => {
            console.log('屏幕流客户端连接:', request.url)
            
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString())
                    this.handleMessage(ws, message)
                } catch (error) {
                    console.error('消息解析失败:', error)
                }
            })

            ws.on('close', () => {
                this.stopStream(ws)
                console.log('屏幕流客户端断开连接')
            })

            ws.on('error', (error) => {
                console.error('WebSocket错误:', error)
                this.stopStream(ws)
            })
        })
    }

    private handleMessage(ws: WebSocket, message: any) {
        switch (message.type) {
            case 'start_stream':
                this.startStream(ws, message.options || {})
                break
            case 'stop_stream':
                this.stopStream(ws)
                break
            case 'change_quality':
                this.changeQuality(message.quality)
                break
            case 'change_framerate':
                this.changeFrameRate(message.frameRate)
                break
            default:
                console.log('未知消息类型:', message.type)
        }
    }

    private async startStream(ws: WebSocket, options: any) {
        // 停止现有流
        this.stopStream(ws)

        const frameRate = options.frameRate || this.frameRate
        const quality = options.quality || this.compressionQuality
        const interval = 1000 / frameRate

        console.log(`开始屏幕流传输: ${frameRate}FPS, 质量: ${quality}`)

        const streamInterval = setInterval(async () => {
            try {
                await this.captureAndSendFrame(ws, quality)
            } catch (error) {
                console.error('截图传输失败:', error)
                // 发送错误消息给客户端
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: '截图失败',
                        timestamp: Date.now()
                    }))
                }
            }
        }, interval)

        this.activeStreams.set(ws, streamInterval)

        // 发送开始确认
        ws.send(JSON.stringify({
            type: 'stream_started',
            frameRate,
            quality,
            timestamp: Date.now()
        }))
    }

    private stopStream(ws: WebSocket) {
        const interval = this.activeStreams.get(ws)
        if (interval) {
            clearInterval(interval)
            this.activeStreams.delete(ws)
            
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: 'stream_stopped',
                    timestamp: Date.now()
                }))
            }
        }
    }

    private async captureAndSendFrame(ws: WebSocket, quality: number) {
        if (ws.readyState !== WebSocket.OPEN) {
            return
        }

        // 获取全屏截图
        const screenshot = await this.osInterface.captureFullScreenshot()
        if (!screenshot) {
            return
        }

        // 压缩图像（如果需要）
        let finalImage = screenshot
        if (quality < 1.0) {
            finalImage = await this.compressImage(screenshot, quality)
        }

        // 发送帧数据
        const frameData = {
            type: 'frame',
            data: finalImage,
            timestamp: Date.now(),
            size: Buffer.byteLength(finalImage, 'base64')
        }

        ws.send(JSON.stringify(frameData))
    }

    private async compressImage(base64: string, quality: number): Promise<string> {
        // 这里可以使用 sharp 或其他图像处理库进行压缩
        // 目前返回原始图像
        return base64
    }

    private changeQuality(quality: number) {
        this.compressionQuality = Math.max(0.1, Math.min(1.0, quality))
        console.log('压缩质量已更改为:', this.compressionQuality)
    }

    private changeFrameRate(frameRate: number) {
        this.frameRate = Math.max(1, Math.min(60, frameRate))
        console.log('帧率已更改为:', this.frameRate)
    }

    public getStats() {
        return {
            activeConnections: this.activeStreams.size,
            frameRate: this.frameRate,
            quality: this.compressionQuality
        }
    }
}

// 初始化 WebSocket 服务器
function initWebSocketServer() {
    if (!wss) {
        try {
            // 创建 HTTP 服务器用于 WebSocket 升级
            httpServer = createServer()
            
            // 创建 WebSocket 服务器
            wss = new WebSocketServer({ 
                server: httpServer,
                path: '/api/screen-stream'
            })

            // 启动服务器
            const port = process.env.WS_PORT || 3001
            
            httpServer.on('error', (error: any) => {
                console.error('HTTP 服务器错误:', error)
                if (error.code === 'EADDRINUSE') {
                    console.log(`端口 ${port} 已被占用，尝试使用其他端口...`)
                    // 尝试使用其他端口
                    const altPort = parseInt(port.toString()) + 1
                    httpServer.listen(altPort, () => {
                        console.log(`WebSocket 服务器运行在备用端口 ${altPort}`)
                    })
                }
            })

            httpServer.listen(port, () => {
                console.log(`WebSocket 服务器运行在端口 ${port}`)
            })

            // 创建屏幕流服务
            new ScreenStreamService(wss)
            
        } catch (error) {
            console.error('WebSocket 服务器初始化失败:', error)
            throw error
        }
    }
    return wss
}

// API 路由处理
export async function GET(request: NextRequest) {
    try {
        // 初始化 WebSocket 服务器
        const wsServer = initWebSocketServer()
        
        return new Response(JSON.stringify({
            success: true,
            message: 'WebSocket 屏幕流服务已启动',
            wsUrl: `ws://localhost:${process.env.WS_PORT || 3001}/api/screen-stream`,
            stats: {
                connections: wsServer.clients.size
            }
        }), {
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch (error) {
        console.error('启动 WebSocket 服务失败:', error)
        return new Response(JSON.stringify({
            success: false,
            error: '服务启动失败'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
}

// 获取流状态
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        
        if (body.action === 'status' && wss) {
            return new Response(JSON.stringify({
                success: true,
                stats: {
                    activeConnections: wss.clients.size,
                    serverRunning: true
                }
            }), {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        }

        return new Response(JSON.stringify({
            success: false,
            error: '无效的操作'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: '请求处理失败'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }
}
