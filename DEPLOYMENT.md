# FlowerOS Vercel 部署指南

## 前置要求
- 确保您有 Vercel 账户
- 项目已推送到 GitHub/GitLab/Bitbucket

## 自动部署步骤

### 1. 连接 Vercel
1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账户登录
3. 点击 "New Project"
4. 选择您的 FlowerOS 仓库

### 2. 配置部署设置
Vercel 会自动检测到这是一个 Next.js 项目，并使用以下配置：

- **Framework Preset**: Next.js
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`
- **Development Command**: `pnpm dev`

### 3. 环境变量配置
在 Vercel 项目设置中添加以下环境变量：

```
NEXT_PUBLIC_APP_NAME=FlowerOS
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app/api
```

### 4. 域名配置
- Vercel 会自动分配一个 `.vercel.app` 域名
- 可在项目设置中配置自定义域名

## 手动部署 (CLI)

### 安装 Vercel CLI
```bash
npm i -g vercel
```

### 登录并部署
```bash
vercel login
vercel --prod
```

## 部署优化

### 性能优化
- ✅ 启用了压缩
- ✅ 禁用了 X-Powered-By 头
- ✅ 配置了缓存策略
- ✅ 优化了图片加载

### 安全配置
- ✅ 设置了安全头部
- ✅ 配置了 CSP 策略
- ✅ 启用了 XSS 保护

## 故障排除

### 构建失败
1. 检查 TypeScript 错误
2. 确保所有依赖已正确安装
3. 查看 Vercel 构建日志

### 运行时错误
1. 检查环境变量配置
2. 查看 Vercel 函数日志
3. 确认 API 路由配置正确

## 监控和分析
- 使用 Vercel Analytics 监控性能
- 查看 Vercel 日志了解运行状况
- 设置错误监控和告警

## 自动化工作流
项目配置了自动部署：
- 推送到主分支触发生产部署
- 推送到其他分支创建预览部署
- Pull Request 自动生成预览链接
