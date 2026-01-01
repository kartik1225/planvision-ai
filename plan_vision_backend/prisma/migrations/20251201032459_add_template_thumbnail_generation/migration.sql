-- AlterTable
ALTER TABLE "plan_vision"."project_template" ADD COLUMN     "defaultStyleId" TEXT,
ADD COLUMN     "generatedThumbnailUrl" VARCHAR(2048),
ADD COLUMN     "generationOptions" JSONB,
ADD COLUMN     "originalThumbnailUrl" VARCHAR(2048);

-- AddForeignKey
ALTER TABLE "plan_vision"."project_template" ADD CONSTRAINT "project_template_defaultStyleId_fkey" FOREIGN KEY ("defaultStyleId") REFERENCES "plan_vision"."style"("id") ON DELETE SET NULL ON UPDATE CASCADE;
