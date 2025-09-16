/*
  Warnings:

  - Added the required column `sub_total` to the `invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "sub_total" DECIMAL(10,2) NOT NULL;
