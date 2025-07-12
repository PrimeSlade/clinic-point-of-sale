import { Treatment, UpdateTreatment } from "../types/treatment.type";
import * as treatmentModel from "../models/treatment.model";
import { NotFoundError } from "../errors/NotFoundError";
import { CustomError } from "../errors/CustomError";

const addTreatment = async (data: Treatment) => {
  try {
    const addedTreatment = await treatmentModel.addTreatment(data);

    return addedTreatment;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Services not found");
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

const getTreatments = async () => {
  try {
    const treatments = await treatmentModel.getTreatments();

    return treatments;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Services not found");
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
      throw new NotFoundError("Services not found");
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
      throw new NotFoundError("Services not found");
    }

    throw new CustomError("Database operation failed", 500, { cause: error });
  }
};

export { addTreatment, getTreatments, updateTreatment, deleteTreatment };
