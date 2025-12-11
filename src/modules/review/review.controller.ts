import { Request, Response, NextFunction } from "express";
import { ReviewService } from "./review.service";


const createReview = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        console.log(userId)
        const tourId  = req.params.id;
        console.log(tourId)
        const { rating, comment } = req.body;

        const review = await ReviewService.createReview(tourId, userId, Number(rating), comment);

        res.status(201).json({
            success: true,
            message: "Review submitted",
            data: review
        });

    } catch (error) {
        next(error);
    }
};


const getTourReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const  tourId  = req.params.tourId;

        const reviews = await ReviewService.getReviewsByTour(tourId);

        res.json({
            success: true,
            data: reviews
        });

    } catch (error) {
        next(error);
    }
};


export const ReviewController = {
    createReview,
    getTourReviews
};
