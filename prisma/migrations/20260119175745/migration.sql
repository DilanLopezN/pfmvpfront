-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "positionX" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "positionY" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "fromGoalId" TEXT NOT NULL,
    "toGoalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Connection_fromGoalId_toGoalId_key" ON "Connection"("fromGoalId", "toGoalId");

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_fromGoalId_fkey" FOREIGN KEY ("fromGoalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_toGoalId_fkey" FOREIGN KEY ("toGoalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
