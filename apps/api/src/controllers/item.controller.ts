import { NextFunction, Request, Response } from "express";
import * as itemService from "../services/item.service";
import { BadRequestError } from "../errors/BadRequestError";

const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { item, itemUnits } = req.body;

  console.log(item, itemUnits);

  if (!item || !itemUnits) {
    throw new BadRequestError("Item data is required");
  }

  try {
    const addedItem = await itemService.addItem(item, itemUnits);

    res.status(201).json({
      success: true,
      message: "Item created",
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
  try {
    const items = await itemService.getItems();

    res.status(200).json({
      success: true,
      message: "Items fetched",
      data: items,
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
      messge: "Item fetched",
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
      message: "Item updated",
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
      message: "Item deleted",
      data: deletedItem,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addItem, getItems, getItemById, updateItem, deleteItem };
