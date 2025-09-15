import { spawn } from 'child_process'
import { 
    FindWindowEx, 
    GetDefaultPrinter,
  } from 'win32-api/util'



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
  
  // 再测试Win32 API直接调用
  await testWin32API()
  
  console.log('\n✨ 测试完成！')
}

main().catch(console.error)