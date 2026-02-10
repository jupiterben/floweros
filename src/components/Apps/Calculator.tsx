'use client'

import React, { useState } from 'react'

type AngleMode = 'deg' | 'rad'

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForNewValue, setWaitingForNewValue] = useState(false)
  const [isScientific, setIsScientific] = useState(false)
  const [angleMode, setAngleMode] = useState<AngleMode>('deg')

  const toRad = (x: number) => (angleMode === 'deg' ? (x * Math.PI) / 180 : x)

  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num)
      setWaitingForNewValue(false)
    } else {
      setDisplay(display === '0' ? num : display + num)
    }
  }

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display)

    if (previousValue === null) {
      setPreviousValue(inputValue)
    } else if (operation) {
      const currentValue = previousValue || 0
      const newValue = calculate(currentValue, inputValue, operation)

      setDisplay(String(newValue))
      setPreviousValue(newValue)
    }

    setWaitingForNewValue(true)
    setOperation(nextOperation)
  }

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue
      case '-':
        return firstValue - secondValue
      case '×':
        return firstValue * secondValue
      case '÷':
        return firstValue / secondValue
      case '^':
        return Math.pow(firstValue, secondValue)
      case '=':
        return secondValue
      default:
        return secondValue
    }
  }

  const performCalculation = () => {
    const inputValue = parseFloat(display)

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation)
      setDisplay(String(newValue))
      setPreviousValue(null)
      setOperation(null)
      setWaitingForNewValue(true)
    }
  }

  const clear = () => {
    setDisplay('0')
    setPreviousValue(null)
    setOperation(null)
    setWaitingForNewValue(false)
  }

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.')
      setWaitingForNewValue(false)
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.')
    }
  }

  const applyScientific = (fn: (x: number) => number) => {
    const x = parseFloat(display)
    if (Number.isNaN(x)) return
    const result = fn(x)
    const str = Number.isFinite(result) ? String(result) : 'Error'
    setDisplay(str)
    setWaitingForNewValue(true)
  }

  const scientificOps: Record<string, () => void> = {
    sin: () => applyScientific((x) => Math.sin(toRad(x))),
    cos: () => applyScientific((x) => Math.cos(toRad(x))),
    tan: () => applyScientific((x) => Math.tan(toRad(x))),
    ln: () => applyScientific((x) => Math.log(x)),
    log: () => applyScientific((x) => Math.log10(x)),
    sqrt: () => applyScientific((x) => Math.sqrt(x)),
    'x²': () => applyScientific((x) => x * x),
    '1/x': () => applyScientific((x) => 1 / x),
    'π': () => { setDisplay(String(Math.PI)); setWaitingForNewValue(true) },
    'e': () => { setDisplay(String(Math.E)); setWaitingForNewValue(true) },
  }

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '', '.', '=']
  ]

  const getButtonClass = (button: string) => {
    if (button === '=') {
      return 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white'
    }
    if (['÷', '×', '-', '+', '^'].includes(button)) {
      return 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white'
    }
    if (['C', '±', '%'].includes(button)) {
      return 'bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-800'
    }
    if (button === '0') {
      return 'col-span-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800'
    }
    if (['sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'x²', '1/x', 'π', 'e'].includes(button)) {
      return 'bg-slate-400 hover:bg-slate-500 active:bg-slate-600 text-white text-sm'
    }
    return 'bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800'
  }

  const handleButtonClick = (button: string) => {
    if (button === 'C') {
      clear()
    } else if (button === '=') {
      performCalculation()
    } else if (['+', '-', '×', '÷', '^'].includes(button)) {
      inputOperation(button)
    } else if (button === '.') {
      inputDecimal()
    } else if (button === '±') {
      setDisplay(String(parseFloat(display) * -1))
    } else if (button === '%') {
      setDisplay(String(parseFloat(display) / 100))
    } else if (button in scientificOps) {
      scientificOps[button]()
    } else if (button !== '') {
      inputNumber(button)
    }
  }

  const scientificRows = [
    ['sin', 'cos', 'tan', 'ln'],
    ['log', 'sqrt', 'x²', '1/x'],
    ['π', 'e', '^', angleMode],
  ]

  return (
    <div className={`w-full mx-auto bg-gray-100 dark:bg-gray-800 rounded-xl p-4 shadow-inner border border-gray-200 dark:border-gray-700 ${isScientific ? 'max-w-[320px]' : 'max-w-[280px]'}`}>
      {/* 模式切换 */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <button
          type="button"
          onClick={() => setIsScientific(!isScientific)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200"
        >
          {isScientific ? '科学' : '标准'}
        </button>
        {isScientific && (
          <button
            type="button"
            onClick={() => setAngleMode((m) => (m === 'deg' ? 'rad' : 'deg'))}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-500 hover:bg-slate-600 text-white"
          >
            {angleMode === 'deg' ? 'DEG' : 'RAD'}
          </button>
        )}
      </div>

      {/* 显示屏 */}
      <div className="bg-gray-900 text-green-400 text-right text-2xl font-mono p-4 rounded-lg mb-4 min-h-[64px] flex items-center justify-end overflow-hidden break-all">
        <span className="truncate" title={display}>{display}</span>
      </div>

      {/* 科学函数区 */}
      {isScientific && (
        <div className="grid grid-cols-4 gap-2 mb-2">
          {scientificRows.flatMap((row, rowIndex) =>
            row.map((btn, colIndex) =>
              btn === angleMode ? (
                <button
                  key={`s-${rowIndex}-${colIndex}`}
                  type="button"
                  onClick={() => setAngleMode((m) => (m === 'deg' ? 'rad' : 'deg'))}
                  className="h-10 rounded-lg text-sm font-medium bg-slate-500 hover:bg-slate-600 text-white"
                >
                  {angleMode}
                </button>
              ) : (
                <button
                  key={`s-${rowIndex}-${colIndex}`}
                  type="button"
                  onClick={() => handleButtonClick(btn)}
                  className={`h-10 rounded-lg font-medium transition-colors select-none ${getButtonClass(btn)}`}
                >
                  {btn}
                </button>
              )
            )
          )}
        </div>
      )}

      {/* 标准按钮网格 */}
      <div className="grid grid-cols-4 gap-2">
        {buttons.flatMap((row, rowIndex) =>
          row.map((button, colIndex) =>
            button !== '' ? (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                onClick={() => handleButtonClick(button)}
                className={`h-14 rounded-lg font-medium transition-colors select-none ${getButtonClass(button)}`}
              >
                {button}
              </button>
            ) : (
              <div key={`${rowIndex}-${colIndex}`} aria-hidden />
            )
          )
        )}
      </div>
    </div>
  )
}

export default Calculator
