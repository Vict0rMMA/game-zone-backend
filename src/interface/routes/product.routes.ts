import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', requireRole('ADMIN'), ProductController.create);
router.put('/:id', requireRole('ADMIN'), ProductController.update);
router.delete('/:id', requireRole('ADMIN'), ProductController.delete);

export default router;
