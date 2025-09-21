import { BadRequestError } from "../errors/BadRequestError";
import { InvoiceServiceInput } from "../types/invoice.type";
import * as itemModel from "../models/item.model";

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

const hasSufficentAmount = async (data: InvoiceServiceInput) => {
  for (const invoiceItem of data.invoiceItems) {
    const item = await itemModel.getItemById(invoiceItem.id);
    const unit = item?.itemUnits.find(
      (itemUnit) => itemUnit.unitType === invoiceItem.unitType,
    );

    if (!unit || unit.quantity < invoiceItem.quantity) {
      throw new BadRequestError(
        `${invoiceItem.unitType} amount is insufficient!`,
      );
    }
  }
};

const deductUnitAmount = async (data: InvoiceServiceInput) => {
  for (const invoiceItem of data.invoiceItems) {
    const item = await itemModel.getItemById(invoiceItem.id);
    const unit = item?.itemUnits.find(
      (itemUnit) => itemUnit.unitType === invoiceItem.unitType,
    );

    //Sort based on the unit
    const labeled = [...(item?.itemUnits ?? [])]
      .sort((a, b) => (unitRank[a.unitType] ?? 0) - (unitRank[b.unitType] ?? 0))
      .map((unit, index) => ({ ...unit, rank: index + 1 }));

    console.log(labeled);

    //detuct amount
    const deductedAmount = unit!.quantity - invoiceItem.quantity;
  }
};

export { hasSufficentAmount, deductUnitAmount };
