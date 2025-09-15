/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用实验性功能
  experimental: {
    serverExternalPackages: ['ws', 'sharp']
  },
  
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
  
  // Webpack 配置
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 服务器端配置
      config.externals = config.externals || []
      config.externals.push('ws')
    }
    
    return config
  },
}

export default nextConfig