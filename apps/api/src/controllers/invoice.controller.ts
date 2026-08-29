import { NextFunction, Request, Response } from "express";
import * as invoiceService from "../services/invoice.service";
import { BadRequestError } from "../errors";
import { sendResponse } from "../utils/response";

const createInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { invoiceItems, invoiceServices, ...data } = req.body;

  const user = req.user;

  if (!data || !invoiceItems) {
    throw new BadRequestError("Required invoice data is missing");
  }

  try {
    const invoice = await invoiceService.createInvoice(
      {
        ...data,
        invoiceItems,
        invoiceServices,
      },
      user,
    );

    sendResponse(res, 201, "Invoice created successfully", invoice);
  } catch (error: any) {
    next(error);
  }
};

const getInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = String(req.query.search || "");
  const filter = String(req.query.filter || "");
  const startDate = String(req.query.startDate || "");
  const endDate = String(req.query.endDate || "");

  const user = req.user;
  const abacFilter = req.abacFilter;

  //pagination
  const offset = (page - 1) * limit;

  try {
    const { invoices, total } = await invoiceService.getInvoices({
      offset,
      limit,
      search,
      filter,
      user,
      abacFilter,
      startDate,
      endDate,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    sendResponse(res, 200, "Invoices fetched successfully", invoices, {
      page,
      totalPages: totalPages,
      totalItems: total,
      hasNextPage,
    });
  } catch (error: any) {
    next(error);
  }
};

const getReportInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const startDate = String(req.query.startDate || "");
  const endDate = String(req.query.endDate || "");

  const user = req.user;
  const abacFilter = req.abacFilter;

  if (!startDate || !endDate) {
    throw new BadRequestError("Start date and end date are required");
  }

  try {
    const invoices = await invoiceService.getReportInvoices({
      user,
      abacFilter,
      startDate,
      endDate,
    });

    sendResponse(res, 200, "Report invoices fetched successfully", invoices);
  } catch (error: any) {
    next(error);
  }
};

const getInvoiceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  if (!id) {
    throw new BadRequestError("Invalid invoice ID");
  }

  try {
    const invoice = await invoiceService.getInvoiceById(id);

    sendResponse(res, 200, "Invoice fetched successfully", invoice);
  } catch (error: any) {
    next(error);
  }
};

const deleteInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  if (!id) {
    throw new BadRequestError("Invalid invoice ID");
  }

  try {
    await invoiceService.deleteInvoice(id);

    sendResponse(res, 200, "Invoice deleted successfully", null);
  } catch (error: any) {
    next(error);
  }
};

export {
  createInvoice,
  getInvoices,
  getReportInvoices,
  getInvoiceById,
  deleteInvoice,
};
