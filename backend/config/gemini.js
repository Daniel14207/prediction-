
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.API_KEY) {
  console.error("ERREUR CRITIQUE: La variable API_KEY est manquante dans le fichier .env");
  process.exit(1);
}

// Initialisation unique du client
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
