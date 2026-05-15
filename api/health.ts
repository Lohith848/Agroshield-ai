import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const fs = require('fs');
  const path = require('path');
  const distPath = path.resolve(process.cwd(), "dist");
  const exists = fs.existsSync(distPath);
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    distPath,
    distExists: exists 
  });
}