import { NextFunction, Request, Response } from "express";
import * as itemService from "../services/item.service";
import { BadRequestError } from "../errors/BadRequestError";


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

    res.status(201).json({
      success: true,
      message: "Item created successfully!",
      data: addedItem,
    });
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

    res.status(200).json({
      success: true,
      message: "Items fetched successfully!",
      data: items,
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

const getItemById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const item = await itemService.getItemById(id);

    res.status(200).json({
      success: true,
      messge: "Item fetched successfully!",
      data: item,
    });
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
    const updatedItem = await itemService.updateItem(item, itemUnits, id);

    res.status(200).json({
      success: true,
      message: "Item updated successfully!",
      data: updatedItem,
    });
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

    res.status(200).json({
      success: true,
      message: "Item deleted successfully!",
      data: deletedItem,
    });
  } catch (error: any) {
    next(error);
  }
};

const exportItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const users = [
      { id: 1, name: "John Doe", email: "john@example.com", age: 30 },
      { id: 2, name: "Jane Smith", email: "jane@example.com", age: 25 },
      { id: 3, name: "Bob Johnson", email: "bob@example.com", age: 35 },
    ];

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    worksheet.columns = [
      { header: "ID", key: "id" },
      { header: "Name", key: "name" },
      { header: "Email", key: "email" },
      { header: "Age", key: "age" },
    ];

    users.forEach((user) => {
      worksheet.addRow(user);
    });

    //header
    worksheet.getRow(1).font = { bold: true };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    next(error);
  }
};

export { addItem, getItems, getItemById, updateItem, deleteItem, exportItem };
