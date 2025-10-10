import { CustomError, NotFoundError } from "../errors";
import { Service, UpdateService } from "../types/service.type";
import * as serviceModel from "../models/service.model";

const addService = async (data: Service) => {
  try {
    const addedService = await serviceModel.addService(data);

    return addedService;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const getServices = async () => {
  try {
    const services = await serviceModel.getServices();

    const parsedServices = services.map((s) => ({
      ...s,
      retailPrice: Number(s.retailPrice),
    }));

    return parsedServices;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Services not found");
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const updateService = async (data: UpdateService, id: number) => {
  try {
    const updatedService = await serviceModel.updateService(data, id);

    return updatedService;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const deleteService = async (id: number) => {
  try {
    const deletedService = await serviceModel.deleteService(id);

    return deletedService;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

export { addService, getServices, updateService, deleteService };
