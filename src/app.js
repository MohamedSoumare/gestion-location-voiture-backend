import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import vehicleRoutes from './routes/vechicleRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(morgan('dev'));

// CORS Configuration
const corsOptions = {
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Routes
app.use(userRoutes);
app.use(authRoutes);
app.use(customerRoutes);
app.use(vehicleRoutes);
app.use(reservationRoutes);
app.use(contractRoutes);

// 404 Error for undefined routes
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app;
