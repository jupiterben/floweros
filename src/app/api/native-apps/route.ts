import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import { NativeApp, createOsInterface } from './os_interface'

const execAsync = promisify(exec)

// OS接口实例管理
interface OsInterfaceManager {
  instance: any | null
  createdAt: number | null
  errorCount: number
}

// 单例模式缓存OS接口实例
const interfaceManager: OsInterfaceManager = {
  instance: null,
  createdAt: null,
  errorCount: 0
}

// 获取或创建OS接口实例（单例模式）
function getOrCreateOsInterface() {
  if (!interfaceManager.instance || interfaceManager.errorCount > 3) {
    console.log('创建新的OS接口实例...', {
      platform: process.platform,
      errorCount: interfaceManager.errorCount,
      isReset: interfaceManager.instance !== null
    })
    
    // 创建新实例
    interfaceManager.instance = createOsInterface()
    interfaceManager.createdAt = Date.now()
    interfaceManager.errorCount = 0
  }
  
  return interfaceManager.instance
}

// 重置OS接口实例（用于测试或错误恢复）
function resetOsInterface(reason?: string) {
  console.log('重置OS接口实例', { 
    reason: reason || '手动重置',
    uptime: interfaceManager.createdAt ? Date.now() - interfaceManager.createdAt : null,
    errorCount: interfaceManager.errorCount
  })
  
  interfaceManager.instance = null
  interfaceManager.createdAt = null
  interfaceManager.errorCount = 0
}

// 记录错误并可能触发重置
function recordError(error: Error) {
  interfaceManager.errorCount++
  console.warn(`OS接口错误 (${interfaceManager.errorCount}/4):`, error.message)
  
  // 如果错误次数过多，自动重置
  if (interfaceManager.errorCount > 3) {
    resetOsInterface('错误次数过多')
  }
}

// 获取接口状态信息
function getInterfaceStatus() {
  return {
    hasInstance: interfaceManager.instance !== null,
    platform: process.platform,
    createdAt: interfaceManager.createdAt,
    uptime: interfaceManager.createdAt ? Date.now() - interfaceManager.createdAt : null,
    errorCount: interfaceManager.errorCount
  }
}


// 获取所有平台的应用程序列表
async function getAllNativeApps(): Promise<NativeApp[]> {
  try {
    const osInterface = getOrCreateOsInterface()
    return await osInterface.getNativeApps()
  } catch (error) {
    console.error('获取应用程序列表失败:', error)
    
    // 记录错误并可能触发重置
    if (error instanceof Error) {
      recordError(error)
    }
    
    return []
  }
}

// GET: 获取原生应用程序列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeMinimized = searchParams.get('includeMinimized') === 'true'
    const onlyVisible = searchParams.get('onlyVisible') === 'true'

    let apps = await getAllNativeApps()

    // 过滤应用程序
    if (!includeMinimized) {
      apps = apps.filter(app => !app.isMinimized)
    }

    if (onlyVisible) {
      apps = apps.filter(app => app.isVisible)
    }

    // 排序：按标题排序
    apps.sort((a, b) => a.title.localeCompare(b.title))

    return NextResponse.json({
      success: true,
      platform: process.platform,
      count: apps.length,
      apps: apps,
      timestamp: Date.now(),
      capabilities: {
        canCapture: false, // 由于移除了原生依赖，暂时禁用截图
        canControl: process.platform === 'win32', // 仅Windows支持窗口控制

        platformSupport: {
          windows: process.platform === 'win32',
          macos: process.platform === 'darwin',
          linux: process.platform === 'linux'
        },
        methods: {
          commandLine: true,
          powershell: process.platform === 'win32',
          wmic: process.platform === 'win32'
        }
      },
      // 添加接口状态信息
      interfaceStatus: getInterfaceStatus()
    })

  } catch (error) {
    console.error('获取原生应用程序列表失败:', error)
    return NextResponse.json({
      success: false,
      error: '获取应用程序列表失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// POST: 执行窗口操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, windowId, appId, options = {} } = body

    switch (action) {
      case 'capture':
        // 生成截图占位符
        const apps = await getAllNativeApps()
        const targetApp = apps.find(app => app.id === (windowId || appId))

        if (targetApp) {
          const osInterface = getOrCreateOsInterface()
          const placeholderData = osInterface.generateScreenshotPlaceholder(targetApp)

          return NextResponse.json({
            success: true,
            action: 'capture',
            windowId: windowId || appId,
            data: placeholderData,
            format: 'svg',
            isPlaceholder: true,
            timestamp: Date.now(),
            message: '截图功能需要安装原生依赖包，当前显示占位符'
          })
        } else {
          return NextResponse.json({
            success: false,
            error: '找不到指定的应用程序'
          }, { status: 404 })
        }

      case 'focus':
        // 聚焦窗口（仅Windows）
        if (process.platform === 'win32' && windowId) {
          try {
            const command = `
              Add-Type @"
                using System;
                using System.Runtime.InteropServices;
                public class Win32 {
                  [DllImport("user32.dll")]
                  public static extern bool SetForegroundWindow(IntPtr hwnd);
                  [DllImport("user32.dll")]
                  public static extern bool ShowWindow(IntPtr hwnd, int nCmdShow);
                }
"@ -ErrorAction SilentlyContinue
              [Win32]::ShowWindow([IntPtr]${windowId}, 9) # SW_RESTORE
              [Win32]::SetForegroundWindow([IntPtr]${windowId})
            `

            await execAsync(`powershell -Command "${command.replace(/"/g, '\\"')}"`)

            return NextResponse.json({
              success: true,
              action: 'focus',
              windowId,
              message: '窗口已聚焦'
            })
          } catch (error) {
            return NextResponse.json({
              success: false,
              error: '聚焦窗口失败',
              details: error instanceof Error ? error.message : '未知错误'
            }, { status: 500 })
          }
        } else {
          return NextResponse.json({
            success: false,
            error: '当前平台不支持窗口聚焦功能'
          }, { status: 400 })
        }

      case 'minimize':
        // 最小化窗口（仅Windows）
        if (process.platform === 'win32' && windowId) {
          try {
            const command = `
              Add-Type @"
                using System;
                using System.Runtime.InteropServices;
                public class Win32 {
                  [DllImport("user32.dll")]
                  public static extern bool ShowWindow(IntPtr hwnd, int nCmdShow);
                }
"@ -ErrorAction SilentlyContinue
              [Win32]::ShowWindow([IntPtr]${windowId}, 2) # SW_MINIMIZE
            `

            await execAsync(`powershell -Command "${command.replace(/"/g, '\\"')}"`)

            return NextResponse.json({
              success: true,
              action: 'minimize',
              windowId,
              message: '窗口已最小化'
            })
          } catch (error) {
            return NextResponse.json({
              success: false,
              error: '最小化窗口失败',
              details: error instanceof Error ? error.message : '未知错误'
            }, { status: 500 })
          }
        } else {
          return NextResponse.json({
            success: false,
            error: '当前平台不支持窗口最小化功能'
          }, { status: 400 })
        }

      case 'close':
        // 关闭窗口（仅Windows）
        if (process.platform === 'win32' && windowId) {
          try {
            const command = `
              Add-Type @"
                using System;
                using System.Runtime.InteropServices;
                public class Win32 {
                  [DllImport("user32.dll")]
                  public static extern bool PostMessage(IntPtr hwnd, uint msg, IntPtr wParam, IntPtr lParam);
                }
"@ -ErrorAction SilentlyContinue
              [Win32]::PostMessage([IntPtr]${windowId}, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero) # WM_CLOSE
            `

            await execAsync(`powershell -Command "${command.replace(/"/g, '\\"')}"`)

            return NextResponse.json({
              success: true,
              action: 'close',
              windowId,
              message: '窗口关闭指令已发送'
            })
          } catch (error) {
            return NextResponse.json({
              success: false,
              error: '关闭窗口失败',
              details: error instanceof Error ? error.message : '未知错误'
            }, { status: 500 })
          }
        } else {
          return NextResponse.json({
            success: false,
            error: '当前平台不支持窗口关闭功能'
          }, { status: 400 })
        }

      default:
        return NextResponse.json({
          success: false,
          error: `不支持的操作: ${action}`
        }, { status: 400 })
    }

  } catch (error) {
    console.error('执行窗口操作失败:', error)
    return NextResponse.json({
      success: false,
      error: '操作失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}