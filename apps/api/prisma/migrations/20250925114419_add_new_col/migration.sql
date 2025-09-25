/*
  Warnings:

  - Added the required column `item_id` to the `invoice_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "item_id" INTEGER NOT NULL;
