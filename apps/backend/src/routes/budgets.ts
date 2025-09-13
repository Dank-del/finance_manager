import { Router } from 'express';
import { BudgetController } from '../controllers/BudgetController';
import auth from '../middleware/auth';

const router = Router();
const budgetController = new BudgetController();

router.use(auth);

router.post('/', budgetController.create);
router.get('/', budgetController.getAll);
router.get('/:id', budgetController.getById);
router.put('/:id', budgetController.update);
router.delete('/:id', budgetController.delete);

export default router;