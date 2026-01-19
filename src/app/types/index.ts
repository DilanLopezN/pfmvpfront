export interface Goal {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  completed: boolean
  positionX: number
  positionY: number
  createdAt: string
  updatedAt: string
  connectionsFrom?: Connection[]
  connectionsTo?: Connection[]
}

export interface Connection {
  id: string
  fromGoalId: string
  toGoalId: string
  createdAt: string
}
