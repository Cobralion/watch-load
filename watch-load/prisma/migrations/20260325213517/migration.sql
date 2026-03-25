-- DropForeignKey
ALTER TABLE "WithingsDevice" DROP CONSTRAINT "WithingsDevice_user_id_fkey";

-- AddForeignKey
ALTER TABLE "WithingsDevice" ADD CONSTRAINT "WithingsDevice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
