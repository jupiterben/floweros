# 🌸 FlowerOS - 现代化Web操作系统

一个功能完整的Web操作系统，现在支持**原生应用管理**和**零安装屏幕共享**！

## ✨ 核心特性

### 🏢 原生应用管理器 (全新！)
- **跨平台支持**: Windows、macOS、Linux应用程序管理
- **实时监控**: 自动获取正在运行的本地应用程序
- **窗口控制**: 聚焦、最小化、关闭本地应用窗口 (Windows)
- **智能过滤**: 按状态、名称搜索和过滤应用程序
- **可视化界面**: 现代化卡片布局，状态指示器

### 🖥️ 屏幕共享
- **零安装**: 基于浏览器Screen Capture API，无需额外客户端
- **双模式**: 广播模式（共享屏幕）+ 观看模式（接收屏幕）
- **实时传输**: WebSocket实时通信，低延迟
- **跨平台**: 支持Windows、macOS、Linux
- **可调设置**: 帧率(5-30 FPS)、画质(30%-90%)

### 💻 桌面环境
- 完整的窗口管理系统
- 现代化的用户界面
- 多应用支持
- 响应式设计

### 🛠️ 内置应用
- **原生应用管理器**: 管理本地运行的应用程序 🏢
- **屏幕共享**: 实时屏幕共享功能 🖥️
- **浏览器**: 支持代理模式访问任意网站 🌐
- **文件管理器**: 文件浏览和管理 📁
- **计算器**: 科学计算器 🧮
- **记事本**: 文本编辑器 📝
- **系统设置**: 系统配置管理 ⚙️
- **应用商店**: 应用管理中心 🏪

## 🚀 快速开始

### 方法1: 一键启动 (推荐)
```bash
# Windows
双击运行: start-floweros.bat

# 或手动执行
pnpm install
pnpm dev
```

### 方法2: 开发模式
```bash
git clone <repository>
cd floweros
pnpm install
pnpm dev
```

### 访问系统
- 🌐 **Web界面**: http://localhost:8999
- 📡 **WebSocket**: ws://localhost:8998 (自动启动)

## 🏢 原生应用管理器使用指南

### 📋 查看本地应用
1. 打开FlowerOS，点击"应用管理器"图标 🏢
2. 自动显示所有正在运行的本地应用程序
3. 每个应用显示：标题、进程名、PID、窗口尺寸、状态

### 🎛️ 控制应用程序 (Windows)
- **聚焦窗口**: 将应用带到前台
- **最小化窗口**: 最小化指定应用
- **关闭应用**: 安全关闭应用程序

### 🔍 搜索和过滤
- **实时搜索**: 按应用名或进程名搜索
- **状态过滤**: 显示/隐藏最小化窗口
- **自动刷新**: 可配置刷新间隔(3-30秒)

### 🌈 状态指示器
- 🟢 **绿色**: 窗口可见且活跃
- 🟡 **黄色**: 窗口已最小化
- 🔴 **红色**: 窗口不可见

## 🖥️ 屏幕共享使用指南

### 🔴 作为广播者 (共享您的屏幕)
1. 打开"屏幕共享"应用
2. 切换到"广播模式"
3. 点击"开始广播"，选择要共享的屏幕
4. 其他用户可以在"观看模式"中看到您的屏幕

### 👁️ 作为观看者 (查看他人屏幕)
1. 打开"屏幕共享"应用
2. 保持"观看模式" (默认)
3. 点击"连接"连接到WebSocket服务器
4. 等待有人开始广播即可看到屏幕

## 🌐 浏览器兼容性

### ✅ 完全支持
- Chrome 72+ (推荐)
- Firefox 66+  
- Edge 79+

### ⚠️ 部分支持
- Safari 13+ (需启用实验性功能)

## 📁 项目结构

```
floweros/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/
│   │   │   ├── native-apps/        # 原生应用管理API ⭐
│   │   │   ├── websocket/          # WebSocket服务器
│   │   │   ├── proxy/              # 代理服务器
│   │   │   └── websocket-server/   # WS状态管理
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Apps/                   # 应用组件
│   │   │   ├── NativeAppManager.tsx # 原生应用管理器 ⭐
│   │   │   ├── ScreenShare.tsx     # 屏幕共享应用
│   │   │   ├── Browser.tsx
│   │   │   ├── Calculator.tsx
│   │   │   ├── FileManager.tsx
│   │   │   ├── Notepad.tsx
│   │   │   └── SystemSettings.tsx
│   │   ├── Core/                   # 核心组件
│   │   ├── Desktop/                # 桌面环境
│   │   ├── Taskbar/               # 任务栏
│   │   └── WindowManager/         # 窗口管理
│   └── context/
│       └── OSContext.tsx           # 操作系统上下文
├── public/                         # 静态资源
├── start-floweros.bat             # 一键启动脚本
├── NATIVE_APP_MANAGER.md          # 原生应用管理详细文档
├── NEXTJS_SCREEN_SHARE.md         # 屏幕共享详细文档
└── package.json
```

## 🛠️ 技术栈

- **前端框架**: Next.js 15 + React 19
- **样式**: Tailwind CSS 4
- **语言**: TypeScript
- **图标**: Lucide React
- **实时通信**: WebSocket
- **系统集成**: PowerShell (Windows) / AppleScript (macOS) / Shell Commands (Linux)
- **屏幕捕获**: Browser Screen Capture API

## 🚀 部署

### 开发环境
```bash
pnpm dev
```

### 生产环境
```bash
pnpm build
pnpm start
```

### Docker (可选)
```bash
docker build -t floweros .
docker run -p 8999:8999 -p 8998:8998 floweros
```

## 🌟 特色功能展示

### 🏢 原生应用管理
- ✅ **实时监控**: 自动发现本地运行的应用程序
- ✅ **跨平台**: Windows (完整) / macOS (基础) / Linux (有限)
- ✅ **窗口控制**: Windows平台支持完整的窗口操作
- ✅ **智能搜索**: 实时过滤和状态筛选
- ✅ **现代UI**: 响应式卡片布局，直观状态指示

### 🖥️ 零安装屏幕共享
- ✅ **浏览器原生**: 无需安装额外软件
- ✅ **双向模式**: 广播和观看模式自由切换
- ✅ **高性能**: 可调节帧率和画质
- ✅ **实时通信**: WebSocket低延迟传输
- ✅ **跨平台**: 支持所有现代浏览器

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📜 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- 感谢所有贡献者
- 基于现代Web技术构建
- 灵感来源于传统桌面操作系统

---

**FlowerOS - 让Web操作系统触手可及！桥接Web与本地系统的完美解决方案！** 🌸✨

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![Powered by React](https://img.shields.io/badge/Powered%20by-React-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Written%20in-TypeScript-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)