-- CreateTable
CREATE TABLE "ProjectTemplate" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT NOT NULL,
    "sampleImageUrls" TEXT[],
    "defaultImageTypeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ProjectTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectTemplate" ADD CONSTRAINT "ProjectTemplate_defaultImageTypeId_fkey" FOREIGN KEY ("defaultImageTypeId") REFERENCES "ImageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
