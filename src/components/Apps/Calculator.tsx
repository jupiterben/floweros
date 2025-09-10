'use client'

import React, { useState } from 'react'

const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [waitingForNewValue, setWaitingForNewValue] = useState(false)

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

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '', '.', '=']
  ]

  const getButtonClass = (button: string) => {
    if (button === '=') {
      return 'bg-blue-500 hover:bg-blue-600 text-white'
    }
    if (['÷', '×', '-', '+'].includes(button)) {
      return 'bg-gray-500 hover:bg-gray-600 text-white'
    }
    if (['C', '±', '%'].includes(button)) {
      return 'bg-gray-300 hover:bg-gray-400 text-gray-800'
    }
    if (button === '0') {
      return 'col-span-2 bg-gray-200 hover:bg-gray-300 text-gray-800'
    }
    return 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  }

  const handleButtonClick = (button: string) => {
    if (button === 'C') {
      clear()
    } else if (button === '=') {
      performCalculation()
    } else if (['+', '-', '×', '÷'].includes(button)) {
      inputOperation(button)
    } else if (button === '.') {
      inputDecimal()
    } else if (button === '±') {
      setDisplay(String(parseFloat(display) * -1))
    } else if (button === '%') {
      setDisplay(String(parseFloat(display) / 100))
    } else if (button !== '') {
      inputNumber(button)
    }
  }

  return (
    <div className="max-w-xs mx-auto bg-gray-100 rounded-lg p-4">
      {/* 显示屏 */}
      <div className="bg-black text-white text-right text-2xl p-4 rounded mb-4 min-h-[60px] flex items-center justify-end">
        {display}
      </div>

      {/* 按钮网格 */}
      <div className="grid grid-cols-4 gap-2">
        {buttons.flat().map((button, index) => (
          button !== '' ? (
            <button
              key={index}
              onClick={() => handleButtonClick(button)}
              className={`h-12 rounded font-medium transition-colors ${getButtonClass(button)}`}
            >
              {button}
            </button>
          ) : (
            <div key={index} />
          )
        ))}
      </div>
    </div>
  )
}

export default Calculator
