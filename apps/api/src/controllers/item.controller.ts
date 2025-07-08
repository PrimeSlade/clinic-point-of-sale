import { NextFunction, Request, Response } from "express";
import * as itemModel from "../models/item.model";
import { NotFoundError } from "../errors/NotFoundError";

const addItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { item, itemUnits } = req.body;

  if (!item || !itemUnits) {
    throw new NotFoundError();
  }

  try {
    const addedItem = await itemModel.addItem(item, itemUnits);

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
    const items = await itemModel.getItems();

    if (!items) {
      throw new NotFoundError();
    }

    res.status(200).json({
      success: true,
      message: "Items fetched",
      data: items,
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
    throw new NotFoundError();
  }

  try {
    const updatedItem = await itemModel.updateItem(item, itemUnits, id);

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
    const deletedItem = await itemModel.deleteItem(id);

    res.status(200).json({
      success: true,
      message: "Item deleted",
      data: deletedItem,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addItem, getItems, updateItem, deleteItem };
