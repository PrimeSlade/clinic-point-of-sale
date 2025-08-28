import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors/BadRequestError";
import * as treatmentService from "../services/treatment.service";

const addTreatment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;

  if (!data) {
    throw new BadRequestError("Treatment data is required");
  }

  try {
    const addedTreatment = await treatmentService.addTreatment(data);

    res.status(201).json({
      success: true,
      message: "Treatment created successfully!",
      data: addedTreatment,
    });
  } catch (error: any) {
    next(error);
  }
};

const getTreatments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);
  const search = String(req.query.search || "");
  const startDate = String(req.query.startDate || "");
  const endDate = String(req.query.endDate || "");

  //pagination
  const offset = (page - 1) * limit;

  const abacFilter = req.abacFilter;

  try {
    const { treatments, total } = await treatmentService.getTreatments({
      offset,
      limit,
      search,
      startDate,
      endDate,
      abacFilter,
    });

    //pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;

    res.status(200).json({
      success: true,
      message: "Treatments fetched successfully!",
      data: treatments,
      meta: {
        page,
        totalPages,
        totalItems: total,
        hasNextPage,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

const getTreatmentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id = Number(req.params.id);

  if (!id) {
    throw new BadRequestError("Treatment id is required");
  }

  try {
    const treatment = await treatmentService.getTreatmentById(id);

    res.status(200).json({
      success: true,
      message: "Treatment fetched successfully!",
      data: treatment,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateTreatment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const data = req.body;
  const id = Number(req.params.id);

  if (!data || !id) {
    throw new BadRequestError("Treatment data or id is required");
  }

  try {
    const updatedTreatment = await treatmentService.updateTreatment(data, id);

    res.status(200).json({
      success: true,
      message: "Treatment updated successfully!",
      data: updatedTreatment,
    });
  } catch (error: any) {
    next(error);
  }
};

const deleteTreatment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const deletedTreatment = await treatmentService.deleteTreatment(id);

    res.status(200).json({
      success: true,
      message: "Treatment deleted successfully!",
      data: deletedTreatment,
    });
  } catch (error: any) {
    next(error);
  }
};

export {
  addTreatment,
  getTreatments,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
};
