import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

/**
 * Route Handlers pour Next.js App Router (Vercel compatible)
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename') || 'user-avatar.jpg';

    // Validation basique
    if (!request.body) {
      return NextResponse.json({ error: "Aucun corps de requête détecté" }, { status: 400 });
    }

    // Le 'put' de @vercel/blob gère automatiquement les flux (streams) sur Vercel
    const blob = await put(filename, request.body, {
      access: 'public',
      contentType: request.headers.get('content-type') || 'image/jpeg',
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Vercel Blob Upload Error:", error);
    return NextResponse.json(
      { error: "Échec du stockage Cloud : " + error.message }, 
      { status: 500 }
    );
  }
}