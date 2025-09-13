import { Router } from 'express';
import { UserPreferenceController } from '../controllers/UserPreferenceController';
import auth from '../middleware/auth';

const router = Router();
const preferenceController = new UserPreferenceController();

router.get('/', auth, preferenceController.getPreferences);
router.put('/', auth, preferenceController.updatePreferences);

export default router;