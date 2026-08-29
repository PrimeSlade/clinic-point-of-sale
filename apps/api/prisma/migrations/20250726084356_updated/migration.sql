/*
  Warnings:

  - You are about to drop the column `price_percent` on the `items` table. All the data in the column will be lost.
  - Added the required column `price_percent` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "items" DROP COLUMN "price_percent";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "price_percent" INTEGER NOT NULL;
