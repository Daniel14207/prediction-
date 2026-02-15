
import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  // 1. Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // 2. Security Check: Ensure API Key is set
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error("Error: GEMINI_API_KEY is missing in environment variables.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server configuration error. API Key missing." }),
    };
  }

  try {
    // 3. Parse Incoming Data
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing request body" }) };
    }

    const body = JSON.parse(event.body);
    const { image, prompt } = body;

    if (!image) {
      return { statusCode: 400, body: JSON.stringify({ error: "No image data provided" }) };
    }

    // 4. Construct Gemini API URL (Using gemini-1.5-flash as requested)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    // 5. Construct Request Payload
    const payload = {
      contents: [
        {
          parts: [
            { text: prompt || "Analyze this image." },
            {
              inline_data: {
                mime_type: "image/png", // Assuming PNG based on frontend FileReader logic, or pass mimeType from frontend
                data: image, // Base64 string without prefix
              },
            },
          ],
        },
      ],
    };

    // 6. Call Google Gemini API via REST
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // 7. Handle Google API Errors
    if (!response.ok) {
      console.error("Gemini API Error:", JSON.stringify(data));
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || "Error from Gemini API" }),
      };
    }

    // 8. Extract Text Response
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResult) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "No text returned from Gemini." }),
      };
    }

    // 9. Return Success
    return {
      statusCode: 200,
      body: JSON.stringify({ result: textResult }),
    };

  } catch (error: any) {
    console.error("Function Execution Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal Server Error" }),
    };
  }
};
