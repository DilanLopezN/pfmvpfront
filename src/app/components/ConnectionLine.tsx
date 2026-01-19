'use client'

import { Connection, Goal } from '../types'

interface ConnectionLineProps {
  connection: Connection
  goals: Goal[]
  onDelete: (id: string) => void
}

export default function ConnectionLine({
  connection,
  goals,
  onDelete
}: ConnectionLineProps) {
  const fromGoal = goals.find(g => g.id === connection.fromGoalId)
  const toGoal = goals.find(g => g.id === connection.toGoalId)

  if (!fromGoal || !toGoal) return null

  const x1 = fromGoal.positionX
  const y1 = fromGoal.positionY
  const x2 = toGoal.positionX
  const y2 = toGoal.positionY

  // Ponto médio para o botão de delete
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2

  return (
    <g className="group cursor-pointer">
      {/* Linha de conexão com gradiente */}
      <defs>
        <linearGradient
          id={`grad-${connection.id}`}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Linha principal */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`url(#grad-${connection.id})`}
        strokeWidth="2"
        className="transition-all duration-300"
      />

      {/* Linha mais larga invisível para facilitar hover */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="transparent"
        strokeWidth="20"
      />

      {/* Partículas animadas na linha */}
      <circle r="3" fill="rgb(147, 197, 253)">
        <animateMotion
          dur="3s"
          repeatCount="indefinite"
          path={`M${x1},${y1} L${x2},${y2}`}
        />
      </circle>

      {/* Botão de delete no hover */}
      <foreignObject
        x={midX - 12}
        y={midY - 12}
        width="24"
        height="24"
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <button
          onClick={() => onDelete(connection.id)}
          className="w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
        >
          ✕
        </button>
      </foreignObject>
    </g>
  )
}
