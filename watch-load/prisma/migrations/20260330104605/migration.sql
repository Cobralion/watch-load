/*
  Warnings:

  - You are about to drop the `Trails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Trails" DROP CONSTRAINT "Trails_heart_measurement_id_fkey";

-- DropIndex
DROP INDEX "HeartMeasurement_signal_id_timestamp_idx";

-- AlterTable
ALTER TABLE "HeartMeasurement" ADD COLUMN     "trails_id" TEXT;

-- DropTable
DROP TABLE "Trails";

-- CreateIndex
CREATE INDEX "HeartMeasurement_signal_id_timestamp_trails_id_idx" ON "HeartMeasurement"("signal_id", "timestamp", "trails_id");
