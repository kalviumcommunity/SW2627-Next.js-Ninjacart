-- CreateEnum
CREATE TYPE "ProduceStatus" AS ENUM ('AVAILABLE', 'SOLD_OUT');

-- CreateTable
CREATE TABLE "produce" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "status" "ProduceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "farmerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produce_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "produce" ADD CONSTRAINT "produce_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
