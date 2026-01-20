'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

import StarNode from './StarNode'
import ConnectionLine from './ConnectionLine'
import BlackHole from './BlackHole'
import { Connection, Goal } from '../types'

export default function GoalBoard() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [archivedGoals, setArchivedGoals] = useState<Goal[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null)
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    dueDate: ''
  })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [detailsGoalId, setDetailsGoalId] = useState<string | null>(null)
  const [isDraggingAny, setIsDraggingAny] = useState(false)
  const blackHoleRef = useRef<HTMLDivElement>(null)

  // Função para verificar colisão com buraco negro
  const checkBlackHoleCollision = useCallback((x: number, y: number) => {
    if (!blackHoleRef.current) return false
    const rect = blackHoleRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    )
    return distance < 50
  }, [])

  // Carregar dados
  const fetchData = useCallback(async () => {
    const [goalsRes, archivedRes, connectionsRes] = await Promise.all([
      fetch('/api/goals'),
      fetch('/api/goals?archived=true'),
      fetch('/api/connections')
    ])
    const allGoals = await archivedRes.json()
    setGoals((await goalsRes.json()) as Goal[])
    setArchivedGoals(allGoals.filter((g: Goal) => g.archived))
    setConnections(await connectionsRes.json())
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Rastrear mouse para linha de conexão temporária
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Criar goal
  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) return

    await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...newGoal,
        positionX: 200 + Math.random() * 400,
        positionY: 200 + Math.random() * 300
      })
    })
    setNewGoal({ title: '', description: '', dueDate: '' })
    setIsAddingGoal(false)
    fetchData()
  }

  // Atualizar posição
  const handleDragEnd = async (id: string, x: number, y: number) => {
    setGoals(prev =>
      prev.map(g => (g.id === id ? { ...g, positionX: x, positionY: y } : g))
    )

    const goal = goals.find(g => g.id === id)
    if (goal) {
      await fetch('/api/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...goal, positionX: x, positionY: y })
      })
    }
  }

  // Toggle complete
  const handleToggleComplete = async (id: string) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return

    await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...goal, completed: !goal.completed })
    })
    fetchData()
  }

  // Deletar goal permanentemente
  const handleDeleteGoal = async (id: string) => {
    await fetch(`/api/goals?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  // Arquivar goal (enviar para buraco negro)
  const handleArchiveGoal = async (id: string) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return

    await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...goal, archived: true })
    })
    fetchData()
  }

  // Restaurar goal do buraco negro
  const handleRestoreGoal = async (id: string) => {
    const goal = archivedGoals.find(g => g.id === id)
    if (!goal) return

    await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...goal,
        archived: false,
        positionX: 200 + Math.random() * 400,
        positionY: 200 + Math.random() * 300
      })
    })
    fetchData()
  }

  // Restaurar goal arrastando do buraco negro
  const handleDragRestore = async (id: string, x: number, y: number) => {
    const goal = archivedGoals.find(g => g.id === id)
    if (!goal) return

    await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...goal,
        archived: false,
        positionX: x,
        positionY: y
      })
    })
    fetchData()
  }

  // Iniciar conexão
  const handleStartConnection = (id: string) => {
    setConnectingFromId(id)
    setSelectedGoalId(id)
  }

  // Completar conexão
  const handleCompleteConnection = async (toId: string) => {
    if (!connectingFromId || connectingFromId === toId) {
      setConnectingFromId(null)
      return
    }

    await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromGoalId: connectingFromId, toGoalId: toId })
    })
    setConnectingFromId(null)
    fetchData()
  }

  // Deletar conexão
  const handleDeleteConnection = async (id: string) => {
    await fetch(`/api/connections?id=${id}`, { method: 'DELETE' })
    fetchData()
  }

  // Cancelar conexão ao clicar no board
  const handleBoardClick = () => {
    if (connectingFromId) {
      setConnectingFromId(null)
    }
    setSelectedGoalId(null)
  }

  const connectingFromGoal = connectingFromId
    ? goals.find(g => g.id === connectingFromId)
    : null

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at center, #1a1a2e 0%, #0f0f1a 100%)'
      }}
      onClick={handleBoardClick}
    >
      {/* Grid de fundo estilo constelação */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* SVG para conexões */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <g className="pointer-events-auto">
          {connections.map(conn => (
            <ConnectionLine
              key={conn.id}
              connection={conn}
              goals={goals}
              onDelete={handleDeleteConnection}
            />
          ))}

          {/* Linha temporária durante conexão */}
          {connectingFromGoal && (
            <line
              x1={connectingFromGoal.positionX}
              y1={connectingFromGoal.positionY}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="rgb(6, 182, 212)"
              strokeWidth="2"
              strokeDasharray="8 4"
              opacity="0.6"
            />
          )}
        </g>
      </svg>

      {/* Goals/Estrelas */}
      {goals.map(goal => (
        <StarNode
          key={goal.id}
          goal={goal}
          isSelected={selectedGoalId === goal.id}
          isConnecting={!!connectingFromId}
          onSelect={setSelectedGoalId}
          onDragEnd={handleDragEnd}
          onDragStateChange={setIsDraggingAny}
          onStartConnection={handleStartConnection}
          onCompleteConnection={handleCompleteConnection}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteGoal}
          onOpenDetails={setDetailsGoalId}
          onArchive={handleArchiveGoal}
          checkBlackHoleCollision={checkBlackHoleCollision}
        />
      ))}

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <h1 className="text-2xl font-light tracking-widest text-white/80">
          ✦ CONSTELAÇÃO DE METAS
        </h1>
        <button
          onClick={e => {
            e.stopPropagation()
            setIsAddingGoal(true)
          }}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2"
        >
          <span>+ Nova Meta</span>
        </button>
      </div>

      {/* Buraco Negro */}
      <BlackHole
        ref={blackHoleRef}
        isActive={isDraggingAny}
        archivedGoals={archivedGoals}
        onRestore={handleRestoreGoal}
        onDeletePermanently={handleDeleteGoal}
        onDragRestore={handleDragRestore}
      />

      {/* Legenda */}
      <div className="absolute bottom-6 left-6 flex gap-4 text-sm text-white/60">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-violet-500" />
          <span>Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-400" />
          <span>Concluída</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-400" />
          <span>Selecionada</span>
        </div>
      </div>

      {/* Instruções */}
      {connectingFromId && (
        <div className="absolute bottom-6 right-6 px-4 py-2 bg-cyan-600/80 text-white rounded-lg animate-pulse">
          Clique em outra estrela para conectar ou no quadro para cancelar
        </div>
      )}

      {/* Modal de nova meta */}
      {isAddingGoal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          onClick={e => {
            e.stopPropagation()
            setIsAddingGoal(false)
          }}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-96 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl text-white mb-4">✦ Nova Meta</h2>

            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">Título *</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={e =>
                    setNewGoal(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
                  placeholder="Ex: Aprender React"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm">Descrição</label>
                <textarea
                  value={newGoal.description}
                  onChange={e =>
                    setNewGoal(prev => ({
                      ...prev,
                      description: e.target.value
                    }))
                  }
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500 resize-none"
                  rows={3}
                  placeholder="Detalhes da meta..."
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm">Data limite</label>
                <input
                  type="date"
                  value={newGoal.dueDate}
                  onChange={e =>
                    setNewGoal(prev => ({ ...prev, dueDate: e.target.value }))
                  }
                  className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsAddingGoal(false)}
                className="flex-1 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGoal}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors"
              >
                Criar Meta
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de detalhes */}
      {detailsGoalId &&
        (() => {
          const goal = goals.find(g => g.id === detailsGoalId)
          if (!goal) return null
          const dueDate = goal.dueDate
            ? new Date(goal.dueDate).toLocaleDateString('pt-BR')
            : null
          return (
            <div
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
              onClick={() => setDetailsGoalId(null)}
            >
              <div
                className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-96 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl text-white flex items-center gap-2">
                    <span
                      className={
                        goal.completed ? 'text-emerald-400' : 'text-violet-400'
                      }
                    >
                      ✦
                    </span>
                    {goal.title}
                  </h2>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      goal.completed
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {goal.completed ? 'Concluída' : 'Pendente'}
                  </span>
                </div>

                {goal.description && (
                  <p className="text-slate-300 mb-4">{goal.description}</p>
                )}

                {dueDate && (
                  <p className="text-slate-400 text-sm mb-4">
                    📅 Data limite: {dueDate}
                  </p>
                )}

                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => {
                      handleToggleComplete(goal.id)
                      setDetailsGoalId(null)
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      goal.completed
                        ? 'bg-slate-700 hover:bg-slate-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {goal.completed ? 'Reabrir' : 'Concluir'}
                  </button>
                  <button
                    onClick={() => setDetailsGoalId(null)}
                    className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
    </div>
  )
}
