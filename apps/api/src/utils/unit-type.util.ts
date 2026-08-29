import { UnitType } from "../generated/prisma";

const UNIT_TYPE_ORDER = [
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
] as const satisfies readonly UnitType[];

const unitRank = Object.fromEntries(
  UNIT_TYPE_ORDER.map((unitType, index) => [unitType, index]),
) as Record<UnitType, number>;

const sortUnitsByType = <T extends { unitType: UnitType }>(units: T[]) => {
  return [...units].sort((a, b) => unitRank[a.unitType] - unitRank[b.unitType]);
};

export { UNIT_TYPE_ORDER, sortUnitsByType };
