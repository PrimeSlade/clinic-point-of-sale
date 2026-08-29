/*
  Warnings:

  - You are about to drop the column `purchase_price` on the `invoice_items` table. All the data in the column will be lost.
  - Added the required column `retail_price` to the `invoice_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoice_items" DROP COLUMN "purchase_price",
ADD COLUMN     "retail_price" DECIMAL(10,2) NOT NULL;
