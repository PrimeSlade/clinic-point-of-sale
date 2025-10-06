/*
  Warnings:

  - A unique constraint covering the columns `[barcode]` on the table `items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `barcode` to the `invoice_items` table without a default value. This is not possible if the table is not empty.
  - The required column `barcode` was added to the `items` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "barcode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "barcode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "items_barcode_key" ON "items"("barcode");
