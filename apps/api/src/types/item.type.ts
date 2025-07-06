type UnitType =
  | "btl"
  | "amp"
  | "tube"
  | "strip"
  | "cap"
  | "pcs"
  | "sac"
  | "box"
  | "pkg"
  | "tab";

type Item = {
  name: string;
  category: string;
  expiryDate: string;
  pricePercent: number;
  locationId: number;
  description?: string; //option
};

type Unit = {
  unitType: UnitType;
  unit: number;
  purchasePrice: number;
};

export { Item, Unit };
