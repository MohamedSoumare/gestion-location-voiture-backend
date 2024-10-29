import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import vehicleRoutes from './routes/vechicleRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
// import locationRoutes from './routes/locationRoutes.js';

import { Prisma } from '@prisma/client';
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use(userRoutes);
app.use(customerRoutes);
app.use(vehicleRoutes);
app.use(reservationRoutes);

// app.use(locationRoutes);
app.use(contractRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app;
