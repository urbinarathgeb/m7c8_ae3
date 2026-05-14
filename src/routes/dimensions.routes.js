import {Router} from 'express';
import {
	getAllDimensions,
	getDimensionById,
	createDimension,
	updateDimension,
	deleteDimension
} from '../controllers/dimensions.controller.js';

const router = Router();

router.get('/dimensions', getAllDimensions);
router.get('/dimensions/:id', getDimensionById);
router.post('/dimensions', createDimension);
router.put('/dimensions/:id', updateDimension);
router.delete('/dimensions/:id', deleteDimension);

export default router;
