/*
  Warnings:

  - Added the required column `rate` to the `item_units` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "item_units" ADD COLUMN     "rate" DECIMAL(10,2) NOT NULL;
