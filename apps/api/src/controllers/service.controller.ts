import { NextFunction, Request, Response } from "express";
import * as serviceService from "../services/service.service";
import { BadRequestError } from "../errors";
import { sendResponse } from "../utils/response";

const addService = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new BadRequestError("Service data is required");
  }

  try {
    const addedService = await serviceService.addService(data);

    sendResponse(res, 201, "Service created successfully", addedService);
  } catch (error: any) {
    next(error);
  }
};

const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const services = await serviceService.getServices();

    sendResponse(res, 200, "Services fetched successfully", services);
  } catch (error: any) {
    next(error);
  }
};

const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;
  const id = Number(req.params.id);

  try {
    const updatedService = await serviceService.updateService(data, id);

    sendResponse(res, 200, "Service updated successfully", updatedService);
  } catch (error: any) {
    next(error);
  }
};

const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const deletedService = await serviceService.deleteService(id);

    sendResponse(res, 200, "Service deleted successfully", deletedService);
  } catch (error: any) {
    next(error);
  }
};

export { addService, getServices, updateService, deleteService };
