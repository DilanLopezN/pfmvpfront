import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const goals = await prisma.goal.findMany({
    include: {
      connectionsFrom: true,
      connectionsTo: true
    },
    orderBy: { createdAt: 'asc' }
  })
  return NextResponse.json(goals)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const goal = await prisma.goal.create({
    data: {
      title: body.title,
      description: body.description,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      completed: body.completed ?? false,
      positionX: body.positionX ?? 200,
      positionY: body.positionY ?? 200
    }
  })
  return NextResponse.json(goal)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const goal = await prisma.goal.update({
    where: { id: body.id },
    data: {
      title: body.title,
      description: body.description,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      completed: body.completed,
      positionX: body.positionX,
      positionY: body.positionY
    }
  })
  return NextResponse.json(goal)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.goal.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
