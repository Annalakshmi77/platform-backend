import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { store } from '../data/store.js';
import { AppError } from '../middlewares/errorHandler.js';
import { AdditionalCharge } from '../types/index.js';
import { createLogger } from '../utils/logger.js';
import { toAppError } from '../utils/error.util.js';
import { ok } from '../utils/response.util.js';

const log = createLogger('ChargeController');

export const createChargeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Charge / Add-on name is required'),
    price: z.number().min(0, 'Price must be a non-negative number'),
    description: z.string().optional().default(''),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateChargeSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    price: z.number().min(0).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const slug = (text: string): string =>
  String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);

export const getAdditionalCharges = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const charges = await store.getAdditionalCharges();
    res.status(200).json(ok(charges));
  } catch (error) {
    next(toAppError(error, 'Could not load additional charges', log));
  }
};

export const getAdditionalChargeById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const charge = await store.getAdditionalChargeById(req.params.id);
    if (!charge) throw new AppError('Additional charge not found', 404);
    res.status(200).json(ok(charge));
  } catch (error) {
    next(toAppError(error, `Could not load additional charge ${req.params.id}`, log));
  }
};

export const createAdditionalCharge = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body;
    const baseId = slug(body.name) || `charge-${Date.now()}`;
    let id = baseId;
    let counter = 1;
    while (await store.getAdditionalChargeById(id)) {
      id = `${baseId}-${counter++}`;
    }

    const now = new Date().toISOString();
    const newCharge: AdditionalCharge = {
      id,
      name: body.name.trim(),
      price: body.price,
      description: body.description?.trim() || '',
      isActive: body.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    const created = await store.createAdditionalCharge(newCharge);
    log.log(`Created additional charge ${created.id} (${created.name}) at ₹${created.price}`);
    res.status(201).json(ok(created, 'Additional charge created successfully'));
  } catch (error) {
    next(toAppError(error, 'Could not create additional charge', log));
  }
};

export const updateAdditionalCharge = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await store.getAdditionalChargeById(id);
    if (!existing) throw new AppError('Additional charge not found', 404);

    const updated = await store.updateAdditionalCharge(id, req.body);
    log.log(`Updated additional charge ${id}`, req.body);
    res.status(200).json(ok(updated, 'Additional charge updated successfully'));
  } catch (error) {
    next(toAppError(error, `Could not update additional charge ${req.params.id}`, log));
  }
};

export const deleteAdditionalCharge = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const success = await store.deleteAdditionalCharge(req.params.id);
    if (!success) throw new AppError('Additional charge not found', 404);
    log.log(`Deleted additional charge ${req.params.id}`);
    res.status(200).json(ok({ id: req.params.id }, 'Additional charge deleted successfully'));
  } catch (error) {
    next(toAppError(error, `Could not delete additional charge ${req.params.id}`, log));
  }
};
