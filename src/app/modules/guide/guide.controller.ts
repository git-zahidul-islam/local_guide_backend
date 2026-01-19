
import httpStatus from "http-status";
import { guideService } from "./guide.service";
import { catchAsync } from "../../../utils/catchAsync";
import { sendResponse } from "../../../utils/sendResponse";
import { Request, Response } from "express";

const featureGuide = catchAsync(async (req: Request, res: Response) => {
  const result = await guideService.featureGuide()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Guide fetched successfully",
    data: result,
  });
});

export {
    featureGuide
};

