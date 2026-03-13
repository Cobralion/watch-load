-- CreateTable
CREATE TABLE "ECGData" (
    "id" TEXT NOT NULL,
    "trails_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "ECGData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithingsDevice" (
    "id" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "WithingsDevice_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WithingsDevice" ADD CONSTRAINT "WithingsDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
