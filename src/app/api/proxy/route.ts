import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // 验证URL格式
    new URL(url)

    // 获取目标页面
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch URL' }, { status: response.status })
    }

    const content = await response.text()
    const contentType = response.headers.get('content-type') || 'text/html'

    // 修改HTML内容，移除X-Frame-Options和其他限制
    let modifiedContent = content
    if (contentType.includes('text/html')) {
      const urlObj = new URL(url)
      const isHttpTarget = url.startsWith('http:')
      
      // 移除或修改可能阻止iframe的meta标签和脚本
      modifiedContent = content
        .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')
        .replace(/<meta[^>]*name=["']frame-options["'][^>]*>/gi, '')
        .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
        // 修改相对路径为绝对路径
        .replace(/src=["']\/([^"']*)["']/g, `src="${urlObj.origin}/$1"`)
        .replace(/href=["']\/([^"']*)["']/g, `href="${urlObj.origin}/$1"`)
        // 处理混合内容 - 如果目标是HTTP，升级到HTTPS
        .replace(/src=["']http:\/\//gi, isHttpTarget ? 'src="https://' : 'src="http://')
        .replace(/href=["']http:\/\//gi, isHttpTarget ? 'href="https://' : 'href="http://')
        // 添加base标签和CSP meta标签
        .replace(/<head>/i, `<head>
          <base href="${urlObj.origin}/">
          <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests;">
        `)
    }

    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('X-Frame-Options', 'ALLOWALL')
    headers.set('Content-Security-Policy', "frame-ancestors *;")
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    return new NextResponse(modifiedContent, {
      status: 200,
      headers: headers
    })

  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json({ 
      error: 'Invalid URL or fetch failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // 支持POST请求的代理（如果需要的话）
  return NextResponse.json({ error: 'POST method not implemented yet' }, { status: 501 })
}
