import { Router } from 'express';
import { TransactionController } from '../controllers/TransactionController';
import auth from '../middleware/auth';

const router = Router();
const transactionController = new TransactionController();

router.use(auth);

router.post('/', transactionController.create);
router.get('/', transactionController.getAll);
router.get('/stats', transactionController.getStats);
router.get('/:id', transactionController.getById);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.delete);

export default router;