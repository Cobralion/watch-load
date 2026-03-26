/*
  Warnings:

  - The values [UNKOWN] on the enum `Afib` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Afib_new" AS ENUM ('NEGATIVE', 'POSITIVE', 'INCONCLUSIVE', 'UNKNOWN');
ALTER TABLE "HeartMeasurement" ALTER COLUMN "afib" TYPE "Afib_new" USING ("afib"::text::"Afib_new");
ALTER TYPE "Afib" RENAME TO "Afib_old";
ALTER TYPE "Afib_new" RENAME TO "Afib";
DROP TYPE "public"."Afib_old";
COMMIT;
