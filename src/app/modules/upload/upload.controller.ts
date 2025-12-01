import { Request, Response } from 'express';
import catchAsync from '../../../shared/utils/catchAsync';
import sendResponse from '../../../shared/utils/sendResponse';
import { uploadToCloudinary } from '../../helper/uploadHelper';
import AppError from '../../error/AppError';

const uploadSingle = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError(400, 'No file uploaded');
  }

  const imageUrl = await uploadToCloudinary(req.file, 'local-guide/profiles');

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'File uploaded successfully',
    data: { imageUrl },
  });
});

const uploadMultiple = catchAsync(async (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError(400, 'No files uploaded');
  }

  const uploadPromises = req.files.map((file) =>
    uploadToCloudinary(file, 'local-guide/listings')
  );

  const imageUrls = await Promise.all(uploadPromises);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Files uploaded successfully',
    data: { imageUrls },
  });
});

export const UploadController = {
  uploadSingle,
  uploadMultiple,
};