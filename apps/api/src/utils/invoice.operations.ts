import { BadRequestError } from "../errors";
import { InvoiceItem, InvoiceServiceInput } from "../types/invoice.type";
import { updateItemUnit } from "../models/itemUnit.model";
import { getItemByBarcode } from "../models/item.model";
import { UnitType } from "../types/item.type";
import { Prisma } from "../generated/prisma";

type AggregatedItem = {
  barcodeId: string;
  unitType: UnitType;
  quantity: number;
};

export const unitType = [
  "pkg", // package (could be similar to box)
  "box", // biggest container
  "strip", // strip of tablets (multiple tabs)
  "btl", // bottle
  "amp", // ampoule (small liquid container)
  "tube", // tube
  "sac", // sachet (small packet)
  "cap", // capsule (single dose)
  "tab", // tablet (single dose)
  "pcs", // pieces (single items)
] as const;

//map
const unitRank = Object.fromEntries(unitType.map((u, i) => [u, i])); //HashMap

const recalculateRelatedUnits = (
  itemUnit: { id: number; quantity: number; rate: number }[],
  matchIndex: number,
) => {
  if (matchIndex === 0) {
    //down
    for (let i = matchIndex; i < itemUnit.length - 1; i++) {
      itemUnit[i + 1].quantity = itemUnit[i].quantity * itemUnit[i].rate;
    }
  } else if (matchIndex === itemUnit.length - 1) {
    //up
    for (let i = itemUnit.length - 1; i > 0; i--) {
      itemUnit[i - 1].quantity = Math.floor(
        itemUnit[i].quantity / itemUnit[i - 1].rate,
      );
    }
  } else {
    //down
    for (let i = matchIndex; i < itemUnit.length - 1; i++) {
      itemUnit[i + 1].quantity = itemUnit[i].quantity * itemUnit[i].rate;
    }
    //up
    for (let i = matchIndex; i > 0; i--) {
      itemUnit[i - 1].quantity = Math.floor(
        itemUnit[i].quantity / itemUnit[i - 1].rate,
      );
    }
  }
};

const aggregateItem = (data: InvoiceItem[]) => {
  return data.reduce(
    (acc, invoiceItem) => {
      const key = `${invoiceItem.barcode}-${invoiceItem.unitType}`;

      if (!acc[key]) {
        acc[key] = {
          barcodeId: invoiceItem.barcode,
          unitType: invoiceItem.unitType,
          quantity: 0,
        };
      }

      acc[key].quantity += invoiceItem.quantity;
      return acc;
    },
    {} as Record<string, AggregatedItem>,
  );
};

const getUniqueBarcodeIds = (
  aggregatedItems: Record<string, AggregatedItem>,
) => {
  return [
    ...new Set(Object.values(aggregatedItems).map((item) => item.barcodeId)),
  ];
};

const adjustUnitAmount = async (
  invoiceItems: InvoiceItem[],
  trx: Prisma.TransactionClient,
  operation: "deduct" | "restore",
) => {
  //combine quantity with same id and unit to reduce read and update
  const aggregatedItem = aggregateItem(invoiceItems);

  //get uniqueBarcode => abc,abe,abc => abc,abe
  const uniqueBarcodeIds = getUniqueBarcodeIds(aggregatedItem);

  //id => abc,abe
  for (let barcode of uniqueBarcodeIds) {
    const item = await getItemByBarcode(barcode);

    // If item not found, skip to the next one.
    if (!item) {
      // throw new BadRequestError(`Item with Barcode ID ${barcode} not found`);
      continue;
    }

    //sort item
    const labeledItems = [...item.itemUnits].sort(
      (a, b) => unitRank[a.unitType] - unitRank[b.unitType],
    );

    const itemAdjustments = Object.values(aggregatedItem).filter(
      (item) => item.barcodeId === barcode,
    );

    //adj is just filtered values from data
    //id => abc,abc,abe
    for (const adjustment of itemAdjustments) {
      const matchIndex = labeledItems.findIndex(
        (item) => item.unitType === adjustment.unitType,
      );

      //Error handling
      if (matchIndex === -1) {
        throw new BadRequestError(
          `Unit type ${adjustment.unitType} not found for item ${barcode}`,
        );
      }

      const adjustedAmount =
        operation === "deduct"
          ? labeledItems[matchIndex].quantity - adjustment.quantity
          : labeledItems[matchIndex].quantity + adjustment.quantity;

      //Amount checker
      if (adjustedAmount < 0 && operation === "deduct") {
        throw new BadRequestError(
          `${adjustment.unitType} amount is insufficient!`,
        );
      }

      labeledItems[matchIndex].quantity = adjustedAmount;

      recalculateRelatedUnits(labeledItems, matchIndex);
    }

    await updateItemUnit(labeledItems, trx);
  }
};

export { adjustUnitAmount };
