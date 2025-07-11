import { NextFunction, Request, Response } from "express";
import * as serviceService from "../services/service.service";
import { BadRequestError } from "../errors/BadRequestError";

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

    res.status(201).json({
      success: true,
      message: "Service created",
      data: addedService,
    });
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

    res.status(200).json({
      success: true,
      message: "Services fetched",
      data: services,
    });
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

    res.status(200).json({
      success: true,
      message: "Service updated",
      data: updatedService,
    });
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

    res.status(200).json({
      success: true,
      message: "Service deleted",
      data: deletedService,
    });
  } catch (error: any) {
    next(error);
  }
};

export { addService, getServices, updateService, deleteService };
