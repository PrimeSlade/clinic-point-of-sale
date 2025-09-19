import { BadRequestError } from "../errors/BadRequestError";
import { InvoiceServiceInput } from "../types/invoice.type";
import * as itemModel from "../models/item.model";

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

const detuctUnitAmount = () => {};

export { hasSufficentAmount };
