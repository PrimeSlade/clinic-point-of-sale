import { BadRequestError } from "../errors/BadRequestError";
import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import * as invoiceModel from "../models/invoice.model";
import { UserInfo } from "../types/auth.type";
import { InvoiceQueryParams, InvoiceServiceInput } from "../types/invoice.type";
import { calcInvoice } from "../utils/calcInvoice";
import { adjustUnitAmount } from "../utils/invoice.operations";
import prisma from "../config/prisma.client";
import { UnitType } from "../types/item.type";

const createInvoice = async (data: InvoiceServiceInput, user: UserInfo) => {
  try {
    const invoice = await prisma.$transaction(async (trx) => {
      await adjustUnitAmount(data.invoiceItems, trx, "deduct");

      const { subTotal, totalItemDiscount, totalAmount } = calcInvoice(
        data,
        user,
      );
      return await invoiceModel.createInvoice(
        {
          ...data,
          subTotal,
          totalItemDiscount,
          totalAmount,
        },
        user,
        trx,
      );
    });

    return invoice;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Related data not found");
    }
    if (error instanceof BadRequestError) {
      throw error;
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getInvoices = async ({
  offset,
  limit,
  search,
  abacFilter,
  startDate,
  endDate,
}: InvoiceQueryParams) => {
  try {
    const { invoices, total } = await invoiceModel.getInvoices({
      offset,
      limit,
      search,
      abacFilter,
      startDate,
      endDate,
    });

    const parsedInvoices = invoices.map((invoice) => ({
      ...invoice,
      totalAmount: invoice.totalAmount.toNumber(),
      discountAmount: invoice.discountAmount.toNumber(),
      subTotal: invoice.subTotal.toNumber(),
      totalItemDiscount: invoice.totalItemDiscount.toNumber(),
      invoiceItems: invoice.invoiceItems.map((item) => ({
        ...item,
        purchasePrice: item.retailPrice.toNumber(),
        discountPrice: item.discountPrice.toNumber(),
      })),
    }));

    return { invoices: parsedInvoices, total };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Invoices not found");
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getInvoiceById = async (id: number) => {
  try {
    const invoice = await invoiceModel.getInvoiceById(id);

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    const parsedInvoice = {
      ...invoice,
      totalAmount: invoice.totalAmount.toNumber(),
      discountAmount: invoice.discountAmount.toNumber(),
      subTotal: invoice.subTotal.toNumber(),
      totalItemDiscount: invoice.totalItemDiscount.toNumber(),
      invoiceItems: invoice.invoiceItems.map((item) => ({
        ...item,
        purchasePrice: item.retailPrice.toNumber(),
        discountPrice: item.discountPrice.toNumber(),
      })),
    };

    return parsedInvoice;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Invoice not found");
    }
    throw new CustomError("Database operation failed", 500);
  }
};

const deleteInvoice = async (id: number) => {
  try {
    await prisma.$transaction(async (trx) => {
      const deletedInvoice = await invoiceModel.deleteInvoice(id, trx);

      const parsedInvoice = {
        ...deletedInvoice,
        invoiceItems: deletedInvoice.invoiceItems.map((item) => ({
          ...item,
          itemId: item.itemId,
          unitType: item.unitType as UnitType,
          purchasePrice: item.retailPrice.toNumber(),
          discountPrice: item.discountPrice.toNumber(),
        })),
      };

      await adjustUnitAmount(parsedInvoice.invoiceItems, trx, "restore");
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Invoice not found");
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export { createInvoice, getInvoices, getInvoiceById, deleteInvoice };
