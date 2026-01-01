/*
  Warnings:

  - You are about to drop the column `description` on the `render_config` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `render_config` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `render_config` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `render_config` table. All the data in the column will be lost.
  - You are about to drop the `image` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `inputImageId` to the `render_config` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectId` to the `render_config` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_projectId_fkey";

-- DropForeignKey
ALTER TABLE "render_config" DROP CONSTRAINT "render_config_imageTypeId_fkey";

-- DropIndex
DROP INDEX "render_config_value_key";

-- AlterTable
ALTER TABLE "plan_vision"."project_template" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "plan_vision"."render_config" DROP COLUMN "description",
DROP COLUMN "imageUrl",
DROP COLUMN "label",
DROP COLUMN "value",
ADD COLUMN     "colorNeutralHex" TEXT,
ADD COLUMN     "colorPrimaryHex" TEXT,
ADD COLUMN     "colorSecondaryHex" TEXT,
ADD COLUMN     "customInstructions" TEXT,
ADD COLUMN     "inputImageId" TEXT NOT NULL,
ADD COLUMN     "perspectiveAngle" INTEGER,
ADD COLUMN     "perspectiveX" INTEGER,
ADD COLUMN     "perspectiveY" INTEGER,
ADD COLUMN     "projectId" TEXT NOT NULL,
ADD COLUMN     "styleId" TEXT,
ADD COLUMN     "styleReferenceId" TEXT;

-- DropTable
DROP TABLE "image";

-- CreateTable
CREATE TABLE "plan_vision"."input_image" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "input_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_vision"."style" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "promptFragment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "style_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_vision"."generation" (
    "id" TEXT NOT NULL,
    "renderConfigId" TEXT NOT NULL,
    "promptUsed" TEXT NOT NULL,
    "outputImageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_vision"."_ImageTypeToStyle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ImageTypeToStyle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "style_name_key" ON "plan_vision"."style"("name");

-- CreateIndex
CREATE INDEX "_ImageTypeToStyle_B_index" ON "plan_vision"."_ImageTypeToStyle"("B");

-- AddForeignKey
ALTER TABLE "plan_vision"."input_image" ADD CONSTRAINT "input_image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "plan_vision"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."render_config" ADD CONSTRAINT "render_config_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "plan_vision"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."render_config" ADD CONSTRAINT "render_config_inputImageId_fkey" FOREIGN KEY ("inputImageId") REFERENCES "plan_vision"."input_image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."render_config" ADD CONSTRAINT "render_config_imageTypeId_fkey" FOREIGN KEY ("imageTypeId") REFERENCES "plan_vision"."image_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."render_config" ADD CONSTRAINT "render_config_styleId_fkey" FOREIGN KEY ("styleId") REFERENCES "plan_vision"."style"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."render_config" ADD CONSTRAINT "render_config_styleReferenceId_fkey" FOREIGN KEY ("styleReferenceId") REFERENCES "plan_vision"."input_image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."generation" ADD CONSTRAINT "generation_renderConfigId_fkey" FOREIGN KEY ("renderConfigId") REFERENCES "plan_vision"."render_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."_ImageTypeToStyle" ADD CONSTRAINT "_ImageTypeToStyle_A_fkey" FOREIGN KEY ("A") REFERENCES "plan_vision"."image_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."_ImageTypeToStyle" ADD CONSTRAINT "_ImageTypeToStyle_B_fkey" FOREIGN KEY ("B") REFERENCES "plan_vision"."style"("id") ON DELETE CASCADE ON UPDATE CASCADE;
