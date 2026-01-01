-- AlterTable
ALTER TABLE "Style" ADD COLUMN     "authVerificationId" TEXT;

-- CreateTable
CREATE TABLE "_ImageTypeToStyle" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ImageTypeToStyle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ImageTypeToStyle_B_index" ON "_ImageTypeToStyle"("B");

-- AddForeignKey
ALTER TABLE "Style" ADD CONSTRAINT "Style_authVerificationId_fkey" FOREIGN KEY ("authVerificationId") REFERENCES "auth_verification"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageTypeToStyle" ADD CONSTRAINT "_ImageTypeToStyle_A_fkey" FOREIGN KEY ("A") REFERENCES "ImageType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ImageTypeToStyle" ADD CONSTRAINT "_ImageTypeToStyle_B_fkey" FOREIGN KEY ("B") REFERENCES "Style"("id") ON DELETE CASCADE ON UPDATE CASCADE;
