import Busboy from "busboy";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ secure: true });

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  return new Promise((resolve, reject) => {
    const bb = Busboy({ headers: event.headers });
    let buf = null;
    let mime = "";

    bb.on("file", (_, file, info) => {
      mime = info.mimeType;
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(mime)) {
        resolve({ statusCode: 400, body: JSON.stringify({ error: "Invalid file type" }) });
        return;
      }

      const chunks = [];
      file.on("data", d => chunks.push(d));
      file.on("end", () => buf = Buffer.concat(chunks));
    });

    bb.on("finish", async () => {
      if (!buf) {
        resolve({ statusCode: 400, body: JSON.stringify({ error: "No file uploaded" }) });
        return;
      }

      const stream = cloudinary.uploader.upload_stream(
        { folder: "vickall_uploads" },
        (err, res) => {
          if (err) {
            console.error("Cloudinary Error:", err);
            resolve({ statusCode: 500, body: JSON.stringify({ error: "Upload failed" }) });
          } else {
            resolve({
              statusCode: 200,
              body: JSON.stringify({ url: res.secure_url })
            });
          }
        }
      );

      stream.end(buf);
    });

    // Netlify functions might encode body as base64
    const body = event.isBase64Encoded ? Buffer.from(event.body, "base64") : Buffer.from(event.body);
    bb.end(body);
  });
};