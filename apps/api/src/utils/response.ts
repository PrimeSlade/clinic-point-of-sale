import { Response } from "express";

interface MetaBase {
  hasNextPage: boolean;
}

interface CursorMeta extends MetaBase {
  nextCursor: string | null;
}

interface OffsetMeta extends MetaBase {
  page: number;
  totalPages: number;
  totalItems: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: CursorMeta | OffsetMeta;
}

export const sendResponse = <T>(
  res: Response,
  status: number = 200,
  message: string,
  data: T,
  meta?: CursorMeta | OffsetMeta,
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };

  res.status(status).json(response);
};
