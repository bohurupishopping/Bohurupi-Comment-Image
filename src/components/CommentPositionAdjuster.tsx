import React from 'react'

interface CommentPositionAdjusterProps {
  position: number
  onPositionChange: (position: number) => void
}

export function CommentPositionAdjuster({ position, onPositionChange }: CommentPositionAdjusterProps) {
  return (
    <div className="flex items-center space-x-4">
      <label className="text-gray-700">Comment Position:</label>
      <input
        type="range"
        min={100}
        max={800}
        value={position}
        onChange={(e) => onPositionChange(Number(e.target.value))}
        className="w-full"
      />
      <span className="text-gray-700">{position}px</span>
    </div>
  )
}