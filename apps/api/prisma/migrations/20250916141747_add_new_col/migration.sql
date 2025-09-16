/*
  Warnings:

  - Added the required column `total_item_discount` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "total_item_discount" DECIMAL(10,2) NOT NULL;
