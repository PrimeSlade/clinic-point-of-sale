import { Prisma } from "../generated/prisma";

const updateItemUnit = async (
  units: { id: number; quantity: number }[],
  trx: Prisma.TransactionClient,
) => {
  const updatePromises = units.map((unit) =>
    trx.itemUnit.update({
      where: { id: unit.id },
      data: { quantity: unit.quantity },
    }),
  );

  //wait all
  return Promise.all(updatePromises);
};

export { updateItemUnit };
