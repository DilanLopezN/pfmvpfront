'use client'

import { useState, useEffect } from 'react'
import { Goal } from '../types'

interface StarNodeProps {
  goal: Goal
  isSelected: boolean
  isConnecting: boolean
  onSelect: (id: string) => void
  onDragEnd: (id: string, x: number, y: number) => void
  onStartConnection: (id: string) => void
  onCompleteConnection: (id: string) => void
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onOpenDetails: (id: string) => void
}

export default function StarNode({
  goal,
  isSelected,
  isConnecting,
  onSelect,
  onDragEnd,
  onStartConnection,
  onCompleteConnection,
  onToggleComplete,
  onDelete,
  onOpenDetails
}: StarNodeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    e.stopPropagation()

    if (isConnecting) {
      onCompleteConnection(goal.id)
      return
    }

    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragOffset({
      x: e.clientX - goal.positionX,
      y: e.clientY - goal.positionY
    })
    onSelect(goal.id)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y
      onDragEnd(goal.id, newX, newY)
    }

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false)
      const dist = Math.sqrt(
        Math.pow(e.clientX - dragStart.x, 2) +
          Math.pow(e.clientY - dragStart.y, 2)
      )
      if (dist < 5) {
        onOpenDetails(goal.id)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset, dragStart, goal.id, onDragEnd, onOpenDetails])

  const starPath =
    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'

  const dueDate = goal.dueDate
    ? new Date(goal.dueDate).toLocaleDateString('pt-BR')
    : null

  return (
    <div
      className={`absolute cursor-pointer select-none transition-transform duration-100 ${
        isDragging ? 'scale-110 z-50' : 'z-10'
      } ${isConnecting ? 'animate-pulse' : ''}`}
      style={{
        left: goal.positionX - 40,
        top: goal.positionY - 40
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative group">
        <svg
          width="80"
          height="80"
          viewBox="0 0 24 24"
          className={`drop-shadow-lg transition-all duration-300 ${
            goal.completed
              ? 'fill-emerald-400 stroke-emerald-300'
              : isSelected
                ? 'fill-amber-400 stroke-amber-300'
                : 'fill-violet-500 stroke-violet-300'
          } ${isConnecting && !isSelected ? 'fill-cyan-400 stroke-cyan-300' : ''}`}
          style={{
            filter: `drop-shadow(0 0 ${goal.completed ? '12px rgb(52 211 153)' : isSelected ? '15px rgb(251 191 36)' : '8px rgb(139 92 246)'})`
          }}
        >
          <path d={starPath} strokeWidth="0.5" />
        </svg>

        <div
          className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs font-medium backdrop-blur-sm transition-all ${
            goal.completed
              ? 'bg-emerald-900/80 text-emerald-100'
              : 'bg-slate-900/80 text-slate-100'
          }`}
        >
          {goal.title}
          {dueDate && <span className="ml-1 text-slate-400">• {dueDate}</span>}
        </div>

        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={e => {
              e.stopPropagation()
              onStartConnection(goal.id)
            }}
            className="p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-white text-xs"
            title="Conectar"
          >
            🔗
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              onToggleComplete(goal.id)
            }}
            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white text-xs"
            title={goal.completed ? 'Desmarcar' : 'Completar'}
          >
            ✓
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              onDelete(goal.id)
            }}
            className="p-1.5 bg-red-600 hover:bg-red-500 rounded text-white text-xs"
            title="Excluir"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
