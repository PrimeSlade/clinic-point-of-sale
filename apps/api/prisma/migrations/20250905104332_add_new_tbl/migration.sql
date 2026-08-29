-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_invoice_id_fkey";

-- CreateTable
CREATE TABLE "invoice_services" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "invoice_id" INTEGER NOT NULL,
    "service_id" INTEGER,
    "name" TEXT NOT NULL,
    "retail_price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "invoice_services_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_services" ADD CONSTRAINT "invoice_services_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_services" ADD CONSTRAINT "invoice_services_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
