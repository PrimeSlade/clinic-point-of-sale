import { PrismaQuery } from "@casl/prisma";
import { UserInfo } from "./auth.type";
import { Location } from "./location.type";
import { Treatment } from "./treatment.type";

export enum PaymentMethod {
  KPAY = "kpay",
  WAVE = "wave",
  CASH = "cash",
  OTHERS = "others",
}

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

type InvoiceItem = {
  id: number;
  itemId: number;
  itemName: string;
  unitType: UnitType;
  quantity: number;
  purchasePrice: number;
  discountPrice: number;
};

type Invoice = {
  locationId: number;
  treatmentId?: number | null;
  totalAmount: number;
  discountAmount: number;
  paymentMethod: PaymentMethod;
  paymentDescription?: string | null;
  note?: string | null;
  invoiceItems: InvoiceItem[];
  location?: Location;
  treatment?: Treatment | null;
};

type InvoiceQueryParams = {
  offset: number;
  limit: number;
  search?: string;
  filter?: string;
  user: UserInfo;
  abacFilter?: PrismaQuery;
  startDate?: string;
  endDate?: string;
};

export { Invoice, InvoiceItem, InvoiceQueryParams };
