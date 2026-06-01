import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', requireRole('ADMIN'), CategoryController.create);
router.put('/:id', requireRole('ADMIN'), CategoryController.update);
router.delete('/:id', requireRole('ADMIN'), CategoryController.delete);

export default router;
