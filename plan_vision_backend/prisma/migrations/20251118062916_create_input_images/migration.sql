-- CreateTable
CREATE TABLE "InputImage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InputImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InputImage_userId_idx" ON "InputImage"("userId");

-- AddForeignKey
ALTER TABLE "InputImage" ADD CONSTRAINT "InputImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
