/*
  Warnings:

  - Added the required column `discount_amount` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `invoices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('kpay', 'wave', 'cash', 'others');

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "discount_amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "payment_description" TEXT,
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL,
ADD COLUMN     "total_amount" DECIMAL(10,2) NOT NULL;
