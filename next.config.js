/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    // 指定哪些包应该在服务器端保持外部化（不被webpack打包）
    serverExternalPackages: ['win32-api', 'koffi', 'win32-def', 'ref-struct', 'ref-array'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Webpack配置优化
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 为开发环境启用更好的sourcemap
      config.devtool = isServer ? 'eval-source-map' : 'eval-cheap-module-source-map'
      
      // 优化调试器性能
      config.optimization = {
        ...config.optimization,
        minimize: false,
      }
    }

    // 服务端专用配置
    if (isServer) {
      // 配置原生模块为外部依赖，跳过webpack打包
      const originalExternals = config.externals || []
      config.externals = [
        ...originalExternals,
        // 动态require的方式处理原生模块
        ({ request }, callback) => {
          const nativeModules = ['win32-api', 'koffi', 'win32-def', 'ref-struct', 'ref-array']
          if (nativeModules.includes(request)) {
            // 标记为外部模块，不进行打包
            return callback(null, `commonjs ${request}`)
          }
          callback()
        },
      ]

      // 忽略原生模块的依赖解析
      config.resolve.alias = {
        ...config.resolve.alias,
        'win32-api': false,
        'koffi': false,
      }
    }

    return config
  },

  // Vercel 优化配置
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // 静态资源优化和iframe支持
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          // 允许iframe嵌入
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL',
          },
          // 内容安全策略 - 允许iframe加载任何来源
          {
            key: 'Content-Security-Policy',
            value: "frame-src *; child-src *; object-src 'none';",
          },
        ],
      },
    ];
  },
}
