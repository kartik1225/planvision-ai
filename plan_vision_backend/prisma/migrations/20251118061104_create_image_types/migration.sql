-- CreateTable
CREATE TABLE "ImageType" (
    "id" SERIAL NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "ImageType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ImageType_label_key" ON "ImageType"("label");

-- CreateIndex
CREATE UNIQUE INDEX "ImageType_value_key" ON "ImageType"("value");
