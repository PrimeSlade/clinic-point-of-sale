import { UserInfo } from "../types/auth.type";
import { InvoiceServiceInput } from "../types/invoice.type";
import { Unit } from "../types/item.type";
import { Service } from "../types/service.type";

export const calcInvoice = (data: InvoiceServiceInput, user: UserInfo) => {
  const itemsTotals = data.invoiceItems.reduce(
    (
      acc: { subTotal: number; discount: number },
      item: Partial<Unit & { discountPrice: number }>,
    ) => {
      const price =
        calculatePriceWithIncrease(item.purchasePrice!, user!.pricePercent) ||
        0;

      const quantity = item.quantity || 0;
      const discount = item.discountPrice || 0;

      acc.subTotal += price * quantity;
      acc.discount += discount * quantity;

      return acc;
    },
    { subTotal: 0, discount: 0 },
  );

  const servicesTotal = data.invoiceServices.reduce(
    (sum: number, service: Service) => {
      return sum + (service?.retailPrice || 0);
    },
    0,
  );

  return {
    subTotal: itemsTotals.subTotal + servicesTotal,
    totalItemDiscount: itemsTotals.discount,
    totalAmount:
      itemsTotals.subTotal +
      servicesTotal -
      itemsTotals.discount -
      data.discountAmount,
  };
};

export const calculatePriceWithIncrease = (
  price: number,
  pricePercent: number,
) => {
  return price + price * (pricePercent / 100);
};
