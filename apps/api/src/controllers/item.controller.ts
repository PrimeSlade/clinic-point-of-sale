import { Request, Response } from "express";
import * as itemModel from "../models/item.model";

const addItem = async (req: Request, res: Response) => {
  console.log("ok");
  try {
    const item = req.body;

    const addedItem = await itemModel.addItem(item);

    res.json({ item: addedItem });
  } catch (error) {
    console.log(error);
  }
};

export { addItem };
