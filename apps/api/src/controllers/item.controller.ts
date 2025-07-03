import { Request, Response } from "express";
import * as itemModel from "../models/item.model";

const addItem = async (req: Request, res: Response): Promise<void> => {
  const { units, ...item } = req.body;
  console.log(item);
  console.log(units);

  res.json(item);

  // if (!item) {
  //   res.status(400).json({
  //     success: false,
  //     message: "Request body cannot be empty",
  //   });
  //   return;
  // }

  // try {
  //   const addedItem = await itemModel.addItem(item);

  //   res.status(200).json({
  //     success: true,
  //     message: "Item created",
  //     data: addedItem,
  //   });
  // } catch (error: any) {
  //   console.log(error);
  //   res.status(500).json({
  //     success: false,
  //     message: "Failed to create item",
  //     error: error.message || "Internal server error",
  //   });
  // }
};

const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const items = await itemModel.getItems();

    res.status(200).json({
      success: true,
      message: "Items fetched",
      data: items,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch items",
      error: error.message || "Internal server error",
    });
  }
};

const updateItem = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const item = req.body;

  const itemId = Number(id);

  if (isNaN(itemId) || itemId <= 0) {
    res.status(400).json({
      success: false,
      message: "Invalid item ID",
    });
    return;
  }

  if (!item) {
    res.status(400).json({
      success: false,
      message: "Request body cannot be empty",
    });
    return;
  }

  try {
    const updatedItem = await itemModel.updateItem(item, itemId);

    res.status(200).json({
      success: true,
      message: "Item updated",
      data: updatedItem,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to update items",
      error: error.message || "Internal server error",
    });
  }
};

export { addItem, getItems, updateItem };
