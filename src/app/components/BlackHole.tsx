'use client'

import { useState, forwardRef } from 'react'
import { Goal } from '../types'

interface BlackHoleProps {
  isActive: boolean
  archivedGoals: Goal[]
  onRestore: (id: string) => void
  onDeletePermanently: (id: string) => void
  onDragRestore: (id: string, x: number, y: number) => void
}

const BlackHole = forwardRef<HTMLDivElement, BlackHoleProps>(
  (
    { isActive, archivedGoals, onRestore, onDeletePermanently, onDragRestore },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [draggingGoal, setDraggingGoal] = useState<Goal | null>(null)
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 })

    const handleDragStart = (e: React.MouseEvent, goal: Goal) => {
      e.preventDefault()
      setDraggingGoal(goal)
      setDragPos({ x: e.clientX, y: e.clientY })

      const handleMouseMove = (e: MouseEvent) => {
        setDragPos({ x: e.clientX, y: e.clientY })
      }

      const handleMouseUp = (e: MouseEvent) => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)

        // Se soltou fora do modal, restaurar na posição
        const modal = document.getElementById('blackhole-modal')
        if (modal) {
          const rect = modal.getBoundingClientRect()
          const isOutsideModal =
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom

          if (isOutsideModal) {
            onDragRestore(goal.id, e.clientX, e.clientY)
            setIsOpen(false)
          }
        }

        setDraggingGoal(null)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return (
      <>
        {/* Buraco Negro */}
        <div
          ref={ref}
          className={`absolute top-20 right-6 z-40 transition-all duration-300 ${
            isActive ? 'scale-125' : 'scale-100'
          }`}
        >
          <button
            onClick={() => setIsOpen(true)}
            className={`relative w-16 h-16 rounded-full transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-br from-purple-900 via-black to-purple-900 shadow-[0_0_40px_rgba(139,92,246,0.8)]'
                : 'bg-gradient-to-br from-slate-900 via-black to-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
            }`}
          >
            {/* Anel externo */}
            <div
              className={`absolute inset-0 rounded-full border-2 transition-all duration-300 ${
                isActive ? 'border-purple-500 animate-spin' : 'border-slate-700'
              }`}
              style={{ animationDuration: '3s' }}
            />

            {/* Anel interno */}
            <div
              className={`absolute inset-2 rounded-full border transition-all duration-300 ${
                isActive ? 'border-violet-400 animate-spin' : 'border-slate-800'
              }`}
              style={{ animationDuration: '2s', animationDirection: 'reverse' }}
            />

            {/* Centro */}
            <div className="absolute inset-4 rounded-full bg-black" />

            {/* Contador */}
            {archivedGoals.length > 0 && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-violet-600 rounded-full text-white text-xs flex items-center justify-center font-bold">
                {archivedGoals.length}
              </div>
            )}
          </button>

          {/* Label */}
          <div className="text-center mt-2 text-xs text-slate-500">
            Buraco Negro
          </div>
        </div>

        {/* Modal de metas arquivadas */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => !draggingGoal && setIsOpen(false)}
          >
            <div
              id="blackhole-modal"
              className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-[28rem] max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl text-white flex items-center gap-2">
                  <span className="text-2xl">🕳️</span>
                  Buraco Negro
                </h2>
                <span className="text-slate-400 text-sm">
                  {archivedGoals.length} meta
                  {archivedGoals.length !== 1 ? 's' : ''}
                </span>
              </div>

              {archivedGoals.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <div className="text-4xl mb-3">✨</div>
                  <p>Nenhuma meta no buraco negro</p>
                  <p className="text-sm mt-1">
                    Arraste estrelas para cá para arquivá-las
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-slate-500 text-xs mb-3">
                    💡 Arraste uma meta para fora do modal para restaurá-la
                  </p>
                  <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2">
                    {archivedGoals.map(goal => (
                      <div
                        key={goal.id}
                        className={`bg-slate-800/50 border border-slate-700 rounded-lg p-4 group cursor-grab active:cursor-grabbing ${
                          draggingGoal?.id === goal.id ? 'opacity-30' : ''
                        }`}
                        onMouseDown={e => handleDragStart(e, goal)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-medium flex items-center gap-2">
                              <span
                                className={
                                  goal.completed
                                    ? 'text-emerald-400'
                                    : 'text-violet-400'
                                }
                              >
                                ✦
                              </span>
                              {goal.title}
                            </h3>
                            {goal.description && (
                              <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                                {goal.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              goal.completed
                                ? 'bg-emerald-900 text-emerald-300'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            {goal.completed ? 'Concluída' : 'Pendente'}
                          </span>
                        </div>

                        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              onRestore(goal.id)
                              if (archivedGoals.length === 1) setIsOpen(false)
                            }}
                            onMouseDown={e => e.stopPropagation()}
                            className="flex-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded text-sm transition-colors"
                          >
                            ↩ Restaurar
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              onDeletePermanently(goal.id)
                              if (archivedGoals.length === 1) setIsOpen(false)
                            }}
                            onMouseDown={e => e.stopPropagation()}
                            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/50 rounded text-sm transition-colors"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 px-4 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Estrela sendo arrastada */}
        {draggingGoal && (
          <div
            className="fixed pointer-events-none z-[100]"
            style={{
              left: dragPos.x - 40,
              top: dragPos.y - 40
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              className={`drop-shadow-lg ${
                draggingGoal.completed
                  ? 'fill-emerald-400 stroke-emerald-300'
                  : 'fill-violet-500 stroke-violet-300'
              }`}
              style={{
                filter: `drop-shadow(0 0 15px ${draggingGoal.completed ? 'rgb(52 211 153)' : 'rgb(139 92 246)'})`
              }}
            >
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                strokeWidth="0.5"
              />
            </svg>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded text-xs font-medium bg-slate-900/90 text-white">
              {draggingGoal.title}
            </div>
          </div>
        )}
      </>
    )
  }
)

BlackHole.displayName = 'BlackHole'

export default BlackHole
