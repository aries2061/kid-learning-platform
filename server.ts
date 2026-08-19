import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { put, del } from '@vercel/blob';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parser for general API requests
  app.use(express.json({ limit: '50mb' }));

  // API Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasSupabaseConfig: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
      hasVercelBlobConfig: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    });
  });

  // Vercel Blob Upload API
  app.post('/api/blob/upload', express.raw({ type: '*/*', limit: '100mb' }), async (req, res) => {
    try {
      const filename = decodeURIComponent((req.headers['x-filename'] as string) || `upload-${Date.now()}`);
      const contentType = req.headers['content-type'] || 'application/octet-stream';
      const token = process.env.BLOB_READ_WRITE_TOKEN;

      if (!token) {
        // If Vercel Blob token is not configured, inform client to use local Blob storage
        return res.status(200).json({
          url: '',
          message: 'BLOB_READ_WRITE_TOKEN not set; fallback to local storage.',
        });
      }

      const blob = await put(filename, req.body, {
        access: 'public',
        contentType,
        token,
      });

      return res.json({
        url: blob.url,
        pathname: blob.pathname,
        contentType: blob.contentType,
      });
    } catch (error: any) {
      console.error('Error uploading to Vercel Blob:', error);
      return res.status(500).json({ error: error.message || 'Blob upload failed' });
    }
  });

  // Vercel Blob Delete API
  app.post('/api/blob/delete', async (req, res) => {
    try {
      const { url } = req.body;
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (url && token && !url.startsWith('blob:')) {
        await del(url, { token });
      }
      return res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting from Vercel Blob:', error);
      return res.status(500).json({ error: error.message || 'Blob deletion failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Phonics Quest Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
