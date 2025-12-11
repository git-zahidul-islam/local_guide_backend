/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status-codes";
import { prisma } from "../../lib/prisma";
import AppError from "../../helper/AppError";
import { sslPaymentInit } from "../sslPayment/sslPayment.service";


const initPayment = async (bookingId: string, userId: string) => {
    // Find booking with relations
    const booking = await prisma.booking.findUnique({
        where: { 
            id: bookingId,
            userId: userId // Ensure user owns this booking
        },
        include: {
            payment: true,
            tour: true,
            user: true,
            sslcommerzTransaction: true
        }
    });

    if (!booking) {
        throw new AppError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (!booking.payment) {
        throw new AppError(httpStatus.NOT_FOUND, "Payment record not found");
    }

    // Check if payment is already completed
    if (booking.payment.status === 'COMPLETED') {
        throw new AppError(httpStatus.BAD_REQUEST, "Payment already completed");
    }

    // Check if payment is pending
    if (booking.payment.status !== 'PENDING') {
        throw new AppError(httpStatus.BAD_REQUEST, "Payment cannot be initiated");
    }

    // Prepare SSLCommerz payload
    const sslPayload: any = {
        amount: booking.payment.amount,
        transactionId: booking.payment.transactionId,
        bookingId: booking.id,
        name: booking.user.name || booking.user.email.split("@")[0],
        email: booking.user.email,
        phone: booking.user.phone || "01700000000",
        address: booking.user.address || "Not provided"
    };

    // Initialize SSLCommerz payment
    let sslResponse;
    
    try {
        sslResponse = await sslPaymentInit(sslPayload);
        
        // Check if SSLCommerz responded with success
        if (!sslResponse || sslResponse.status !== 'SUCCESS') {
            throw new Error(`SSLCommerz initialization failed: ${sslResponse?.failedreason || 'Unknown error'}`);
        }

    } catch (error: any) {
        console.error("SSL Payment Init Error:", error);
        
        // Update payment status to failed
        await prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: 'FAILED' }
        });

        throw new AppError(httpStatus.BAD_REQUEST, `Payment initialization failed: ${error.message}`);
    }

    // Update SSL transaction with session key
    if (booking.sslcommerzTransaction) {
        await prisma.sSLCommerzTransaction.update({
            where: { id: booking.sslcommerzTransaction.id },
            data: {
                sessionKey: sslResponse.sessionkey,
                gatewayUrl: sslResponse.GatewayPageURL || sslResponse.redirectGatewayURL,
                status: 'INITIATED'
            }
        });
    } else {
        
        await prisma.sSLCommerzTransaction.create({
            data: {
                transactionId: booking.payment.transactionId as string,
                bookingId: booking.id,
                amount: booking.payment.amount,
                currency: "BDT",
                sessionKey: sslResponse.sessionkey,
                gatewayUrl: sslResponse.GatewayPageURL || sslResponse.redirectGatewayURL,
                status: 'INITIATED'
            }
        });
    }

    return {
        success: true,
        message: "Payment initialized successfully",
        data: {
            paymentUrl: sslResponse.GatewayPageURL || sslResponse.redirectGatewayURL,
            transactionId: booking.payment.transactionId,
            bookingId: booking.id,
            amount: booking.payment.amount,
            currency: "BDT"
        }
    };
};




export const PaymentService = {
    initPayment,
};