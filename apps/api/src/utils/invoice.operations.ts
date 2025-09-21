import { BadRequestError } from "../errors/BadRequestError";
import { InvoiceServiceInput } from "../types/invoice.type";
import * as itemModel from "../models/item.model";
import { Prisma } from "@prisma/client";
import { updateItemUnit } from "../models/itemUnit.model";

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
  for (let invoiceItem of data.invoiceItems) {
    const item = await itemModel.getItemById(invoiceItem.id);

    //sort item
    const labeledItems = item!.itemUnits.sort(
      (a, b) => unitRank[a.unitType] - unitRank[b.unitType],
    );

    const matchIndex = labeledItems.findIndex(
      (item) => item.unitType === invoiceItem.unitType,
    );

    const deductedAmount =
      labeledItems[matchIndex].quantity - invoiceItem.quantity;

    console.log("Detucted Amount ", deductedAmount);

    if (deductedAmount < 0) {
      throw new BadRequestError(
        `${invoiceItem.unitType} amount is insufficient!`,
      );
    }

    labeledItems[matchIndex].quantity = deductedAmount;

    if (matchIndex === 0) {
      // Rank 1 modified → convert down
      labeledItems[1].quantity =
        labeledItems[0].quantity * labeledItems[0].rate;
      labeledItems[2].quantity =
        labeledItems[1].quantity * labeledItems[1].rate;
    } else if (matchIndex === 1) {
      // Rank 2 modified → convert both ways
      labeledItems[0].quantity =
        labeledItems[1].quantity / labeledItems[0].rate;
      labeledItems[2].quantity =
        labeledItems[1].quantity * labeledItems[1].rate;
    } else {
      // Rank 3 modified → convert up
      labeledItems[1].quantity =
        labeledItems[2].quantity / labeledItems[1].rate;
      labeledItems[0].quantity =
        labeledItems[1].quantity / labeledItems[0].rate;
    }

    await updateItemUnit(labeledItems, trx);
  }
};

export { deductUnitAmount };
