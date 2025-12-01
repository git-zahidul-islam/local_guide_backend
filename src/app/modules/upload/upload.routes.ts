import express from 'express';
import { UploadController } from './upload.controller';
import auth from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { Router } from "express";

const router = express.Router();

router.post(
  '/single',
  auth('TOURIST', 'GUIDE', 'ADMIN'),
  upload.single('image'),
  UploadController.uploadSingle
);

router.post(
  '/multiple',
  auth('GUIDE', 'ADMIN'),
  upload.array('images', 10),
  UploadController.uploadMultiple
);

export const UploadRoutes : Router = router;