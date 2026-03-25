/*
  Warnings:

  - Made the column `user_id` on table `WithingsDevice` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "WithingsDevice" DROP CONSTRAINT "WithingsDevice_user_id_fkey";

-- AlterTable
ALTER TABLE "WithingsDevice" ALTER COLUMN "user_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "WithingsDevice" ADD CONSTRAINT "WithingsDevice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
