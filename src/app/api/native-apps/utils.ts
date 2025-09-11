// 通用动态模块加载器 - 跳过webpack编译
export async function loadNativeModule(moduleName: string): Promise<any> {
    // 仅在服务端环境加载
    if (typeof window !== 'undefined') {
        throw new Error('原生模块只能在服务端加载')
    }

    try {
        // 方法1: 动态require (推荐，绕过webpack静态分析)
        const requireFunc = eval('require')
        return requireFunc(moduleName)
    } catch (error) {
        console.warn(`方法1失败，尝试动态import: ${moduleName}`, error)

        try {
            // 方法2: 动态import
            const module = await import(moduleName)
            return module.default || module
        } catch (importError) {
            console.warn(`方法2失败: ${moduleName}`, importError)

            try {
                // 方法3: 使用createRequire
                const { createRequire } = await import('module')
                const require = createRequire(import.meta.url)
                return require(moduleName)
            } catch (createRequireError) {
                console.error(`所有加载方法都失败: ${moduleName}`, createRequireError)
                throw new Error(`无法加载原生模块: ${moduleName}`)
            }
        }
    }
}


