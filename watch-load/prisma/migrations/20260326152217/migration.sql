/*
  Warnings:

  - You are about to drop the `ECGData` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Afib" AS ENUM ('NEGATIVE', 'POSITIVE', 'INCONCLUSIVE');

-- DropTable
DROP TABLE "ECGData";

-- CreateTable
CREATE TABLE "HeartMeasurement" (
    "id" TEXT NOT NULL,
    "signal_id" BIGINT NOT NULL,
    "device_id" TEXT NOT NULL,
    "heart_rate" INTEGER NOT NULL,
    "afib" "Afib" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "modified" TIMESTAMP(3) NOT NULL,
    "signal" INTEGER[],
    "sampling_frequency" INTEGER NOT NULL,

    CONSTRAINT "HeartMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trails" (
    "id" TEXT NOT NULL,
    "trail_id" TEXT NOT NULL,
    "heart_measurement_id" TEXT NOT NULL,

    CONSTRAINT "Trails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HeartMeasurement_signal_id_key" ON "HeartMeasurement"("signal_id");

-- CreateIndex
CREATE INDEX "HeartMeasurement_signal_id_timestamp_idx" ON "HeartMeasurement"("signal_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Trails_trail_id_key" ON "Trails"("trail_id");

-- CreateIndex
CREATE UNIQUE INDEX "Trails_heart_measurement_id_key" ON "Trails"("heart_measurement_id");

-- AddForeignKey
ALTER TABLE "Trails" ADD CONSTRAINT "Trails_heart_measurement_id_fkey" FOREIGN KEY ("heart_measurement_id") REFERENCES "HeartMeasurement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
