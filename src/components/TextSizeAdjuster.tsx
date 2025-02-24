import React from 'react'

interface TextSizeAdjusterProps {
  textSize: number
  onTextSizeChange: (size: number) => void
}

export function TextSizeAdjuster({ textSize, onTextSizeChange }: TextSizeAdjusterProps) {
  return (
    <div className="flex items-center space-x-4">
      <label className="text-gray-700">Text Size:</label>
      <input
        type="range"
        min={14}
        max={72}
        value={textSize}
        onChange={(e) => onTextSizeChange(Number(e.target.value))}
        className="w-full"
      />
      <span className="text-gray-700">{textSize}px</span>
    </div>
  )
}