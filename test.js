import { spawn } from 'child_process'
import { 
    FindWindowEx, 
    GetDefaultPrinter,
  } from 'win32-api/util'

// 测试API功能
async function testNativeAppsAPI() {
  try {
    console.log('🚀 测试原生应用程序API...')
    
    // 测试获取应用程序列表
    const response = await fetch('http://localhost:8999/api/native-apps')
    const data = await response.json()
    
    console.log('✅ API响应成功')
    console.log('📊 平台:', data.platform)
    console.log('🔢 应用数量:', data.count)
    console.log('🛠️ 能力:', data.capabilities)
    
    if (data.apps && data.apps.length > 0) {
      console.log('\n📋 前5个应用程序:')
      data.apps.slice(0, 5).forEach((app, index) => {
        console.log(`${index + 1}. ${app.title} (${app.executable}) - PID: ${app.pid}`)
        if (app.bounds) {
          console.log(`   位置: ${app.bounds.x},${app.bounds.y} 大小: ${app.bounds.width}x${app.bounds.height}`)
        }
      })
    }
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message)
  }
}

// 测试Win32 API直接调用
async function testWin32API() {
  try {
    console.log('\n🔧 测试Win32 API直接调用...')
    
    // 启动记事本进行测试
    console.log('启动记事本...')
    const child = spawn('notepad.exe')
    
    // 等待窗口创建
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 查找记事本窗口
    const hWnd = await FindWindowEx(0, 0, 'Notepad', null)
    console.log('✅ 记事本窗口句柄:', hWnd)
    
    // 获取默认打印机（额外测试）
    const printerName = await GetDefaultPrinter()
    console.log('✅ 默认打印机:', printerName || '未找到')
    
  } catch (error) {
    console.error('❌ Win32 API测试失败:', error.message)
  }
}

// 主函数
async function main() {
  console.log('=== 原生应用程序API测试 ===\n')
  
  // 先测试API
  await testNativeAppsAPI()
  
  // 再测试Win32 API直接调用
  await testWin32API()
  
  console.log('\n✨ 测试完成！')
}

main().catch(console.error)