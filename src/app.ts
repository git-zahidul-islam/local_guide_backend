import express, { Request, Response } from "express";
import routes from "./routes"; // Your main router (import all modules there)
import cors from "cors";
import cookieParser from "cookie-parser";
import { notFoundRoute } from "./middleware/notFoundRoute";
import dotenv from "dotenv";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { PaymentController } from "./app/modules/payments/payments.controller";
import { envVars } from "./app/config/env";

// Load env vars
dotenv.config();

const app = express();
app.use(cookieParser());
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent
);

// CORS configuration
const corsOptions = {
  origin: [
    envVars.FRONTEND_URL,
    "http://localhost:3000",
    /\.vercel\.app$/,
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
};

app.use(cors(corsOptions));

// REMOVE THIS: app.options("*", cors(corsOptions));
// The cors() middleware already handles OPTIONS!
app.use(express.json());
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

// Landing page with Local Guide Platform API info
app.get("/", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>🗺️ Local Guide Platform API</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            color: #333;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          }
          h1 {
            text-align: center;
            color: #1e3c72;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
          }
          .status {
            text-align: center;
            background: #d4edda;
            color: #155724;
            padding: 12px 20px;
            border-radius: 50px;
            display: inline-block;
            font-weight: 600;
            margin-bottom: 30px;
          }
          .routes {
            margin-top: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 30px;
          }
          .route-group {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
          }
          .route-group h2 {
            border-bottom: 2px solid #667eea;
            padding-bottom: 8px;
            color: #1e3c72;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .route {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #eee;
            padding: 12px 0;
            font-size: 1.05em;
          }
          .route:last-child {
            border-bottom: none;
          }
          .badge {
            background: #667eea;
            color: white;
            border-radius: 6px;
            padding: 6px 12px;
            font-weight: 700;
            font-family: monospace;
            font-size: 0.85em;
            white-space: nowrap;
          }
          .method {
            background: #28a745;
            color: white;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 0.8em;
            font-weight: bold;
            margin-right: 8px;
          }
          .method.get { background: #28a745; }
          .method.post { background: #007bff; }
          .method.patch { background: #ffc107; color: #000; }
          .method.delete { background: #dc3545; }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
          }
          .doc-box {
            background: #fff3cd;
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
            border: 1px solid #ffeeba;
            color: #856404;
          }
          .route-endpoint {
            display: flex;
            align-items: center;
          }
          .feature-highlights {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
          }
          .feature-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
          }
          .feature-card h3 {
            margin: 0 0 10px 0;
            font-size: 1.1em;
          }
        </style>
    </head>
    <body>
      <div class="container">
        <h1>🗺️ Local Guide Platform API</h1>
        <div class="status">🚀 Server is running smoothly</div>

        <div class="feature-highlights">
          <div class="feature-card">
            <h3>👥 User Management</h3>
            <p>Tourist & Guide Profiles</p>
          </div>
          <div class="feature-card">
            <h3>🏛️ Tour Listings</h3>
            <p>CRUD Operations</p>
          </div>
          <div class="feature-card">
            <h3>📅 Booking System</h3>
            <p>Secure Reservations</p>
          </div>
          <div class="feature-card">
            <h3>⭐ Reviews & Ratings</h3>
            <p>Post-Tour Feedback</p>
          </div>
        </div>

        <div class="routes">
          <div class="route-group">
            <h2>🔐 Authentication</h2>
            <div class="route">
              <span>Register User</span>
              <div class="route-endpoint">
                <span class="method post">POST</span>
                <span class="badge">/api/auth/register</span>
              </div>
            </div>
            <div class="route">
              <span>Login User</span>
              <div class="route-endpoint">
                <span class="method post">POST</span>
                <span class="badge">/api/auth/login</span>
              </div>
            </div>
            <div class="route">
              <span>Get Current User</span>
              <div class="route-endpoint">
                <span class="method get">GET</span>
                <span class="badge">/api/auth/me</span>
              </div>
            </div>
          </div>

          <div class="route-group">
            <h2>👤 User Management</h2>
            <div class="route">
              <span>Get User Profile</span>
              <div class="route-endpoint">
                <span class="method get">GET</span>
                <span class="badge">/api/users/:id</span>
              </div>
            </div>
            <div class="route">
              <span>Update User Profile</span>
              <div class="route-endpoint">
                <span class="method patch">PATCH</span>
                <span class="badge">/api/users/:id</span>
              </div>
            </div>
          </div>

          <div class="route-group">
            <h2>🏛️ Tour Listings</h2>
            <div class="route">
              <span>Get All Listings</span>
              <div class="route-endpoint">
                <span class="method get">GET</span>
                <span class="badge">/api/listings</span>
              </div>
            </div>
            <div class="route">
              <span>Create Listing</span>
              <div class="route-endpoint">
                <span class="method post">POST</span>
                <span class="badge">/api/listings</span>
              </div>
            </div>
            <div class="route">
              <span>Update Listing</span>
              <div class="route-endpoint">
                <span class="method patch">PATCH</span>
                <span class="badge">/api/listings/:id</span>
              </div>
            </div>
            <div class="route">
              <span>Delete Listing</span>
              <div class="route-endpoint">
                <span class="method delete">DELETE</span>
                <span class="badge">/api/listings/:id</span>
              </div>
            </div>
            <div class="route">
              <span>Get Listing Details</span>
              <div class="route-endpoint">
                <span class="method get">GET</span>
                <span class="badge">/api/listings/:id</span>
              </div>
            </div>
          </div>

          <div class="route-group">
            <h2>📅 Booking System</h2>
            <div class="route">
              <span>Create Booking</span>
              <div class="route-endpoint">
                <span class="method post">POST</span>
                <span class="badge">/api/bookings</span>
              </div>
            </div>
            <div class="route">
              <span>Update Booking Status</span>
              <div class="route-endpoint">
                <span class="method patch">PATCH</span>
                <span class="badge">/api/bookings/:id</span>
              </div>
            </div>
            <div class="route">
              <span>Get User Bookings</span>
              <div class="route-endpoint">
                <span class="method get">GET</span>
                <span class="badge">/api/bookings/user</span>
              </div>
            </div>
            <div class="route">
              <span>Get Guide Bookings</span>
              <div class="route-endpoint">
                <span class="method get">GET</span>
                <span class="badge">/api/bookings/guide</span>
              </div>
            </div>
          </div>

          <div class="route-group">
            <h2>⭐ Reviews & Ratings</h2>
            <div class="route">
              <span>Create Review</span>
              <div class="route-endpoint">
                <span class="method post">POST</span>
                <span class="badge">/api/reviews</span>
              </div>
            </div>
            <div class="route">
              <span>Get Guide Reviews</span>
              <div class="route-endpoint">
                <span class="method get">GET</span>
                <span class="badge">/api/reviews/guide/:id</span>
              </div>
            </div>
            <div class="route">
              <span>Get Listing Reviews</span>
              <div class="route-endpoint">
                <span class="method get">GET</span>
                <span class="badge">/api/reviews/listing/:id</span>
              </div>
            </div>
          </div>

          <div class="route-group">
            <h2>💳 Payments</h2>
            <div class="route">
              <span>Create Payment Intent</span>
              <div class="route-endpoint">
                <span class="method post">POST</span>
                <span class="badge">/api/payments/create-intent</span>
              </div>
            </div>
            <div class="route">
              <span>Confirm Payment</span>
              <div class="route-endpoint">
                <span class="method post">POST</span>
                <span class="badge">/api/payments/confirm</span>
              </div>
            </div>
          </div>
        </div>

        <div class="doc-box">
          <h3>📖 API Documentation</h3>
          <p><strong>Base URL:</strong> ${req.protocol}://${req.get(
    "host"
  )}/api</p>
          <p><strong>Authentication:</strong> JWT Bearer Token required for protected routes</p>
          <p><strong>Roles:</strong> tourist, guide, admin</p>
        </div>

        <div class="footer">
          <p>Local Guide Platform v1.0.0</p>
          <p>Developed with ❤️ using Node.js, Express, TypeScript, and MongoDB - By Zahid</p>
          <p>Last Updated: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

app.use(globalErrorHandler);
app.use(notFoundRoute);

export default app;
