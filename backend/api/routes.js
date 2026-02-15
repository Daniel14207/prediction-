
import express from 'express';
import { analyzeImage } from '../services/analysis.js';

const router = express.Router();

// Route POST /api/analyse
// Attend un JSON : { base64, mimeType, prompt }
router.post('/analyse', async (req, res) => {
  try {
    const { base64, mimeType, prompt } = req.body;

    // Validation des entrées
    if (!base64) {
      return res.status(400).json({ error: "L'image (base64) est requise." });
    }

    console.log(`[Traitement] Analyse image demandée...`);

    // Appel du service Gemini
    const resultText = await analyzeImage(base64, mimeType, prompt);

    // Réponse au format attendu par ScannerScreen.tsx
    res.json({ 
      success: true,
      result: resultText 
    });

  } catch (error) {
    console.error("[Erreur API]", error.message);
    res.status(500).json({ 
      error: "Erreur interne lors de l'analyse.", 
      details: error.message 
    });
  }
});

// Route de santé (Health Check pour Render/Cloud Run)
router.get('/health', (req, res) => {
  res.status(200).send('OK');
});

export default router;
