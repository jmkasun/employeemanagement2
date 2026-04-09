import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`Vercel Function: ${req.method} ${req.url}`);
  try {
    // Dynamic import to catch startup/module-load errors
    const serverModule = await import('../server.js');
    const app = serverModule.default;
    
    // Handle the request
    return app(req, res);
  } catch (error: any) {
    console.error('Vercel Entry Error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred during startup',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}
