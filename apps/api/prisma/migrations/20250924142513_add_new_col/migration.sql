/*
  Warnings:

  - You are about to drop the column `item_id` on the `invoice_items` table. All the data in the column will be lost.
  - You are about to drop the column `service_id` on the `invoice_services` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_item_id_fkey";

-- DropForeignKey
ALTER TABLE "invoice_services" DROP CONSTRAINT "invoice_services_service_id_fkey";

-- AlterTable
ALTER TABLE "invoice_items" DROP COLUMN "item_id";

-- AlterTable
ALTER TABLE "invoice_services" DROP COLUMN "service_id";

-- AlterTable
ALTER TABLE "treatments" ADD COLUMN     "investigation" TEXT;
