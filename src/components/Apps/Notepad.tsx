'use client'

import React, { useState } from 'react'
import { Save, FileText, Bold, Italic, Underline } from 'lucide-react'

const Notepad: React.FC = () => {
  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('新建文档.txt')
  const [isModified, setIsModified] = useState(false)

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    setIsModified(true)
  }

  const handleSave = () => {
    // 这里可以实现保存逻辑
    console.log('保存文件:', fileName, content)
    setIsModified(false)
    
    // 创建下载链接
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleNew = () => {
    if (isModified) {
      const confirmed = confirm('当前文档已修改，是否要保存？')
      if (confirmed) {
        handleSave()
      }
    }
    setContent('')
    setFileName('新建文档.txt')
    setIsModified(false)
  }

  const insertText = (text: string) => {
    const textarea = document.querySelector('textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newContent = content.substring(0, start) + text + content.substring(end)
      setContent(newContent)
      setIsModified(true)
      
      // 重新设置光标位置
      setTimeout(() => {
        textarea.selectionStart = start + text.length
        textarea.selectionEnd = start + text.length
        textarea.focus()
      }, 0)
    }
  }

  const formatText = (format: string) => {
    const textarea = document.querySelector('textarea')
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = content.substring(start, end)
      
      if (selectedText) {
        let formattedText = selectedText
        switch (format) {
          case 'bold':
            formattedText = `**${selectedText}**`
            break
          case 'italic':
            formattedText = `*${selectedText}*`
            break
          case 'underline':
            formattedText = `_${selectedText}_`
            break
        }
        
        const newContent = content.substring(0, start) + formattedText + content.substring(end)
        setContent(newContent)
        setIsModified(true)
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNew}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="新建"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="保存"
          >
            <Save className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <button
            onClick={() => formatText('bold')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="粗体"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => formatText('italic')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="斜体"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => formatText('underline')}
            className="p-2 hover:bg-gray-200 rounded transition-colors"
            title="下划线"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="文件名"
          />
          {isModified && <span className="text-red-500 text-sm">*</span>}
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 p-4">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="开始输入..."
          className="w-full h-full resize-none outline-none font-mono text-sm leading-relaxed"
          style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
        />
      </div>

      {/* 状态栏 */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex justify-between">
        <span>字符数: {content.length}</span>
        <span>行数: {content.split('\n').length}</span>
      </div>
    </div>
  )
}

export default Notepad
