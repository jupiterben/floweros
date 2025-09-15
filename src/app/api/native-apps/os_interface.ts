import { loadNativeModule } from "./utils"
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

const execAsync = promisify(exec)

export interface NativeApp {
    id: string
    title: string
    executable: string
    pid: number
    windowId?: string
    bounds?: {
        x: number
        y: number
        width: number
        height: number
    }
    icon?: string
    isVisible: boolean
    isMinimized: boolean
}

// 抽象基类，定义所有平台的通用接口
abstract class OsInterface {
    abstract getNativeApps(): Promise<NativeApp[]>
    abstract captureWindowScreenshot(app: NativeApp): Promise<string | null>
    abstract captureFullScreenshot(): Promise<string | null>
    
    // 通用的截图占位符生成方法
    public generateScreenshotPlaceholder(app: NativeApp): string {
        const canvas = `
            <svg width="320" height="240" xmlns="http://www.w3.org/2000/svg">
                <rect width="320" height="240" fill="#1f2937"/>
                <rect x="10" y="10" width="300" height="30" fill="#374151" rx="4"/>
                <text x="160" y="28" text-anchor="middle" fill="#d1d5db" font-family="Arial, sans-serif" font-size="12">
                    ${app.title.substring(0, 30)}
                </text>
                <rect x="10" y="50" width="300" height="180" fill="#111827" rx="4" stroke="#374151"/>
                <text x="160" y="140" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="14">
                    🖥️ ${app.executable}
                </text>
                <text x="160" y="160" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="10">
                    PID: ${app.pid}
                </text>
                ${app.bounds ? `
                    <text x="160" y="180" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="10">
                        ${app.bounds.width} × ${app.bounds.height}
                    </text>
                ` : ''}
                <text x="160" y="210" text-anchor="middle" fill="#4b5563" font-family="Arial, sans-serif" font-size="8">
                    Screenshot not available
                </text>
            </svg>
        `
        return Buffer.from(canvas).toString('base64')
    }

    // 创建临时截图文件路径
    protected createTempScreenshotPath(prefix: string = 'screenshot'): string {
        const timestamp = Date.now()
        const tempDir = os.tmpdir()
        return path.join(tempDir, `${prefix}_${timestamp}.png`)
    }

    // 读取截图文件并转换为base64
    protected async readScreenshotAsBase64(filePath: string): Promise<string | null> {
        try {
            if (!fs.existsSync(filePath)) {
                console.log(`截图文件不存在: ${filePath}`)
                return null
            }

            const imageBuffer = await fs.promises.readFile(filePath)
            const base64 = imageBuffer.toString('base64')
            
            // 清理临时文件
            try {
                await fs.promises.unlink(filePath)
            } catch (unlinkError) {
                console.log(`清理临时文件失败: ${unlinkError}`)
            }

            return base64
        } catch (error) {
            console.error(`读取截图文件失败: ${error}`)
            return null
        }
    }
}

export class WindowOS extends OsInterface {
    constructor() {
        super()
        // TODO: Implement
    }

    // 使用Win32 API获取顶层窗口
    async getTopLevelWindows(): Promise<NativeApp[]> {
        if (process.platform !== 'win32') {
            return []
        }

        // 动态加载win32-api，跳过编译时检查
        let win32api: any = null
        try {
            win32api = await loadNativeModule('win32-api')
        } catch (error) {
            console.log('Win32 API 动态加载失败:', error)
        }

        if (!win32api) {
            console.log('Win32 API 不可用，回退到命令行方法')
            return []
        }

        try {
            console.log('使用 Win32 API 获取窗口信息...')

            // 根据测试结果，使用简化的方法
            const { User32, Kernel32 } = win32api
            const user32 = User32.load()  // 加载所有User32函数
            const kernel32 = Kernel32.load()  // 加载所有Kernel32函数

            const apps: NativeApp[] = []

            // 方法1: 获取前台窗口（测试成功的方法）
            console.log('尝试获取前台窗口...')
            try {
                if ('GetForegroundWindow' in user32 && 'GetWindowTextW' in user32) {
                    const hwnd = user32.GetForegroundWindow()
                    if (hwnd) {
                        const titleBuffer = Buffer.alloc(512)
                        const titleLength = user32.GetWindowTextW(hwnd, titleBuffer, 256)
                        const title = titleBuffer.subarray(0, titleLength * 2).toString('utf16le').trim()

                        if (title) {
                            console.log(`成功获取前台窗口: ${title}`)

                            // 尝试获取进程ID
                            let pid = 0
                            if ('GetWindowThreadProcessId' in user32) {
                                const pidBuffer = Buffer.alloc(4)
                                user32.GetWindowThreadProcessId(hwnd, pidBuffer)
                                pid = pidBuffer.readUInt32LE(0)
                            }

                            // 尝试获取窗口位置
                            let bounds = undefined
                            if ('GetWindowRect' in user32) {
                                const rectBuffer = Buffer.alloc(16)
                                const rectSuccess = user32.GetWindowRect(hwnd, rectBuffer)
                                if (rectSuccess) {
                                    const left = rectBuffer.readInt32LE(0)
                                    const top = rectBuffer.readInt32LE(4)
                                    const right = rectBuffer.readInt32LE(8)
                                    const bottom = rectBuffer.readInt32LE(12)

                                    bounds = {
                                        x: left,
                                        y: top,
                                        width: right - left,
                                        height: bottom - top
                                    }
                                }
                            }

                            apps.push({
                                id: hwnd.toString(),
                                title,
                                executable: 'unknown', // 暂时使用unknown，避免复杂的进程名获取
                                pid,
                                windowId: hwnd.toString(),
                                bounds,
                                isVisible: true,
                                isMinimized: false
                            })
                        }
                    }
                }
            } catch (fgError) {
                console.log('获取前台窗口失败:', fgError)
            }


            // 方法2: 如果Win32 API方法数量不足，使用PowerShell备用方案
            if (apps.length === 0) {
                console.log('Win32 API方法失败，尝试PowerShell备用方案...')
                try {
                    const { stdout } = await execAsync('powershell -Command "Get-Process | Where-Object { $_.MainWindowTitle -ne \'\' } | Select-Object Id, ProcessName, MainWindowTitle | ConvertTo-Json"')
                    
                    if (stdout.trim()) {
                        let processes
                        try {
                            processes = JSON.parse(stdout)
                            if (!Array.isArray(processes)) {
                                processes = [processes]
                            }
                            
                            console.log(`PowerShell获取到 ${processes.length} 个窗口`)
                            
                            processes.forEach((proc, index) => {
                                apps.push({
                                    id: `ps-${proc.Id}-${index}`,
                                    title: proc.MainWindowTitle || 'Unknown Window',
                                    executable: proc.ProcessName || 'unknown',
                                    pid: proc.Id || 0,
                                    windowId: `ps-${proc.Id}`,
                                    bounds: undefined, // PowerShell方法无法获取窗口位置
                                    isVisible: true,
                                    isMinimized: false
                                })
                            })
                        } catch (jsonError) {
                            console.log('PowerShell JSON解析失败:', jsonError)
                        }
                    }
                } catch (psError) {
                    console.log('PowerShell方法也失败:', psError)
                }
            }

            console.log(`成功获取 ${apps.length} 个窗口`)
            return apps

        } catch (error) {
            console.error('Win32 API 获取窗口失败:', error)
            return []
        }
    }

    // 获取Windows平台的应用程序列表
    async getNativeApps(): Promise<NativeApp[]> {
        // 方法1: Win32 API - 直接获取顶层窗口 (优先方法)
        const topLevelApps = await this.getTopLevelWindows()
        if (topLevelApps.length > 0) {
            return topLevelApps
        }
        return []
    }

    // Windows平台窗口截图
    async captureWindowScreenshot(app: NativeApp): Promise<string | null> {
        if (process.platform !== 'win32') {
            console.log('非Windows平台，无法使用Windows截图功能')
            return null
        }

        try {
            const tempPath = this.createTempScreenshotPath(`win_window_${app.id}`)
            // 使用Win32 API（如果可用）
            try {
                const win32api = await loadNativeModule('win32-api')
                if (win32api) {
                    const { User32, Gdi32 } = win32api
                    const user32 = User32.load()
                    const gdi32 = Gdi32.load()

                    const hwnd = parseInt(app.windowId || app.id)
                    if (hwnd && app.bounds) {
                        // 这里需要更复杂的Win32 API调用来实现截图
                        // 由于复杂性，暂时跳过此方法
                        console.log('Win32 API截图方法暂未实现')
                    }
                }
            } catch (apiError) {
                console.log('Win32 API截图方法失败:', apiError)
            }

            console.log(`Windows窗口截图失败: ${app.title}`)
            return null

        } catch (error) {
            console.error(`Windows窗口截图异常: ${error}`)
            return null
        }
    }

    // Windows平台全屏截图
    async captureFullScreenshot(): Promise<string | null> {
        if (process.platform !== 'win32') {
            return null
        }

        try {
            const tempPath = this.createTempScreenshotPath('win_fullscreen')
            
            // 使用PowerShell进行全屏截图
            const powershellScript = `
                Add-Type -AssemblyName System.Windows.Forms,System.Drawing
                $screen = [System.Windows.Forms.Screen]::PrimaryScreen
                $bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height)
                $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
                $graphics.CopyFromScreen($screen.Bounds.X, $screen.Bounds.Y, 0, 0, $screen.Bounds.Size)
                $bitmap.Save("${tempPath}", [System.Drawing.Imaging.ImageFormat]::Png)
                $graphics.Dispose()
                $bitmap.Dispose()
                Write-Output "全屏截图已保存: ${tempPath}"
            `

            await execAsync(`powershell -Command "${powershellScript.replace(/"/g, '\\"')}"`)
            
            const base64 = await this.readScreenshotAsBase64(tempPath)
            if (base64) {
                console.log('Windows全屏截图成功')
                return base64
            }

            return null
        } catch (error) {
            console.error(`Windows全屏截图失败: ${error}`)
            return null
        }
    }
}

// macOS平台实现
export class MacOS extends OsInterface {
    constructor() {
        super()
    }

    async getNativeApps(): Promise<NativeApp[]> {
        if (process.platform !== 'darwin') {
            return []
        }

        try {
            console.log('使用 macOS AppleScript 获取窗口信息...')

            const command = `
                osascript -e '
                tell application "System Events"
                    set appList to {}
                    repeat with proc in (every process whose background only is false)
                        try
                            set procName to name of proc
                            set procId to unix id of proc
                            set windowCount to count of windows of proc
                            if windowCount > 0 then
                                repeat with win in windows of proc
                                    try
                                        set winTitle to title of win
                                        set winPos to position of win
                                        set winSize to size of win
                                        set appInfo to "{\\\"title\\\":\\\"" & winTitle & "\\\",\\\"executable\\\":\\\"" & procName & "\\\",\\\"pid\\\":" & procId & ",\\\"bounds\\\":{\\\"x\\\":" & item 1 of winPos & ",\\\"y\\\":" & item 2 of winPos & ",\\\"width\\\":" & item 1 of winSize & ",\\\"height\\\":" & item 2 of winSize & "}}"
                                        set end of appList to appInfo
                                    on error
                                        -- 忽略窗口访问错误
                                    end try
                                end repeat
                            end if
                        on error
                            -- 忽略进程访问错误
                        end try
                    end repeat
                    return "[" & my joinList(appList, ",") & "]"
                end tell
                
                on joinList(lst, delim)
                    set AppleScript'"'"'s text item delimiters to delim
                    set joined to lst as string
                    set AppleScript'"'"'s text item delimiters to ""
                    return joined
                end joinList
                '
            `

            const { stdout } = await execAsync(command)
            const apps = JSON.parse(stdout)

            const nativeApps: NativeApp[] = apps.map((app: any, index: number) => ({
                id: `${app.pid}-${index}`,
                title: app.title || 'Unknown Window',
                executable: app.executable || 'unknown',
                pid: app.pid,
                bounds: app.bounds,
                isVisible: true,
                isMinimized: false
            }))

            console.log(`macOS 成功获取 ${nativeApps.length} 个窗口`)
            return nativeApps

        } catch (error) {
            console.error('获取macOS应用程序列表失败:', error)
            return []
        }
    }

    // macOS平台窗口截图
    async captureWindowScreenshot(app: NativeApp): Promise<string | null> {
        if (process.platform !== 'darwin') {
            console.log('非macOS平台，无法使用macOS截图功能')
            return null
        }

        try {
            const tempPath = this.createTempScreenshotPath(`mac_window_${app.id}`)

            // 方法1: 使用screencapture命令截取特定窗口
            if (app.bounds) {
                const { x, y, width, height } = app.bounds
                const screencaptureCommand = `screencapture -x -R${x},${y},${width},${height} "${tempPath}"`
                
                try {
                    await execAsync(screencaptureCommand)
                    const base64 = await this.readScreenshotAsBase64(tempPath)
                    if (base64) {
                        console.log(`macOS窗口区域截图成功: ${app.title}`)
                        return base64
                    }
                } catch (screenError) {
                    console.log('screencapture区域截图失败，尝试其他方法:', screenError)
                }
            }

            // 方法2: 使用AppleScript获取窗口截图
            try {
                const applescriptCommand = `
                    osascript -e '
                    tell application "System Events"
                        tell process "${app.executable}"
                            set frontmost to true
                            delay 0.1
                        end tell
                    end tell
                    
                    do shell script "screencapture -w -x \\"${tempPath}\\""
                    '
                `

                await execAsync(applescriptCommand)
                const base64 = await this.readScreenshotAsBase64(tempPath)
                if (base64) {
                    console.log(`macOS AppleScript窗口截图成功: ${app.title}`)
                    return base64
                }
            } catch (asError) {
                console.log('AppleScript窗口截图失败:', asError)
            }

            // 方法3: 使用窗口ID进行截图（如果有）
            if (app.windowId) {
                try {
                    const windowIdCommand = `screencapture -l${app.windowId} -x "${tempPath}"`
                    await execAsync(windowIdCommand)
                    
                    const base64 = await this.readScreenshotAsBase64(tempPath)
                    if (base64) {
                        console.log(`macOS窗口ID截图成功: ${app.title}`)
                        return base64
                    }
                } catch (widError) {
                    console.log('窗口ID截图失败:', widError)
                }
            }

            console.log(`macOS窗口截图失败: ${app.title}`)
            return null

        } catch (error) {
            console.error(`macOS窗口截图异常: ${error}`)
            return null
        }
    }

    // macOS平台全屏截图
    async captureFullScreenshot(): Promise<string | null> {
        if (process.platform !== 'darwin') {
            return null
        }

        try {
            const tempPath = this.createTempScreenshotPath('mac_fullscreen')
            
            // 使用screencapture进行全屏截图
            await execAsync(`screencapture -x "${tempPath}"`)
            
            const base64 = await this.readScreenshotAsBase64(tempPath)
            if (base64) {
                console.log('macOS全屏截图成功')
                return base64
            }

            return null
        } catch (error) {
            console.error(`macOS全屏截图失败: ${error}`)
            return null
        }
    }
}

// Linux平台实现  
export class LinuxOS extends OsInterface {
    constructor() {
        super()
    }

    async getNativeApps(): Promise<NativeApp[]> {
        if (process.platform !== 'linux') {
            return []
        }

        try {
            console.log('使用 Linux X11 工具获取窗口信息...')

            // 方法1: 尝试使用wmctrl获取窗口列表
            const { stdout } = await execAsync('wmctrl -l -p -G 2>/dev/null || echo "wmctrl not available"')

            if (stdout.includes('wmctrl not available')) {
                // 方法2: 尝试使用xwininfo和xprop
                try {
                    console.log('wmctrl不可用，尝试使用xwininfo...')
                    
                    const { stdout: windowIds } = await execAsync('xwininfo -root -children | grep -E "^ *0x" | awk \'{print $1}\'')
                    const ids = windowIds.trim().split('\n').filter(id => id)

                    const apps: NativeApp[] = []
                    for (const windowId of ids.slice(0, 20)) { // 限制数量避免过多请求
                        try {
                            const { stdout: windowInfo } = await execAsync(`xwininfo -id ${windowId}`)
                            const { stdout: windowProps } = await execAsync(`xprop -id ${windowId} WM_NAME _NET_WM_PID 2>/dev/null || echo ""`)

                            // 解析窗口信息
                            const titleMatch = windowProps.match(/WM_NAME\(.*?\) = "(.*?)"/)
                            const pidMatch = windowProps.match(/_NET_WM_PID\(.*?\) = (\d+)/)
                            const geometryMatch = windowInfo.match(/geometry (\d+)x(\d+)\+(-?\d+)\+(-?\d+)/)

                            const title = titleMatch ? titleMatch[1] : 'Unknown Window'
                            const pid = pidMatch ? parseInt(pidMatch[1]) : 0

                            if (title && pid && geometryMatch) {
                                const [, width, height, x, y] = geometryMatch
                                apps.push({
                                    id: windowId,
                                    title,
                                    executable: 'unknown',
                                    pid,
                                    windowId,
                                    bounds: {
                                        x: parseInt(x),
                                        y: parseInt(y),
                                        width: parseInt(width),
                                        height: parseInt(height)
                                    },
                                    isVisible: true,
                                    isMinimized: false
                                })
                            }
                        } catch (error) {
                            // 跳过无法访问的窗口
                        }
                    }

                    console.log(`Linux X11 成功获取 ${apps.length} 个窗口`)
                    return apps
                    
                } catch (error) {
                    console.error('X11窗口获取失败:', error)
                    return []
                }
            }

            // 解析wmctrl输出
            const lines = stdout.trim().split('\n')
            const apps: NativeApp[] = []

            for (const line of lines) {
                const parts = line.split(/\s+/)
                if (parts.length >= 7) {
                    const windowId = parts[0]
                    const pid = parseInt(parts[2])
                    const x = parseInt(parts[3])
                    const y = parseInt(parts[4])
                    const width = parseInt(parts[5])
                    const height = parseInt(parts[6])
                    const title = parts.slice(7).join(' ')

                    // 获取进程名
                    try {
                        const { stdout: procStdout } = await execAsync(`ps -p ${pid} -o comm= 2>/dev/null || echo "unknown"`)
                        const executable = procStdout.trim()

                        apps.push({
                            id: windowId,
                            title: title || 'Unknown Window',
                            executable,
                            pid,
                            windowId,
                            bounds: { x, y, width, height },
                            isVisible: true,
                            isMinimized: false
                        })
                    } catch (error) {
                        // 进程可能已经结束，跳过
                    }
                }
            }

            console.log(`Linux wmctrl 成功获取 ${apps.length} 个窗口`)
            return apps

        } catch (error) {
            console.error('获取Linux应用程序列表失败:', error)
            return []
        }
    }

    // Linux平台窗口截图
    async captureWindowScreenshot(app: NativeApp): Promise<string | null> {
        if (process.platform !== 'linux') {
            console.log('非Linux平台，无法使用Linux截图功能')
            return null
        }

        try {
            const tempPath = this.createTempScreenshotPath(`linux_window_${app.id}`)

            // 方法1: 使用import命令截取特定窗口（ImageMagick）
            if (app.windowId) {
                try {
                    const importCommand = `import -window ${app.windowId} "${tempPath}"`
                    await execAsync(importCommand)
                    
                    const base64 = await this.readScreenshotAsBase64(tempPath)
                    if (base64) {
                        console.log(`Linux import窗口截图成功: ${app.title}`)
                        return base64
                    }
                } catch (importError) {
                    console.log('import命令失败，尝试其他方法:', importError)
                }
            }

            // 方法2: 使用xwd命令截取窗口
            if (app.windowId) {
                try {
                    const xwdTempPath = tempPath.replace('.png', '.xwd')
                    const xwdCommand = `xwd -id ${app.windowId} -out "${xwdTempPath}"`
                    await execAsync(xwdCommand)
                    
                    // 转换xwd到png
                    const convertCommand = `convert "${xwdTempPath}" "${tempPath}"`
                    await execAsync(convertCommand)
                    
                    // 清理xwd文件
                    try {
                        await fs.promises.unlink(xwdTempPath)
                    } catch {}
                    
                    const base64 = await this.readScreenshotAsBase64(tempPath)
                    if (base64) {
                        console.log(`Linux xwd窗口截图成功: ${app.title}`)
                        return base64
                    }
                } catch (xwdError) {
                    console.log('xwd命令失败:', xwdError)
                }
            }

            // 方法3: 使用scrot截取特定区域
            if (app.bounds) {
                try {
                    const { x, y, width, height } = app.bounds
                    const scrotCommand = `scrot -a ${x},${y},${width},${height} "${tempPath}"`
                    await execAsync(scrotCommand)
                    
                    const base64 = await this.readScreenshotAsBase64(tempPath)
                    if (base64) {
                        console.log(`Linux scrot区域截图成功: ${app.title}`)
                        return base64
                    }
                } catch (scrotError) {
                    console.log('scrot命令失败:', scrotError)
                }
            }

            // 方法4: 使用gnome-screenshot（GNOME桌面环境）
            try {
                const gnomeCommand = `gnome-screenshot -w -f "${tempPath}"`
                await execAsync(gnomeCommand)
                
                const base64 = await this.readScreenshotAsBase64(tempPath)
                if (base64) {
                    console.log(`Linux gnome-screenshot窗口截图成功: ${app.title}`)
                    return base64
                }
            } catch (gnomeError) {
                console.log('gnome-screenshot命令失败:', gnomeError)
            }

            console.log(`Linux窗口截图失败: ${app.title}`)
            return null

        } catch (error) {
            console.error(`Linux窗口截图异常: ${error}`)
            return null
        }
    }

    // Linux平台全屏截图
    async captureFullScreenshot(): Promise<string | null> {
        if (process.platform !== 'linux') {
            return null
        }

        try {
            const tempPath = this.createTempScreenshotPath('linux_fullscreen')
            
            // 方法1: 使用scrot进行全屏截图
            try {
                await execAsync(`scrot "${tempPath}"`)
                const base64 = await this.readScreenshotAsBase64(tempPath)
                if (base64) {
                    console.log('Linux scrot全屏截图成功')
                    return base64
                }
            } catch (scrotError) {
                console.log('scrot全屏截图失败，尝试其他方法:', scrotError)
            }

            // 方法2: 使用import命令（ImageMagick）
            try {
                await execAsync(`import -window root "${tempPath}"`)
                const base64 = await this.readScreenshotAsBase64(tempPath)
                if (base64) {
                    console.log('Linux import全屏截图成功')
                    return base64
                }
            } catch (importError) {
                console.log('import全屏截图失败:', importError)
            }

            // 方法3: 使用gnome-screenshot
            try {
                await execAsync(`gnome-screenshot -f "${tempPath}"`)
                const base64 = await this.readScreenshotAsBase64(tempPath)
                if (base64) {
                    console.log('Linux gnome-screenshot全屏截图成功')
                    return base64
                }
            } catch (gnomeError) {
                console.log('gnome-screenshot全屏截图失败:', gnomeError)
            }

            return null
        } catch (error) {
            console.error(`Linux全屏截图失败: ${error}`)
            return null
        }
    }
}

// 工厂函数：根据平台创建合适的OS接口实例
export function createOsInterface(): OsInterface {
    switch (process.platform) {
        case 'win32':
            return new WindowOS()
        case 'darwin':
            return new MacOS()
        case 'linux':
            return new LinuxOS()
        default:
            console.warn(`不支持的平台: ${process.platform}`)
            // 返回一个空实现
            return new class extends OsInterface {
                async getNativeApps(): Promise<NativeApp[]> {
                    return []
                }
                
                async captureWindowScreenshot(app: NativeApp): Promise<string | null> {
                    console.warn(`平台 ${process.platform} 不支持窗口截图功能`)
                    return null
                }
                
                async captureFullScreenshot(): Promise<string | null> {
                    console.warn(`平台 ${process.platform} 不支持全屏截图功能`)
                    return null
                }
            }()
    }
}