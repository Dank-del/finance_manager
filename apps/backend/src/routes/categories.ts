import { Router, type RequestHandler } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import auth from '../middleware/auth';

const router = Router();
const categoryController = new CategoryController();

// All category routes require authentication
router.use(auth);

// Order matters: more specific routes before parameterized :id
router.get('/stats', categoryController.getUsageStats as RequestHandler);
router.get('/type/:type', categoryController.getByType as RequestHandler);
router.get('/:id', categoryController.getById as RequestHandler);
router.get('/', categoryController.getAll as RequestHandler);
router.post('/', categoryController.create as RequestHandler);
router.put('/:id', categoryController.update as RequestHandler);
router.delete('/:id', categoryController.delete as RequestHandler);

export default router;
