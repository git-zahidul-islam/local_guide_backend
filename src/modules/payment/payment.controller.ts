import { NextFunction, Request, Response } from "express";
import AppError from "../../helper/AppError";
import { PaymentService } from "./payment.service";
import httpStatus from "http-status-codes"
import { prisma } from "../../lib/prisma";
import axios from "axios";
const initiatePaymentController = async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
        const bookingId = req.params.id
        const userId = req.user?.id; // Assuming you have auth middleware

        if (!bookingId) {
            throw new AppError(httpStatus.BAD_REQUEST, "Booking ID is required");
        }

        if (!userId) {
            throw new AppError(httpStatus.UNAUTHORIZED, "User authentication required");
        }

        const result = await PaymentService.initPayment(bookingId, userId);

        res.status(httpStatus.OK).json({
            success: true,
            message: "Payment initiated successfully",
            data: result.data
        });

    } catch (error) {
        next(error);
    }
}



// -------------------------
// SSL Success Handler
// -------------------------
const sslSuccessHandler = async (req: Request, res: Response, next: NextFunction) => {


    // Check BOTH naming conventions
    const transactionId = req.query.tran_id || req.query.transactionId;
    const bookingId = req.query.value_a || req.query.bookingId;



    if (!transactionId) {
        return res.redirect(`${process.env.SSL_FAIL_FRONTEND_URL}?error=Missing transaction ID`);
    }

    try {
        // 1️⃣ Find the transaction
        const transaction = await prisma.sSLCommerzTransaction.findUnique({
            where: {
                transactionId: transactionId as string
            },
            include: {
                booking: {
                    include: {
                        payment: true
                    }
                }
            },
        });

        if (!transaction || !transaction.booking) {
            console.log('❌ Transaction or booking not found:', transactionId);
            return res.redirect(`${process.env.SSL_FAIL_FRONTEND_URL}?transactionId=${transactionId}&error=Transaction not found`);
        }

        // Get bookingId from transaction if not in query
        const actualBookingId = bookingId as string || transaction.bookingId;

        console.log('🎯 Processing payment:', {
            transactionId,
            actualBookingId,
            hasPayment: !!transaction.booking.payment
        });

        // 2️⃣ For sandbox testing, skip verification
        console.log('⚠️ Sandbox mode - processing without verification');

        // Process payment without verification
        await prisma.$transaction(async (tx) => {
            // Update transaction
            await tx.sSLCommerzTransaction.update({
                where: { transactionId: transactionId as string },
                data: {
                    status: "SUCCESS",
                    valId: "SANDBOX_TEST_" + Date.now(),
                    bankTransaction: "SANDBOX_TEST_" + Date.now(),
                    updatedAt: new Date()
                },
            });

            // Update payment USING bookingId (not transactionId)
            await tx.payment.update({
                where: {
                    bookingId: actualBookingId as string
                },
                data: {
                    status: "COMPLETED",
                    updatedAt: new Date()
                },
            });

            // Update booking
            await tx.booking.update({
                where: { id: actualBookingId as string },
                data: {
                    status: "CONFIRMED",
                    updatedAt: new Date()
                },
            });
        });



        return res.redirect(
            `${process.env.SSL_SUCCESS_FRONTEND_URL}?transactionId=${transactionId}&bookingId=${actualBookingId}`
        );

    } catch (error: any) {

        next(error)
        // Update as failed
        try {
            if (transactionId) {
                await prisma.sSLCommerzTransaction.update({
                    where: { transactionId: transactionId as string },
                    data: { status: "FAILED", updatedAt: new Date() },
                });

                // Try to find booking to update payment
                const transaction = await prisma.sSLCommerzTransaction.findUnique({
                    where: { transactionId: transactionId as string }
                });

                if (transaction?.bookingId) {
                    await prisma.payment.update({
                        where: { bookingId: transaction.bookingId }, // Use bookingId
                        data: { status: "FAILED", updatedAt: new Date() },
                    });
                }
            }
        } catch (dbError) {
            console.error("Database update error:", dbError);
        }

        const errorMessage = encodeURIComponent(error.message || "Payment processing failed");
        return res.redirect(
            `${process.env.SSL_FAIL_FRONTEND_URL}?transactionId=${transactionId}&error=${errorMessage}`
        );
    }
};

// -------------------------
// SSL Fail Handler
// -------------------------
const sslFailHandler = async (req: Request, res: Response) => {
    console.log("❌ SSL Fail Callback:", req.query);

    const transactionId = req.query.tran_id || req.query.transactionId;
    const error = req.query.error;

    if (transactionId) {
        try {
            await prisma.sSLCommerzTransaction.update({
                where: { transactionId: transactionId as string },
                data: { status: "FAILED", updatedAt: new Date() },
            });

            // Find transaction to get bookingId
            const transaction = await prisma.sSLCommerzTransaction.findUnique({
                where: { transactionId: transactionId as string }
            });

            if (transaction?.bookingId) {
                await prisma.payment.update({
                    where: { bookingId: transaction.bookingId }, // Use bookingId
                    data: { status: "FAILED", updatedAt: new Date() },
                });
            }
        } catch (dbError) {
            console.error("Database update error:", dbError);
        }
    }

    return res.redirect(
        `${process.env.SSL_FAIL_FRONTEND_URL}?transactionId=${transactionId}&error=${error || "Payment failed"}`
    );
};

// -------------------------
// SSL Cancel Handler
// -------------------------
const sslCancelHandler = async (req: Request, res: Response) => {
    console.log("SSL Cancel Callback:", req.query);

    const { tran_id } = req.query;

    if (tran_id) {
        await prisma.sSLCommerzTransaction.update({
            where: { transactionId: tran_id as string },
            data: { status: "CANCELLED" },
        });

        const transaction = await prisma.sSLCommerzTransaction.findUnique({ where: { transactionId: tran_id as string } });
        if (transaction?.bookingId) {
            await prisma.payment.update({
                where: { bookingId: transaction.bookingId },
                data: { status: "CANCELLED" },
            });
        }
    }

    return res.redirect(`${process.env.SSL_CANCEL_FRONTEND_URL}?transactionId=${tran_id}`);
};


export const PaymentController = {
    initiatePaymentController,
    sslSuccessHandler,
    sslCancelHandler,
    sslFailHandler
}