import {Router} from 'express';
import {
	getAllInventory,
	getInventoryById,
	createInventory,
	updateInventory,
	deleteInventory,
	getStock
} from '../controllers/inventory.controller.js';

const router = Router();

router.get('/inventory', getAllInventory);
router.get('/inventory/:id', getInventoryById);
router.post('/inventory', createInventory);
router.put('/inventory/:id', updateInventory);
router.delete('/inventory/:id', deleteInventory);
router.get('/stock', getStock);

export default router;
