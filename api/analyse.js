
import { GoogleGenAI } from "@google/genai";
import Busboy from "busboy";

// Disable Vercel's default body parser to handle multipart/form-data via Busboy
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const busboy = Busboy({ headers: req.headers });
  const fields = {};
  let fileBuffer = null;
  let fileMimeType = null;

  return new Promise((resolve) => {
    // Parse text fields (prompt)
    busboy.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    // Parse file (image)
    busboy.on("file", (fieldname, file, info) => {
      fileMimeType = info.mimeType;
      const chunks = [];
      file.on("data", (data) => chunks.push(data));
      file.on("end", () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    // On finish, call Gemini
    busboy.on("finish", async () => {
      try {
        if (!fileBuffer) {
          res.status(400).json({ success: false, error: "No image uploaded" });
          return resolve();
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          console.error("Missing GEMINI_API_KEY environment variable");
          res.status(500).json({ success: false, error: "Server configuration error" });
          return resolve();
        }

        const ai = new GoogleGenAI({ apiKey });
        const prompt = fields.prompt || "Analyze this image.";

        // Call Gemini 1.5 Flash (efficient for vision)
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: fileMimeType || "image/jpeg",
                    data: fileBuffer.toString("base64"),
                  },
                },
              ],
            },
          ],
        });

        const result = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!result) {
          throw new Error("No text result returned from Gemini");
        }

        res.status(200).json({ success: true, result });
        resolve();
      } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ success: false, error: error.message || "Analysis failed" });
        resolve();
      }
    });

    // Handle errors
    busboy.on("error", (error) => {
      console.error("Busboy Error:", error);
      res.status(500).json({ success: false, error: "Upload failed" });
      resolve();
    });

    // Pipe the request to busboy
    req.pipe(busboy);
  });
}
