/*
  Warnings:

  - You are about to drop the column `unit` on the `item_units` table. All the data in the column will be lost.
  - Added the required column `quantity` to the `item_units` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_treatment_id_fkey";

-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "treatment_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "item_units" DROP COLUMN "unit",
ADD COLUMN     "quantity" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" SERIAL NOT NULL,
    "item_name" TEXT NOT NULL,
    "unit_type" "UnitType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "purchase_price" DECIMAL(10,2) NOT NULL,
    "discount_price" DECIMAL(10,2) NOT NULL,
    "invoice_id" INTEGER NOT NULL,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
