import { prisma } from '@/app/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const connections = await prisma.connection.findMany()
  return NextResponse.json(connections)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Evita conexão duplicada
  const existing = await prisma.connection.findUnique({
    where: {
      fromGoalId_toGoalId: {
        fromGoalId: body.fromGoalId,
        toGoalId: body.toGoalId
      }
    }
  })

  if (existing) {
    return NextResponse.json(
      { error: 'Connection already exists' },
      { status: 400 }
    )
  }

  const connection = await prisma.connection.create({
    data: {
      fromGoalId: body.fromGoalId,
      toGoalId: body.toGoalId
    }
  })
  return NextResponse.json(connection)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await prisma.connection.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
