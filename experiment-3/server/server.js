import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';

// 1. Initialize Environment Variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_key_change_in_prod';

// Warning check for production
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ [WARNING] JWT_SECRET not found in environment. Using fallback development key.');
}

// 2. Configure CORS for Local Development
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, Postman) or from whitelisted dev origins
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocks request from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Body Parsing Middleware
app.use(express.json());

// 4. API Request Logger (Development Telemetry)
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  const hasAuth = req.headers.authorization ? 'Bearer [PRESENT]' : '[NO TOKEN]';
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${hasAuth}`);
  next();
});

// 5. Root & Health Check Endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    experiment: 'Experiment 3: Secure Authentication Using JSON Web Tokens (JWT)',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// 6. Mount Feature Routers
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);

// 7. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    code: 'ROUTE_NOT_FOUND'
  });
});

// 8. Global Error Handler (Sanitizes stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'An unexpected internal server error occurred.',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// 9. Start Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 Experiment 3 Backend Server running on port ${PORT}`);
  console.log(`🔒 JWT Secret Configured: ${JWT_SECRET.slice(0, 4)}****`);
  console.log(`🌐 Base API URL: http://localhost:${PORT}/api`);
  console.log('====================================================');
});
