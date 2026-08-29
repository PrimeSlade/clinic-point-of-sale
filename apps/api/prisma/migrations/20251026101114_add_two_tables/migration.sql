-- CreateTable
CREATE TABLE "item_histories" (
    "id" SERIAL NOT NULL,
    "user_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" "HistoryAction" NOT NULL,
    "user_id" TEXT,
    "item_id" INTEGER NOT NULL,

    CONSTRAINT "item_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_history_details" (
    "id" SERIAL NOT NULL,
    "old_unit_type" "UnitType" NOT NULL,
    "new_unit_type" "UnitType" NOT NULL,
    "old_rate" INTEGER NOT NULL,
    "new_rate" INTEGER NOT NULL,
    "old_quantity" INTEGER NOT NULL,
    "new_quantity" INTEGER NOT NULL,
    "old_purchase_price" DECIMAL(10,2) NOT NULL,
    "new_purchase_price" DECIMAL(10,2) NOT NULL,
    "item_history_id" INTEGER NOT NULL,

    CONSTRAINT "item_history_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "item_histories" ADD CONSTRAINT "item_histories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_histories" ADD CONSTRAINT "item_histories_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_history_details" ADD CONSTRAINT "item_history_details_item_history_id_fkey" FOREIGN KEY ("item_history_id") REFERENCES "item_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
