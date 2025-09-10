


# FlowerOS - Web操作系统

基于 Next.js 开发的现代化 WebOS，具有完整的桌面环境和应用生态系统。

## ✨ 功能特性

- 🖥️ **桌面管理**: 现代化的桌面界面，支持应用图标排列和交互
- 📱 **应用管理**: 内置应用商店，支持应用安装、卸载和管理
- 📁 **文件管理**: 完整的文件浏览器，支持文件夹导航和文件操作
- ⚙️ **系统设置**: 丰富的系统配置选项，包括显示、音频、网络等
- 🪟 **窗口管理**: 多窗口系统，支持拖拽、缩放、最小化/最大化
- 🎯 **任务栏**: 底部任务栏显示运行中的应用和系统状态

## 🛠️ 技术栈

- **框架**: Next.js 14 + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **包管理**: pnpm
- **开发工具**: ESLint + Prettier

## 📱 内置应用

1. **文件管理器** 📁 - 浏览和管理文件系统
2. **应用商店** 🏪 - 发现和安装新应用
3. **系统设置** ⚙️ - 配置系统参数
4. **计算器** 🧮 - 功能完整的科学计算器
5. **记事本** 📝 - 文本编辑器，支持基础格式化
6. **浏览器** 🌐 - 内置网页浏览器

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 📁 项目结构

```
floweros/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 主页面
│   │   └── globals.css      # 全局样式
│   ├── components/          # React 组件
│   │   ├── Desktop/         # 桌面组件
│   │   ├── Taskbar/         # 任务栏组件
│   │   ├── WindowManager/   # 窗口管理
│   │   └── Apps/            # 应用组件
│   └── context/             # React Context
│       └── OSContext.tsx    # 操作系统状态管理
├── public/                  # 静态资源
├── package.json            # 项目配置
├── tailwind.config.js      # Tailwind 配置
├── tsconfig.json           # TypeScript 配置
└── next.config.js          # Next.js 配置
```

## 🎨 设计特色

- **毛玻璃效果**: 现代化的半透明窗口设计
- **渐变背景**: 动态的彩色渐变桌面背景
- **流畅动画**: 窗口开启、关闭的平滑过渡效果
- **响应式设计**: 适配不同屏幕尺寸
- **直观交互**: 拖拽、调整大小等自然的操作体验

## 🔧 开发计划

- [ ] 多用户系统支持
- [ ] 文件系统持久化
- [ ] 应用权限管理
- [ ] 主题系统扩展
- [ ] 快捷键支持
- [ ] 移动端适配优化
- [ ] 插件系统

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！ 
