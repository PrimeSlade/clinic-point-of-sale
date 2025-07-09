import prisma from "../config/prisma.client";
import { CustomError } from "../errors/CustomError";
import { NotFoundError } from "../errors/NotFoundError";
import { Service, UpdateService } from "../types/service.type";

const addService = async (data: Service) => {
  try {
    const addedService = await prisma.service.create({
      data: data,
    });

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
    const services = await prisma.service.findMany();

    return services;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError("Services not found");
    }

    throw new CustomError("Database operation failed", 500);
  }
};

const updateService = async (data: UpdateService, id: number) => {
  try {
    const updatedService = await prisma.service.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        retailPrice: data.retailPrice,
      },
    });

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
    const deletedService = await prisma.service.delete({
      where: {
        id: id,
      },
    });

    return deletedService;
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundError();
    }

    throw new CustomError("Database operation failed", 500);
  }
};

export { addService, getServices, updateService, deleteService };
