-- CreateTable
CREATE TABLE "plan_vision"."style_thumbnail" (
    "id" TEXT NOT NULL,
    "styleId" TEXT NOT NULL,
    "imageTypeId" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "style_thumbnail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "style_thumbnail_styleId_imageTypeId_key" ON "plan_vision"."style_thumbnail"("styleId", "imageTypeId");

-- AddForeignKey
ALTER TABLE "plan_vision"."style_thumbnail" ADD CONSTRAINT "style_thumbnail_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "plan_vision"."style"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."style_thumbnail" ADD CONSTRAINT "style_thumbnail_imageTypeId_fkey" FOREIGN KEY ("imageTypeId") REFERENCES "plan_vision"."image_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;
