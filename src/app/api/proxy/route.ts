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
      const targetOrigin = urlObj.origin
      // 注入：先设置目标站 origin，再将页面内对目标站的 fetch/XHR 重写到同源代理，避免 CORS
      const proxyInject = `<script>window.__PROXY_TARGET_ORIGIN="${targetOrigin.replace(/"/g, '\\"')}";</script>
<script>
(function(){
  var o=window.__PROXY_TARGET_ORIGIN;
  if(!o)return;
  var P='/api/proxy';
  var oFetch=window.fetch;
  window.fetch=function(i,opt){
    var u=typeof i==='string'?i:(i&&i.url);
    if(!u||(u.indexOf(o)!==0&&!(u.slice(0,5)==='http'&&(function(){try{return new URL(u).origin===o}catch(e){return false}})())))
      return oFetch.call(this,i,opt);
    var pu=P+'?url='+encodeURIComponent(u);
    var ni=typeof i==='string'?pu:(typeof Request!=='undefined'?new Request(pu,i):pu);
    return oFetch.call(this,ni,opt);
  };
  var OX=window.XMLHttpRequest;
  window.XMLHttpRequest=function(){
    var x=new OX(),oo=x.open;
    x.open=function(m,u){
      var a=Array.prototype.slice.call(arguments);
      if(u&&(u.indexOf(o)===0||(u.slice(0,5)==='http'&&(function(){try{return new URL(u).origin===o}catch(e){return false}})())))
        a[1]=P+'?url='+encodeURIComponent(u);
      return oo.apply(this,a);
    };
    return x;
  };
})();
</script>`
      modifiedContent = content
        .replace(/<meta[^>]*http-equiv=["']X-Frame-Options["'][^>]*>/gi, '')
        .replace(/<meta[^>]*name=["']frame-options["'][^>]*>/gi, '')
        .replace(/<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi, '')
        .replace(/src=["']\/([^"']*)["']/g, `src="${urlObj.origin}/$1"`)
        .replace(/href=["']\/([^"']*)["']/g, `href="${urlObj.origin}/$1"`)
        .replace(/src=["']http:\/\//gi, isHttpTarget ? 'src="https://' : 'src="http://')
        .replace(/href=["']http:\/\//gi, isHttpTarget ? 'href="https://' : 'href="http://')
        .replace(/<head>/i, `<head>
${proxyInject}
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
