/*
  Warnings:

  - You are about to drop the column `userId` on the `WithingsDevice` table. All the data in the column will be lost.
  - Added the required column `withings_user_id` to the `WithingsDevice` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WithingsDevice" DROP CONSTRAINT "WithingsDevice_userId_fkey";

-- AlterTable
ALTER TABLE "WithingsDevice" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT,
ADD COLUMN     "withings_user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WithingsDevice" ADD CONSTRAINT "WithingsDevice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
