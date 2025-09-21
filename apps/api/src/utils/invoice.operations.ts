import { BadRequestError } from "../errors/BadRequestError";
import { InvoiceServiceInput } from "../types/invoice.type";

import { Prisma } from "@prisma/client";
import { updateItemUnit } from "../models/itemUnit.model";
import { deleteItem, getItemById } from "../models/item.model";

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

const deductUnitAmount = async (
  data: InvoiceServiceInput,
  trx: Prisma.TransactionClient,
) => {
  //combine quantity with same id and unit to reduce read and update
  const aggregatedItem = data.invoiceItems.reduce(
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
    {} as Record<string, { id: number; unitType: string; quantity: number }>,
  );

  const uniqueItemId = [
    ...new Set(Object.values(aggregatedItem).map((item) => item.id)),
  ];

  for (let itemId of uniqueItemId) {
    const itemDeductions = Object.values(aggregatedItem).filter(
      (item) => item.id === itemId,
    );

    const item = await getItemById(itemId);

    //sort item
    const labeledItems = [...item!.itemUnits].sort(
      (a, b) => unitRank[a.unitType] - unitRank[b.unitType],
    );

    //ded is just filtered values from data
    for (const deduction of itemDeductions) {
      const matchIndex = labeledItems.findIndex(
        (item) => item.unitType === deduction.unitType,
      );

      const deductedAmount =
        labeledItems[matchIndex].quantity - deduction.quantity;

      console.log("Detucted Amount ", deductedAmount);

      //Amount checker
      if (deductedAmount < 0) {
        throw new BadRequestError(
          `${deduction.unitType} amount is insufficient!`,
        );
      }
      labeledItems[matchIndex].quantity = deductedAmount;

      if (matchIndex === 0) {
        // Rank 1
        labeledItems[1].quantity =
          labeledItems[0].quantity * labeledItems[0].rate;
        labeledItems[2].quantity =
          labeledItems[1].quantity * labeledItems[1].rate;
      } else if (matchIndex === 1) {
        // Rank 2
        labeledItems[0].quantity = Math.floor(
          labeledItems[1].quantity / labeledItems[0].rate,
        );
        labeledItems[2].quantity =
          labeledItems[1].quantity * labeledItems[1].rate;
      } else {
        // Rank 3
        labeledItems[1].quantity = Math.floor(
          labeledItems[2].quantity / labeledItems[1].rate,
        );
        labeledItems[0].quantity = Math.floor(
          labeledItems[1].quantity / labeledItems[0].rate,
        );
      }
    }

    const isZero = labeledItems.every((item) => item.quantity === 0);

    if (isZero) {
      await deleteItem(itemId, trx);
    } else {
      await updateItemUnit(labeledItems, trx);
    }
  }
};

export { deductUnitAmount };
