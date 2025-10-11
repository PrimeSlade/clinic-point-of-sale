import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../errors";
import * as treatmentService from "../services/treatment.service";
import { sendResponse } from "../utils/response";

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

    sendResponse(res, 201, "Treatment created successfully", addedTreatment);
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

    sendResponse(res, 200, "Treatments fetched successfully", treatments, {
      page,
      totalPages: totalPages,
      totalItems: total,
      hasNextPage,
    });
  } catch (error: any) {
    next(error);
  }
};

const getTreatmentsByCursor = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const cursor = req.query.cursor as string;
  const limit = Number(req.query.limit);
  const location = String(req.query.location || "");
  const patientName = String(req.query.patientName || "");
  const doctorName = String(req.query.doctorName || "");

  const user = req.user;
  const abacFilter = req.abacFilter;

  try {
    const { treatments, hasNextPage, nextCursor } =
      await treatmentService.getTreatmentsByCursor({
        cursor,
        limit,
        location,
        patientName,
        doctorName,
        user,
        abacFilter,
      });

    sendResponse(res, 200, "Treatments fetched successfully", treatments, {
      hasNextPage,
      nextCursor,
    });
  } catch (error: any) {
    next(error);
  }
};

const getTreatmentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const id = Number(req.params.id);

  if (!id) {
    throw new BadRequestError("Treatment id is required");
  }

  try {
    const treatment = await treatmentService.getTreatmentById(id);

    sendResponse(res, 200, "Treatment fetched successfully", treatment);
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

    sendResponse(res, 200, "Treatment updated successfully", updatedTreatment);
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

    sendResponse(res, 200, "Treatment deleted successfully", deletedTreatment);
  } catch (error: any) {
    next(error);
  }
};

export {
  addTreatment,
  getTreatments,
  getTreatmentsByCursor,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
};
