import prisma from "../config/prisma.client";
import { Prisma } from "../generated/prisma";
import { UserInfo } from "../types/auth.type";
import { InvoiceQueryParams, InvoiceModelInput } from "../types/invoice.type";
import { calculatePriceWithIncrease } from "../utils/calcInvocie";
import { getItemsToDelete } from "../utils/filterItemsToDelete";

const createInvoice = async (data: InvoiceModelInput, user: UserInfo) => {
  const { invoiceItems, invoiceServices, ...invoiceData } = data;

  return prisma.invoice.create({
    data: {
      ...invoiceData,
      invoiceItems: {
        create: invoiceItems.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          quantity: item.quantity,
          retailPrice: calculatePriceWithIncrease(
            item.purchasePrice,
            user.pricePercent,
          ),
          discountPrice: item.discountPrice,
          unitType: item.unitType,
        })),
      },
      invoiceServices: {
        create: invoiceServices.map((service) => ({
          serviceId: service.serviceId,
          name: service.name,
          retailPrice: service.retailPrice,
        })),
      },
    },
    include: {
      location: true,
      treatment: true,
      invoiceItems: true,
      invoiceServices: true,
    },
  });
};

const getInvoices = async ({
  offset,
  limit,
  search,
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
        {
          location: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ],
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
            doctor: true,
          },
        },
        invoiceItems: true,
        invoiceServices: true,
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
      invoiceServices: true,
    },
  });
};

const updateInvoice = async (
  id: number,
  data: InvoiceModelInput,
  user: UserInfo,
) => {
  const itemsToDelete = await getItemsToDelete({
    id,
    modelName: "invoiceItem",
    data: data.invoiceItems,
    prisma,
  });

  const servicesToDelete = await getItemsToDelete({
    id,
    modelName: "invoiceService",
    data: data.invoiceServices,
    prisma,
  });

  const { invoiceItems, invoiceServices, ...invoiceData } = data;

  return prisma.invoice.update({
    where: { id },
    data: {
      ...invoiceData,
      invoiceItems: {
        deleteMany:
          itemsToDelete.length > 0
            ? {
                id: { in: itemsToDelete },
              }
            : undefined,
        upsert: invoiceItems.map((item) => ({
          where: {
            id: item.id || -1,
          },
          create: {
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            retailPrice: calculatePriceWithIncrease(
              item.purchasePrice,
              user.pricePercent,
            ),
            discountPrice: item.discountPrice,
            unitType: item.unitType,
          },
          update: {
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            retailPrice: calculatePriceWithIncrease(
              item.purchasePrice,
              user.pricePercent,
            ),
            discountPrice: item.discountPrice,
            unitType: item.unitType,
          },
        })),
      },
      invoiceServices: {
        deleteMany:
          servicesToDelete.length > 0
            ? {
                id: { in: servicesToDelete },
              }
            : undefined,
        upsert: invoiceServices.map((service) => ({
          where: {
            id: service.id || -1,
          },
          create: {
            serviceId: service.serviceId,
            name: service.name,
            retailPrice: service.retailPrice,
          },
          update: {
            serviceId: service.serviceId,
            name: service.name,
            retailPrice: service.retailPrice,
          },
        })),
      },
    },
    include: {
      location: true,
      treatment: true,
      invoiceItems: true,
      invoiceServices: true,
    },
  });
};

const deleteInvoice = async (id: number) => {
  return prisma.invoice.delete({
    where: { id },
  });
};

export {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};
