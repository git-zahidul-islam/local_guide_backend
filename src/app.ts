import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/error/globalErrorHandler';
import routes from './routes';
import config from './config';
import notFound from './app/middleware/notFound';

const app: Application = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS
app.use(
  cors({
    origin: config.client_url,
    credentials: true,
  })
);

// Parser
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

app.get('/', (req, res) => { 
  res.json({ message: 'Tourism guide' });
});

// Application routes
app.use('/api/v1', routes);

// Handle not found
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;