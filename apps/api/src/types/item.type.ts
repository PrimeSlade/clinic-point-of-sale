import { PrismaQuery } from "@casl/prisma";
import { UserInfo } from "./auth.type";
import z from "zod";
import { itemArraySchema } from "../utils/validation";
import { UnitType } from "../generated/prisma";

type Item = {
  name: string;
  category: string;
  expiryDate: Date;
  locationId: number;
  barcode?: string;
  description?: string; //option
};

type UpdateItem = Partial<Item>;

type Unit = {
  unitType: UnitType;
  quantity: number;
  purchasePrice: number;
  rate: number;
};

type UpdateUnit = { id: number; isChanged?: boolean } & Unit;

type ImportUnit = Unit & { id?: number };

//for importing from excel
type ImportItems = z.infer<typeof itemArraySchema>;

type ItemQueryParams = {
  offset: number;
  limit: number;
  search: string;
  filter: string;
  user: UserInfo;
  abacFilter: PrismaQuery;
};

export {
  Item,
  Unit,
  UpdateItem,
  ImportUnit,
  UpdateUnit,
  ItemQueryParams,
  ImportItems,
};
