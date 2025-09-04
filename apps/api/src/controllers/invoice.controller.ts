import { NextFunction, Request, Response } from "express";
import * as invoiceService from "../services/invoice.service";
import { BadRequestError } from "../errors/BadRequestError";

const createInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const {
    locationId,
    treatmentId,
    totalAmount,
    discountAmount,
    paymentMethod,
    paymentDescription,
    note,
    invoiceItems,
  } = req.body;

  if (
    !locationId ||
    !totalAmount ||
    !discountAmount ||
    !paymentMethod ||
    !invoiceItems
  ) {
    throw new BadRequestError("Required invoice data is missing");
  }

  try {
    const invoice = await invoiceService.createInvoice({
      locationId,
      treatmentId,
      totalAmount,
      discountAmount,
      paymentMethod,
      paymentDescription,
      note,
      invoiceItems,
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully!",
      data: invoice,
    });
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

    res.status(200).json({
      success: true,
      message: "Invoices fetched successfully!",
      data: invoices,
      meta: {
        page,
        totalPages,
        totalItems: total,
        hasNextPage,
      },
    });
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

    res.status(200).json({
      success: true,
      message: "Invoice fetched successfully!",
      data: invoice,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);
  const updateData = req.body;

  if (!id) {
    throw new BadRequestError("Invalid invoice ID");
  }

  try {
    const updatedInvoice = await invoiceService.updateInvoice(id, updateData);

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully!",
      data: updatedInvoice,
    });
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

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully!",
    });
  } catch (error: any) {
    next(error);
  }
};

export {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
};
