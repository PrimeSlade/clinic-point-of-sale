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

  unitType1: UnitType;
  unit1: number;
  purchasePrice1: number;

  unitType2: UnitType;
  unit2: number;
  purchasePrice2: number;

  unitType3: UnitType;
  unit3: number;
  purchasePrice3: number;

  description?: string; //option
};

export { Item };
