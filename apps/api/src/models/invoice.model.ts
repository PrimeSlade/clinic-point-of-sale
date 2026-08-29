import prisma from "../config/prisma.client";
import { Prisma } from "../generated/prisma";
import { UserInfo } from "../types/auth.type";
import { InvoiceQueryParams, InvoiceModelInput } from "../types/invoice.type";
import { ReportQueryParams } from "../types/report.type";
import { calculatePriceWithIncrease } from "../utils/calcInvoice";

const createInvoice = async (
  data: InvoiceModelInput,
  user: UserInfo,
  trx: Prisma.TransactionClient,
) => {
  const { invoiceItems, invoiceServices, ...invoiceData } = data;

  return trx.invoice.create({
    data: {
      ...invoiceData,
      invoiceItems: {
        create: invoiceItems.map((item) => ({
          barcode: item.barcode,
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
        create: invoiceServices?.map((service) => ({
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

  //Admin can search all locations
  if (user.role.name.toLowerCase() === "admin" && filter) {
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

const getReportInvoices = async ({
  user,
  abacFilter,
  startDate,
  endDate,
}: ReportQueryParams) => {
  const conditions: Prisma.InvoiceWhereInput[] = [];

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

  return prisma.invoice.findMany({
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
  });
};

const deleteInvoice = async (id: number, trx: Prisma.TransactionClient) => {
  return trx.invoice.delete({
    where: { id },
    include: {
      invoiceItems: true,
      location: true,
      treatment: true,
      invoiceServices: true,
    },
  });
};

export { createInvoice, getInvoices, getReportInvoices, getInvoiceById, deleteInvoice };
