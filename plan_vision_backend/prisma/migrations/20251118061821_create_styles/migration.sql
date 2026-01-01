-- CreateTable
CREATE TABLE "Style" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "promptFragment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Style_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Style_name_key" ON "Style"("name");
