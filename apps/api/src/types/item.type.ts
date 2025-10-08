import { PrismaQuery } from "@casl/prisma";
import { UserInfo } from "./auth.type";

export enum UnitType {
  BTL = "btl",
  AMP = "amp",
  TUBE = "tube",
  STRIP = "strip",
  CAP = "cap",
  PCS = "pcs",
  SAC = "sac",
  BOX = "box",
  PKG = "pkg",
  TAB = "tab",
}

type Item = {
  name: string;
  category: string;
  expiryDate: string;
  locationId: number;
  barcode: string;
  description?: string; //option
};

type UpdateItem = Partial<Item>;

type Unit = {
  unitType: UnitType;
  quantity: number;
  purchasePrice: number;
  rate: number;
};

type UpdateUnit = { id: number } & Partial<Unit>;

type ImportUnit = Unit & { id?: number };

type ItemQueryParams = {
  offset: number;
  limit: number;
  search: string;
  filter: string;
  user: UserInfo;
  abacFilter: PrismaQuery;
};

export { Item, Unit, UpdateItem, ImportUnit, UpdateUnit, ItemQueryParams };
