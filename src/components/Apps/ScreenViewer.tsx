'use client'

import React, { useState } from 'react'
import ScreenStream from '../Core/ScreenStream'
import { Monitor, Wifi, WifiOff, AlertCircle, Settings } from 'lucide-react'

interface ScreenViewerProps {
    className?: string
}

export const ScreenViewer: React.FC<ScreenViewerProps> = ({ className = '' }) => {
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showSettings, setShowSettings] = useState(false)

    const handleConnectionChange = (connected: boolean) => {
        setIsConnected(connected)
        if (connected) {
            setError(null)
        }
    }

    const handleError = (errorMessage: string) => {
        setError(errorMessage)
    }

    const clearError = () => {
        setError(null)
    }

    return (
        <div className={`flex flex-col h-full bg-gray-100 ${className}`}>
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-800">屏幕查看器</h2>
                    <div className="flex items-center space-x-1">
                        {isConnected ? (
                            <Wifi className="w-4 h-4 text-green-500" />
                        ) : (
                            <WifiOff className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                            {isConnected ? '已连接' : '未连接'}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="设置"
                    >
                        <Settings className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* 错误提示 */}
            {error && (
                <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-700 text-sm">{error}</span>
                    </div>
                    <button
                        onClick={clearError}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                        关闭
                    </button>
                </div>
            )}

            {/* 设置面板 */}
            {showSettings && (
                <div className="mx-4 mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-800 mb-3">流设置</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block text-gray-600 mb-1">帧率 (FPS)</label>
                            <select className="w-full p-2 border border-gray-300 rounded">
                                <option value="15">15 FPS</option>
                                <option value="30" selected>30 FPS</option>
                                <option value="60">60 FPS</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 mb-1">质量</label>
                            <select className="w-full p-2 border border-gray-300 rounded">
                                <option value="0.5">低质量</option>
                                <option value="0.8" selected>高质量</option>
                                <option value="1.0">无损</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* 屏幕流组件 */}
            <div className="flex-1 p-4">
                <ScreenStream
                    className="w-full h-full"
                    autoStart={true}
                    onConnectionChange={handleConnectionChange}
                    onError={handleError}
                />
            </div>

            {/* 底部信息栏 */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                <div className="flex justify-between items-center">
                    <span>实时屏幕共享 - FlowerOS</span>
                    <span>WebSocket + Canvas 流传输</span>
                </div>
            </div>
        </div>
    )
}

export default ScreenViewer
