/*
  Warnings:

  - You are about to drop the `AuthProvider` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AuthProvider" DROP CONSTRAINT "AuthProvider_userId_fkey";

-- DropTable
DROP TABLE "AuthProvider";

-- DropEnum
DROP TYPE "AuthProviderType";
