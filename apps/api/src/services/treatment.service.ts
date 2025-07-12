import { Treatment } from "../types/treatment.type";
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

    throw new CustomError("Database operation failed", 500);
  }
};

export { addTreatment };
