import express, { Request, Response } from "express"

import cors from "cors"
import cookieParser from "cookie-parser"
import { userRoutes } from "./modules/user/user.router";
import { authRoutes } from "./modules/auth/auth.router";
import globalErrorHandler from "./middleware/globalErrorHandler";
import { tourRoutes } from "./modules/tour/tour.router";
import { bookingRoutes } from "./modules/booking/booking.router";
import { reviewRoutes } from "./modules/review/review.router";
import { paymentRoutes } from "./modules/payment/payement.router";
// import { randomBytes } from "crypto";


export const app = express()

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [
            'https://local-guide-frontend.vercel.app',
            /\.vercel\.app$/,
            /\.render\.com$/
          ]
        : true, // Allow all origins in development
    credentials: true,
    exposedHeaders: ['set-cookie'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'Origin']
};

app.use(cors(corsOptions));

app.use(express.json())
app.use(cookieParser()); 


// router 

app.use('/api/auth', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/tour', tourRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/reviews', reviewRoutes)

// Test route for Vercel
app.get("/test", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Default route testing

app.get('/',(req:Request, res:Response)=>{
    res.send("Abdur Rahman Server is running")
})

app.use(globalErrorHandler)

// const secretKey = randomBytes(32).toString("hex"); // Generates 32 random bytes and encodes to hex string
// console.log(secretKey);


