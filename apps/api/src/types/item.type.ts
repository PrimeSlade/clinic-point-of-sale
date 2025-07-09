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
  pricePercent: number;
  locationId: number;
  description?: string; //option
};

type UpdateItem = Partial<Item>;

type Unit = {
  unitType: UnitType;
  unit: number;
  purchasePrice: number;
};

type UpdateUnit = { id: number } & Partial<Unit>;

export { Item, Unit, UpdateItem, UpdateUnit };
