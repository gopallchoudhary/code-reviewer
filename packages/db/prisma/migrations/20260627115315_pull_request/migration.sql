-- CreateTable
CREATE TABLE "pull_request" (
    "id" TEXT NOT NULL,
    "installationId" INTEGER NOT NULL,
    "repoFullName" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "authorLogin" TEXT,
    "headSha" TEXT NOT NULL,
    "userId" TEXT,
    "baseBranch" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewComments" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pull_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pull_request_repoFullName_prNumber_key" ON "pull_request"("repoFullName", "prNumber");

-- AddForeignKey
ALTER TABLE "pull_request" ADD CONSTRAINT "pull_request_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
