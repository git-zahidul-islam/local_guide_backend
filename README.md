# Local Guide Platform Backend

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env` file and update with your database credentials
   - Update PostgreSQL connection string
   - Add your Cloudinary and Stripe keys

3. **Database Setup**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register user
- POST `/api/v1/auth/login` - Login user

### Users
- GET `/api/v1/users` - Get all users
- GET `/api/v1/users/:id` - Get single user
- PATCH `/api/v1/users/profile` - Update profile

## Next Steps

1. Complete remaining modules (listing, booking, review, payment, admin)
2. Add file upload functionality
3. Implement Stripe payment integration
4. Add comprehensive testing
5. Deploy to production

## Architecture

This backend follows a modular MVC pattern with:
- **Prisma ORM** for database operations
- **JWT Authentication** with role-based access
- **Zod Validation** for request validation
- **TypeScript** for type safety
- **Express.js** as the web framework