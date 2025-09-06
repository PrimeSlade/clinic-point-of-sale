import { InvoiceItem, InvoiceService } from "../types/invoice.type";

type FilterItemsOptions = {
  id: number;
  modelName: string;
  data: InvoiceItem[] | InvoiceService[];
  prisma: any;
};

export const getItemsToDelete = async ({
  id,
  modelName,
  data,
  prisma,
}: FilterItemsOptions): Promise<number[]> => {
  const existingItems = await prisma[modelName].findMany({
    where: { invoiceId: id },
    select: { id: true },
  });

  const itemIdsToKeep = data.map((item) => item.id);

  const itemsToDelete = existingItems
    .filter(
      (existingItem: { id: number }) =>
        !itemIdsToKeep.includes(existingItem.id),
    )
    .map((item: { id: number }) => item.id);

  return itemsToDelete;
};
