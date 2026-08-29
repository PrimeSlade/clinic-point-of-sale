/*
  Warnings:

  - You are about to alter the column `rate` on the `item_units` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "item_units" ALTER COLUMN "rate" SET DATA TYPE INTEGER;
