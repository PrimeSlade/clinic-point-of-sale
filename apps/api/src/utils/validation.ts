import { z } from "zod";
import { BadRequestError } from "../errors/BadRequestError";
import { ImportItems } from "../types/item.type";

const unitType = [
  "pkg",
  "box",
  "strip",
  "btl",
  "amp",
  "tube",
  "sac",
  "cap",
  "tab",
  "pcs",
] as const;

const subUnitSchema = z.object({
  id: z.number().optional(),

  unitType: z.enum(unitType, {
    message: "Plese select a valid unit",
  }),

  rate: z
    .number({
      message: "Rate must be a number",
    })
    .min(1, { message: "Quantity rate cannot be negative or zero" }),

  quantity: z
    .number({
      message: "Quantity must be a number",
    })
    .int({ message: "Quantity must be a whole number" })
    .min(0, { message: "Quantity cannot be negative" }),

  purchasePrice: z
    .number()
    .min(0, { message: "Purchase price cannot be negative" }),
});

const itemSchema = z.object({
  name: z.string(),
  barcode: z.uuid().optional(),
  category: z.string(),
  expiryDate: z.date({ message: "Expire date is required" }),
  locationId: z.number({ message: "Please select a valid location" }),
  description: z.string().optional(),
  itemUnits: z
    .array(subUnitSchema)
    .length(3, { message: "You must provide exactly 3 units" }),
});

export const itemArraySchema = z.array(itemSchema);

export const validateItems = (data: ImportItems) => {
  try {
    return itemArraySchema.parse(data);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((issue) => {
          const itemIndex = Number(issue.path[0]) + 1;
          const fieldName = String(issue.path[issue.path.length - 1]);

          return `Item${itemIndex} ${fieldName}: ${issue.message}`;
        })
        .join(", ");
      throw new BadRequestError(errorMessages);
    }
    throw error;
  }
};
