-- CreateTable
CREATE TABLE "RenderConfig" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "inputImageId" INTEGER NOT NULL,
    "imageTypeId" INTEGER NOT NULL,
    "styleId" INTEGER,
    "customInstructions" TEXT,
    "colorPrimaryHex" TEXT,
    "colorSecondaryHex" TEXT,
    "colorNeutralHex" TEXT,
    "perspectiveAngle" INTEGER,
    "perspectiveX" INTEGER,
    "perspectiveY" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "outputImageUrl" TEXT,
    "errorMessage" TEXT,
    "promptUsed" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "RenderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RenderConfig_projectId_idx" ON "RenderConfig"("projectId");

-- CreateIndex
CREATE INDEX "RenderConfig_inputImageId_idx" ON "RenderConfig"("inputImageId");

-- CreateIndex
CREATE INDEX "RenderConfig_imageTypeId_idx" ON "RenderConfig"("imageTypeId");

-- CreateIndex
CREATE INDEX "RenderConfig_styleId_idx" ON "RenderConfig"("styleId");

-- AddForeignKey
ALTER TABLE "RenderConfig" ADD CONSTRAINT "RenderConfig_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderConfig" ADD CONSTRAINT "RenderConfig_inputImageId_fkey" FOREIGN KEY ("inputImageId") REFERENCES "InputImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderConfig" ADD CONSTRAINT "RenderConfig_imageTypeId_fkey" FOREIGN KEY ("imageTypeId") REFERENCES "ImageType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderConfig" ADD CONSTRAINT "RenderConfig_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "Style"("id") ON DELETE SET NULL ON UPDATE CASCADE;
