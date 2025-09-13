import { Router } from 'express';
import { GoalController } from '../controllers/GoalController';
import auth from '../middleware/auth';

const router = Router();
const goalController = new GoalController();

router.use(auth);

router.post('/', goalController.create);
router.get('/', goalController.getAll);
router.get('/:id', goalController.getById);
router.put('/:id', goalController.update);
router.delete('/:id', goalController.delete);
router.post('/:id/progress', goalController.addProgress);

export default router;