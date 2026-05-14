import {Router} from 'express';
import {
	getAllStackConfigs,
	getStackConfigById,
	createStackConfig,
	updateStackConfig,
	deleteStackConfig
} from '../controllers/stackConfigs.controller.js';

const router = Router();

router.get('/stack-configs', getAllStackConfigs);
router.get('/stack-configs/:id', getStackConfigById);
router.post('/stack-configs', createStackConfig);
router.put('/stack-configs/:id', updateStackConfig);
router.delete('/stack-configs/:id', deleteStackConfig);

export default router;
