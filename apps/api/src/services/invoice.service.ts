import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import * as invoiceModel from "../models/invoice.model";
import { Invoice, InvoiceQueryParams } from "../types/invoice.type";

const createInvoice = async (data: Invoice) => {
  try {
    const invoice = await invoiceModel.createInvoice(data);

    const parsedInvoice = {
      ...invoice,
      totalAmount: invoice.totalAmount.toNumber(),
      discountAmount: invoice.discountAmount.toNumber(),
      invoiceItems: invoice.invoiceItems.map((item) => ({
        ...item,
        purchasePrice: item.retailPrice.toNumber(),
        discountPrice: item.discountPrice.toNumber(),
      })),
    };

    return parsedInvoice;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Related data not found");
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

const updateInvoice = async (id: number, data: Invoice) => {
  try {
    const updatedInvoice = await invoiceModel.updateInvoice(id, data);

    const parsedInvoice = {
      ...updatedInvoice,
      totalAmount: updatedInvoice.totalAmount.toNumber(),
      discountAmount: updatedInvoice.discountAmount.toNumber(),
      invoiceItems: updatedInvoice.invoiceItems.map((item) => ({
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
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const deleteInvoice = async (id: number) => {
  try {
    await invoiceModel.deleteInvoice(id);
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Invoice not found");
    }
    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};
