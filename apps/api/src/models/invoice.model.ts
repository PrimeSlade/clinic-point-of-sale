import prisma from "../config/prisma.client";
import { Prisma } from "../generated/prisma";
import { Invoice, InvoiceQueryParams } from "../types/invoice.type";

const createInvoice = async (data: Invoice) => {
  return prisma.invoice.create({
    data: {
      locationId: data.locationId,
      treatmentId: data.treatmentId,
      totalAmount: data.totalAmount,
      discountAmount: data.discountAmount,
      paymentMethod: data.paymentMethod,
      paymentDescription: data.paymentDescription,
      note: data.note,
      invoiceItems: {
        create: data.invoiceItems.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          purchasePrice: item.purchasePrice,
          discountPrice: item.discountPrice,
          unitType: item.unitType,
        })),
      },
    },
    include: {
      location: true,
      treatment: true,
      invoiceItems: true,
    },
  });
};

const getInvoices = async ({
  offset,
  limit,
  search,
  filter,
  user,
  abacFilter,
  startDate,
  endDate,
}: InvoiceQueryParams) => {
  const conditions: Prisma.InvoiceWhereInput[] = [];

  if (search) {
    conditions.push({
      OR: [
        {
          invoiceItems: {
            some: {
              itemName: { contains: search, mode: "insensitive" },
            },
          },
        },
        {
          treatment: {
            patient: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  // Admin can search all locations
  if (user.role.name === "admin" && filter) {
    conditions.push({
      location: {
        name: { equals: filter, mode: "insensitive" },
      },
    });
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Set end date to 23:59:59.999 to include the entire day
    end.setHours(23, 59, 59, 999);

    conditions.push({
      createdAt: {
        gte: start,
        lte: end,
      },
    });
  }

  const whereClause: Prisma.InvoiceWhereInput = {
    AND: [...[abacFilter as Prisma.InvoiceWhereInput], ...conditions],
  };

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      skip: offset,
      take: limit,
      where: whereClause,
      include: {
        location: true,
        treatment: {
          include: {
            patient: true,
          },
        },
        invoiceItems: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.count({ where: whereClause }),
  ]);

  return { invoices, total };
};

const getInvoiceById = async (id: number) => {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      location: true,
      treatment: true,
      invoiceItems: true,
    },
  });
};

const updateInvoice = async (id: number, data: Invoice) => {
  //find existing items first
  const existingInvoiceItems = await prisma.invoiceItem.findMany({
    where: { invoiceId: id },
    select: { id: true },
  });

  //filter items
  const itemIdsToKeep = data.invoiceItems.map((item) => item.id);

  //used with **in**
  const itemsToDelete = existingInvoiceItems
    .filter((existingItem) => itemIdsToKeep.includes(existingItem.id))
    .map((item) => item.id);

  return prisma.invoice.update({
    where: { id },
    data: {
      locationId: data.locationId,
      treatmentId: data.treatmentId,
      totalAmount: data.totalAmount,
      discountAmount: data.discountAmount,
      paymentMethod: data.paymentMethod,
      paymentDescription: data.paymentDescription,
      note: data.note,
      invoiceItems: {
        deleteMany:
          itemsToDelete.length > 0
            ? {
                id: { in: itemsToDelete },
              }
            : undefined,
        upsert: data.invoiceItems.map((item) => ({
          where: {
            id: item.id,
          },
          create: {
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            discountPrice: item.discountPrice,
            unitType: item.unitType,
          },
          update: {
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            purchasePrice: item.purchasePrice,
            discountPrice: item.discountPrice,
            unitType: item.unitType,
          },
        })),
      },
    },
    include: {
      location: true,
      treatment: true,
      invoiceItems: true,
    },
  });
};

const deleteInvoice = async (id: number) => {
  return prisma.$transaction(async (trx) => {
    await trx.invoiceItem.deleteMany({
      where: { invoiceId: id },
    });

    return trx.invoice.delete({
      where: { id },
    });
  });
};

export {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};
