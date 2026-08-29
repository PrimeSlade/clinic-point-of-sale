import { BadRequestError, CustomError, NotFoundError } from "../errors";
import * as invoiceModel from "../models/invoice.model";
import { UserInfo } from "../types/auth.type";
import { InvoiceQueryParams, InvoiceServiceInput } from "../types/invoice.type";
import { ReportQueryParams } from "../types/report.type";
import { calcInvoice } from "../utils/calcInvoice";
import { adjustUnitAmount } from "../utils/invoice.operations";
import prisma from "../config/prisma.client";
import { UnitType } from "../generated/prisma";
import { handlePrismaError } from "../errors/prismaHandler";

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
    if (error instanceof BadRequestError) {
      throw error;
    }
    handlePrismaError(error, { P2025: "Related data not found" });
  }
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
  try {
    const { invoices, total } = await invoiceModel.getInvoices({
      offset,
      limit,
      search,
      filter,
      user,
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
        retailPrice: item.retailPrice.toNumber(),
        discountPrice: item.discountPrice.toNumber(),
      })),
    }));

    return { invoices: parsedInvoices, total };
  } catch (error: any) {
    handlePrismaError(error);
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
        retailPrice: item.retailPrice.toNumber(),
        discountPrice: item.discountPrice.toNumber(),
      })),
    };

    return parsedInvoice;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Invoice not found" });
  }
};

const getReportInvoices = async ({
  user,
  abacFilter,
  startDate,
  endDate,
}: ReportQueryParams) => {
  try {
    const invoices = await invoiceModel.getReportInvoices({
      user,
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

    return parsedInvoices;
  } catch (error: any) {
    handlePrismaError(error);
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
          barcode: item.barcode,
          unitType: item.unitType as UnitType,
          purchasePrice: item.retailPrice.toNumber(),
          discountPrice: item.discountPrice.toNumber(),
        })),
      };

      await adjustUnitAmount(parsedInvoice.invoiceItems, trx, "restore");
    });
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Invoice not found" });
  }
};

export {
  createInvoice,
  getInvoices,
  getReportInvoices,
  getInvoiceById,
  deleteInvoice,
};
