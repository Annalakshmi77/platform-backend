import { Router } from 'express';
import {
  getAdditionalCharges,
  getAdditionalChargeById,
  createAdditionalCharge,
  updateAdditionalCharge,
  deleteAdditionalCharge,
  createChargeSchema,
  updateChargeSchema,
} from '../controllers/charge.controller.js';
import { validateRequest } from '../middlewares/validate.js';
import { requireRoles } from '../middlewares/auth.js';

const router = Router();

router.get('/', getAdditionalCharges);
router.get('/:id', getAdditionalChargeById);

router.post(
  '/',
  requireRoles('Admin', 'Editor'),
  validateRequest(createChargeSchema),
  createAdditionalCharge
);
router.put(
  '/:id',
  requireRoles('Admin', 'Editor'),
  validateRequest(updateChargeSchema),
  updateAdditionalCharge
);
router.patch(
  '/:id',
  requireRoles('Admin', 'Editor'),
  validateRequest(updateChargeSchema),
  updateAdditionalCharge
);
router.delete('/:id', requireRoles('Admin'), deleteAdditionalCharge);

export default router;
