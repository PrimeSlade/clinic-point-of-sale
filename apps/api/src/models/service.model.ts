import prisma from "../config/prisma.client";
import { Service, UpdateService } from "../types/service.type";

const addService = async (data: Service) => {
  return prisma.service.create({
    data: data,
  });
};

const getServices = async () => {
  return prisma.service.findMany();
};

const updateService = async (data: UpdateService, id: number) => {
  return prisma.service.update({
    where: {
      id,
    },
    data: {
      name: data.name,
      retailPrice: data.retailPrice,
    },
  });
};

const deleteService = async (id: number) => {
  return prisma.service.delete({
    where: {
      id: id,
    },
  });
};

export { addService, getServices, updateService, deleteService };