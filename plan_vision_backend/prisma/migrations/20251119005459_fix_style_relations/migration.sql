/*
  Warnings:

  - You are about to drop the column `authVerificationId` on the `Style` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Style" DROP CONSTRAINT "Style_authVerificationId_fkey";

-- AlterTable
ALTER TABLE "Style" DROP COLUMN "authVerificationId";
