import {
  Treatment,
  TreatmentByCursorQueryParams,
  TreatmentQueryParams,
  UpdateTreatment,
} from "../types/treatment.type";
import * as treatmentModel from "../models/treatment.model";
import { NotFoundError, CustomError } from "../errors";
import { handlePrismaError } from "../errors/prismaHandler";

const addTreatment = async (data: Treatment) => {
  try {
    const addedTreatment = await treatmentModel.addTreatment(data);

    return addedTreatment;
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const getTreatments = async ({
  offset,
  limit,
  search,
  startDate,
  endDate,
  abacFilter,
}: TreatmentQueryParams) => {
  try {
    const { treatments, total } = await treatmentModel.getTreatments({
      offset,
      limit,
      search,
      startDate,
      endDate,
      abacFilter,
    });

    return { treatments, total };
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const getTreatmentsByCursor = async ({
  cursor,
  limit,
  location,
  patientName,
  doctorName,
  user,
  abacFilter,
}: TreatmentByCursorQueryParams) => {
  try {
    const { treatments, hasNextPage, nextCursor } =
      await treatmentModel.getTreatmentsByCursor({
        cursor,
        limit,
        location,
        patientName,
        doctorName,
        user,
        abacFilter,
      });

    return { treatments, hasNextPage, nextCursor };
  } catch (error: any) {
    handlePrismaError(error);
  }
};

const getTreatmentById = async (id: number) => {
  try {
    const treatment = await treatmentModel.getTreatmentById(id);

    return treatment;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Treatment not found" });
  }
};

const updateTreatment = async (data: UpdateTreatment, id: number) => {
  try {
    const updatedTreatment = await treatmentModel.updateTreatment(data, id);

    return updatedTreatment;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Treatment not found" });
  }
};

const deleteTreatment = async (id: number) => {
  try {
    const deletedTreatment = await treatmentModel.deleteTreatment(id);

    return deletedTreatment;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Treatment not found" });
  }
};

export {
  addTreatment,
  getTreatments,
  getTreatmentsByCursor,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
};
