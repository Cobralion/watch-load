/*
  Warnings:

  - Changed the type of `withings_user_id` on the `WithingsDevice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "WithingsDevice" DROP COLUMN "withings_user_id",
ADD COLUMN     "withings_user_id" INTEGER NOT NULL;
