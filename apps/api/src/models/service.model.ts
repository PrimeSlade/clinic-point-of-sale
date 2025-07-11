import prisma from "../config/prisma.client";
import { Service, UpdateService } from "../types/service.type";

const addService = async (data: Service) => {
  const addedService = await prisma.service.create({
    data: data,
  });

  return addedService;
};

const getServices = async () => {
  const services = await prisma.service.findMany();

  return services;
};

const updateService = async (data: UpdateService, id: number) => {
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
};

const deleteService = async (id: number) => {
  const deletedService = await prisma.service.delete({
    where: {
      id: id,
    },
  });

  return deletedService;
};

export { addService, getServices, updateService, deleteService };