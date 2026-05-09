import {Router} from 'express';
import {getAllDimensions} from '../controllers/dimensions.controller.js';

const router = Router();

router.get('/dimensions', getAllDimensions)

export default router;