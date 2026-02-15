import fetch from "node-fetch";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { base64, mimeType, prompt } = JSON.parse(event.body);
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return { statusCode: 500, body: JSON.stringify({ error: "Missing API Key" }) };
    }

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt || "Analyse this image" },
              { inline_data: { mime_type: mimeType || "image/png", data: base64 }}
            ]
          }]
        })
      }
    );

    const data = await r.json();
    
    // Extract text for easier frontend consumption, but return full data as well
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return { 
      statusCode: 200, 
      body: JSON.stringify({ ...data, result: text }) 
    };

  } catch(e) {
    console.error("Analysis Error:", e);
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};