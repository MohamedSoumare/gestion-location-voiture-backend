import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import vehicleRoutes from './routes/vechicleRoutes.js';
import { Prisma } from '@prisma/client';

dotenv.config(); // Charger les variables d'environnement depuis .env

const app = express();

// Middlewares globaux
app.use(express.json());
app.use(cors());
app.use(morgan('dev')); // Logger les requêtes HTTP

app.use(userRoutes);
app.use(customerRoutes);
app.use(vehicleRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use(errorHandler); // Middleware pour capturer les erreurs et les retourner sous forme JSON

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export default app;
