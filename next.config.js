/** @type {import('next').NextConfig} */
const nextConfig = {
  // WebSocket 支持
  async rewrites() {
    return [
      {
        source: '/ws/:path*',
        destination: 'http://localhost:3001/:path*',
      },
    ]
  },
  
  // 环境变量
  env: {
    WS_PORT: process.env.WS_PORT || '3001',
  },
  
  // 实验性功能
  experimental: {
    // 移除不支持的配置项
    esmExternals: true,
  },
  
  // Next.js 16 默认用 Turbopack，显式声明空配置以消除告警
  turbopack: {},

  // Webpack 配置（使用 --webpack 时生效）
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 服务器端外部包配置
      config.externals = config.externals || []
      config.externals.push('ws')
      config.externals.push('sharp')
      config.externals.push('koffi')
      config.externals.push('win32-api')
    }
    
    // 忽略某些模块的警告
    config.ignoreWarnings = [
      { module: /node_modules\/ws/ },
      { module: /node_modules\/sharp/ },
      { module: /node_modules\/koffi/ },
      { module: /node_modules\/win32-api/ }
    ]
    
    return config
  },
  
  // 静态优化配置 - 移除可能导致问题的配置
  // output: 'standalone',
  
  // 图像优化配置
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
}

export default nextConfig