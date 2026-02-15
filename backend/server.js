
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './api/routes.js';

// Chargement de la configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité et parsing
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*' // À restreindre en production
}));

// Augmentation de la limite pour accepter les images Base64 (50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Montage des routes
// Le frontend appelle /api/analyse, donc on monte sur /api
app.use('/api', apiRoutes);

// Gestion des erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur critique' });
});

// Démarrage
app.listen(PORT, () => {
  console.log(`
  🚀 Serveur VICK V4 Backend démarré
  📡 Port: ${PORT}
  🤖 Mode: ${process.env.NODE_ENV || 'development'}
  `);
});
