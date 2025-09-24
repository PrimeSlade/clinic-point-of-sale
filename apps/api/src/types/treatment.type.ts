import { PrismaQuery } from "@casl/prisma";
import { UserInfo } from "./auth.type";

type Treatment = {
  doctorId: string;
  patientId: number;
  investigation?: string;
  diagnosis?: string;
  treatment: string;
};

type TreatmentQueryParams = {
  offset: number;
  limit: number;
  search: string;
  startDate?: string;
  endDate?: string;
  abacFilter: PrismaQuery;
};

type TreatmentByCursorQueryParams = {
  cursor: string;
  limit: number;
  location?: string;
  patientName?: string;
  doctorName?: string;
  abacFilter: PrismaQuery;
  user: UserInfo;
};

type UpdateTreatment = Partial<Treatment>;

export {
  Treatment,
  UpdateTreatment,
  TreatmentQueryParams,
  TreatmentByCursorQueryParams,
};
