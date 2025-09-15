'use client'

import React from 'react'
import ScreenViewer from '@/components/Apps/ScreenViewer'

export default function ScreenDemoPage() {
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        屏幕流传输演示
                    </h1>
                    <p className="text-gray-600">
                        WebSocket + Canvas 实时屏幕共享技术演示
                    </p>
                </div>
                
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <ScreenViewer className="h-[600px]" />
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold text-gray-800 mb-2">技术特性</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• WebSocket 实时通信</li>
                            <li>• Canvas 高性能渲染</li>
                            <li>• 自适应帧率控制</li>
                            <li>• 自动重连机制</li>
                        </ul>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold text-gray-800 mb-2">性能优化</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• 帧缓冲技术</li>
                            <li>• 图像压缩</li>
                            <li>• 差分更新</li>
                            <li>• 内存管理</li>
                        </ul>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h3 className="font-semibold text-gray-800 mb-2">跨平台支持</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Windows (PowerShell)</li>
                            <li>• macOS (screencapture)</li>
                            <li>• Linux (scrot/import)</li>
                            <li>• 自动平台检测</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
