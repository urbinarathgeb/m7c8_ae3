import {Router} from 'express';
import {getAllInventory} from '../controllers/inventory.controller.js';

const router = Router();

router.get('/inventory', getAllInventory);

export default router;