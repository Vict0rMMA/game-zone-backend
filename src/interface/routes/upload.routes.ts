import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import supabase from '../../infrastructure/database/supabaseClient';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', authenticate, requireRole('ADMIN'), upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) { res.status(400).json({ message: 'No se envió ningún archivo' }); return; }

    const ext = req.file.mimetype.split('/')[1].replace('jpeg', 'jpg');
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(filename, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

    if (error) { res.status(500).json({ message: error.message }); return; }

    const { data } = supabase.storage.from('product-images').getPublicUrl(filename);
    res.status(201).json({ url: data.publicUrl });
  } catch {
    res.status(500).json({ message: 'Error al subir la imagen' });
  }
});

export default router;
