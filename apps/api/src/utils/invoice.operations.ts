import { BadRequestError } from "../errors/BadRequestError";
import { InvoiceServiceInput } from "../types/invoice.type";
import { Prisma } from "@prisma/client";
import { updateItemUnit } from "../models/itemUnit.model";
import { getItemById } from "../models/item.model";
import { UnitType } from "../types/item.type";

type AggregatedItem = {
  id: number;
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

const aggregateItem = (data: InvoiceServiceInput) => {
  return data.invoiceItems.reduce(
    (acc, invoiceItem) => {
      const key = `${invoiceItem.id}-${invoiceItem.unitType}`;

      if (!acc[key]) {
        acc[key] = {
          id: invoiceItem.id,
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

const getUniqueItemId = (aggregatedItems: Record<string, AggregatedItem>) => {
  return [...new Set(Object.values(aggregatedItems).map((item) => item.id))];
};

const deductUnitAmount = async (
  data: InvoiceServiceInput,
  trx: Prisma.TransactionClient,
) => {
  //combine quantity with same id and unit to reduce read and update
  const aggregatedItem = aggregateItem(data);

  //get uniqueId => 1,1,2 => 1,2
  const uniqueItemId = getUniqueItemId(aggregatedItem);

  //id => 1,2
  for (let itemId of uniqueItemId) {
    const item = await getItemById(itemId);

    //Error handling
    if (!item) {
      throw new BadRequestError(`Item with ID ${itemId} not found`);
    }

    //sort item
    const labeledItems = [...item.itemUnits].sort(
      (a, b) => unitRank[a.unitType] - unitRank[b.unitType],
    );

    const itemDeductions = Object.values(aggregatedItem).filter(
      (item) => item.id === itemId,
    );

    //ded is just filtered values from data
    //id => 1,1,2
    for (const deduction of itemDeductions) {
      const matchIndex = labeledItems.findIndex(
        (item) => item.unitType === deduction.unitType,
      );

      //Error handling
      if (matchIndex === -1) {
        throw new BadRequestError(
          `Unit type ${deduction.unitType} not found for item ${itemId}`,
        );
      }

      const deductedAmount =
        labeledItems[matchIndex].quantity - deduction.quantity;

      //Amount checker
      if (deductedAmount < 0) {
        throw new BadRequestError(
          `${deduction.unitType} amount is insufficient!`,
        );
      }

      labeledItems[matchIndex].quantity = deductedAmount;

      recalculateRelatedUnits(labeledItems, matchIndex);
    }

    await updateItemUnit(labeledItems, trx);
  }
};

export { deductUnitAmount };
