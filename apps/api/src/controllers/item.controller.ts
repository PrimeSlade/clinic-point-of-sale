import { NextFunction, Request, Response } from "express";
import * as itemService from "../services/item.service";
import { BadRequestError } from "../errors";
import { sendResponse } from "../utils/response";

const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { item, itemUnits } = req.body;

  if (!item || !itemUnits) {
    throw new BadRequestError("Item data is required");
  }

  try {
    const addedItem = await itemService.addItem(item, itemUnits);

    sendResponse(res, 201, "Item created successfully", addedItem);
  } catch (error: any) {
    next(error);
  }
};

const getItems = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const search = String(req.query.search || "");
  const filter = String(req.query.filter || "");

  const user = req.user;
  const abacFilter = req.abacFilter;

  //pagination
  const offset = (page - 1) * limit;

  try {
    const { items, total } = await itemService.getItems({
      offset,
      limit,
      search,
      filter,
      user,
      abacFilter,
    });

    //pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    sendResponse(res, 200, "Items fetched successfully", items, {
      page,
      totalPages: totalPages,
      totalItems: total,
      hasNextPage,
    });
  } catch (error: any) {
    next(error);
  }
};

const getItemById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const item = await itemService.getItemById(id);

    sendResponse(res, 200, "Item fetched successfully", item);
  } catch (error: any) {
    next(error);
  }
};

const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);
  const { item, itemUnits } = req.body;

  if (!item || !itemUnits || !id) {
    throw new BadRequestError("Item data is required");
  }

  try {
    const updatedItem = await itemService.updateItem(
      item,
      itemUnits,
      id,
      req.user,
    );

    sendResponse(res, 200, "Item updated successfully", updatedItem);
  } catch (error: any) {
    next(error);
  }
};

const deleteItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const deletedItem = await itemService.deleteItem(id);

    sendResponse(res, 200, "Item deleted successfully", deletedItem);
  } catch (error: any) {
    next(error);
  }
};

const importItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      throw new BadRequestError("No file uploaded");
    }

    const result = await itemService.importItem(req.file.buffer);

    sendResponse(res, 201, "Items imported successfully", result);
  } catch (error) {
    next(error);
  }
};

const exportItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const abacFilter = req.abacFilter;
    const workbook = await itemService.exportItem(abacFilter);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=items.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    next(error);
  }
};

const getItemHistoriesById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const itemId = Number(req.params.id);

  try {
    const histories = await itemService.getItemHistoriesById(itemId);

    sendResponse(res, 200, "Item histories fetched successfully", histories);
  } catch (error: any) {
    next(error);
  }
};

export {
  addItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  importItem,
  exportItem,
  getItemHistoriesById,
};
