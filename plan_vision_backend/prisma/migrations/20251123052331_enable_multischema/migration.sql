/*
  Warnings:

  - You are about to drop the column `age` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `ImageType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InputImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Project` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectTemplate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RenderConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Style` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ImageTypeToStyle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `auth_verification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "InputImage" DROP CONSTRAINT "InputImage_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectTemplate" DROP CONSTRAINT "ProjectTemplate_defaultImageTypeId_fkey";

-- DropForeignKey
ALTER TABLE "RenderConfig" DROP CONSTRAINT "RenderConfig_imageTypeId_fkey";

-- DropForeignKey
ALTER TABLE "RenderConfig" DROP CONSTRAINT "RenderConfig_inputImageId_fkey";

-- DropForeignKey
ALTER TABLE "RenderConfig" DROP CONSTRAINT "RenderConfig_projectId_fkey";

-- DropForeignKey
ALTER TABLE "RenderConfig" DROP CONSTRAINT "RenderConfig_styleId_fkey";

-- DropForeignKey
ALTER TABLE "_ImageTypeToStyle" DROP CONSTRAINT "_ImageTypeToStyle_A_fkey";

-- DropForeignKey
ALTER TABLE "_ImageTypeToStyle" DROP CONSTRAINT "_ImageTypeToStyle_B_fkey";

-- DropForeignKey
ALTER TABLE "auth_account" DROP CONSTRAINT "auth_account_userId_fkey";

-- DropForeignKey
ALTER TABLE "auth_session" DROP CONSTRAINT "auth_session_userId_fkey";

-- AlterTable
ALTER TABLE "plan_vision"."user" DROP COLUMN "age",
DROP COLUMN "firstName",
DROP COLUMN "lastName";

-- DropTable
DROP TABLE "ImageType";

-- DropTable
DROP TABLE "InputImage";

-- DropTable
DROP TABLE "Project";

-- DropTable
DROP TABLE "ProjectTemplate";

-- DropTable
DROP TABLE "RenderConfig";

-- DropTable
DROP TABLE "Style";

-- DropTable
DROP TABLE "_ImageTypeToStyle";

-- DropTable
DROP TABLE "auth_account";

-- DropTable
DROP TABLE "auth_session";

-- DropTable
DROP TABLE "auth_verification";

-- CreateTable
CREATE TABLE "plan_vision"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_vision"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_vision"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6),
    "userId" TEXT,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_vision"."project" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_vision"."image" (
    "id" TEXT NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_vision"."image_type" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "image_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_vision"."render_config" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "imageUrl" VARCHAR(2048),
    "imageTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "render_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_vision"."project_template" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "thumbnailUrl" VARCHAR(2048) NOT NULL,
    "sampleImageUrls" TEXT[],
    "defaultImageTypeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "project_template_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "plan_vision"."session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "image_type_value_key" ON "plan_vision"."image_type"("value");

-- CreateIndex
CREATE UNIQUE INDEX "render_config_value_key" ON "plan_vision"."render_config"("value");

-- AddForeignKey
ALTER TABLE "plan_vision"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "plan_vision"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "plan_vision"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."verification" ADD CONSTRAINT "verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "plan_vision"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."project" ADD CONSTRAINT "project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "plan_vision"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."image" ADD CONSTRAINT "image_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "plan_vision"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."render_config" ADD CONSTRAINT "render_config_imageTypeId_fkey" FOREIGN KEY ("imageTypeId") REFERENCES "plan_vision"."image_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_vision"."project_template" ADD CONSTRAINT "project_template_defaultImageTypeId_fkey" FOREIGN KEY ("defaultImageTypeId") REFERENCES "plan_vision"."image_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
