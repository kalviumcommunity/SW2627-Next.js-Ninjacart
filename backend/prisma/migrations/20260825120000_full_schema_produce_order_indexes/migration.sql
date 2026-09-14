-- AlterEnum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ADMIN';

-- CreateEnum
CREATE TYPE "ProduceCategory" AS ENUM ('VEGETABLES', 'FRUITS', 'GRAINS', 'TUBERS', 'HERBS', 'DAIRY', 'OTHER');

-- CreateEnum
CREATE TYPE "ProduceStatus" AS ENUM ('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- AlterTable
ALTER TABLE "farmers" ADD COLUMN "phone" TEXT,
ADD COLUMN "location" TEXT,
ADD COLUMN "bio" TEXT;

-- AlterTable
ALTER TABLE "retailers" ADD COLUMN "storeName" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "location" TEXT;

-- CreateTable
CREATE TABLE "produces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ProduceCategory" NOT NULL DEFAULT 'VEGETABLES',
    "price" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minOrderQuantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "status" "ProduceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "farmerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "deliveryAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE INDEX "produces_status_idx" ON "produces"("status");

-- CreateIndex
CREATE INDEX "produces_createdAt_idx" ON "produces"("createdAt");

-- CreateIndex
CREATE INDEX "produces_farmerId_idx" ON "produces"("farmerId");

-- CreateIndex
CREATE INDEX "produces_category_idx" ON "produces"("category");

-- CreateIndex
CREATE INDEX "produces_status_createdAt_idx" ON "produces"("status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_retailerId_idx" ON "orders"("retailerId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_produceId_idx" ON "order_items"("produceId");

-- AddForeignKey
ALTER TABLE "produces" ADD CONSTRAINT "produces_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "retailers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "produces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
