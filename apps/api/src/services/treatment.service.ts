import {
  Treatment,
  TreatmentQueryParams,
  UpdateTreatment,
} from "../types/treatment.type";
import * as treatmentModel from "../models/treatment.model";
import { NotFoundError } from "../errors/NotFoundError";
import { CustomError } from "../errors/CustomError";

const addTreatment = async (data: Treatment) => {
  try {
    const addedTreatment = await treatmentModel.addTreatment(data);

    return addedTreatment;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getTreatments = async ({
  offset,
  limit,
  search,
  startDate,
  endDate,
}: TreatmentQueryParams) => {
  try {
    const { treatments, total } = await treatmentModel.getTreatments({
      offset,
      limit,
      search,
      startDate,
      endDate,
    });

    return { treatments, total };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getTreatmentById = async (id: number) => {
  try {
    const treatment = await treatmentModel.getTreatmentById(id);

    return treatment;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const updateTreatment = async (data: UpdateTreatment, id: number) => {
  try {
    const updatedTreatment = await treatmentModel.updateTreatment(data, id);

    return updatedTreatment;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const deleteTreatment = async (id: number) => {
  try {
    const deletedTreatment = await treatmentModel.deleteTreatment(id);

    return deletedTreatment;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export {
  addTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
};
