import { CustomError, NotFoundError } from "../errors";
import { Service, UpdateService } from "../types/service.type";
import * as serviceModel from "../models/service.model";
import { handlePrismaError } from "../errors/prismaHandler";

const addService = async (data: Service) => {
  try {
    const addedService = await serviceModel.addService(data);

    return addedService;
  } catch (error: any) {
    handlePrismaError(error);
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
    handlePrismaError(error);
  }
};

const updateService = async (data: UpdateService, id: number) => {
  try {
    const updatedService = await serviceModel.updateService(data, id);

    return updatedService;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Service not found" });
  }
};

const deleteService = async (id: number) => {
  try {
    const deletedService = await serviceModel.deleteService(id);

    return deletedService;
  } catch (error: any) {
    handlePrismaError(error, { P2025: "Service not found" });
  }
};

export { addService, getServices, updateService, deleteService };
