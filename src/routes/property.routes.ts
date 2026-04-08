import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middlewares/validate';
import {
  searchPropertiesHandler,
  listPropertiesHandler,
  getPropertyByIdHandler,
  healthCheckHandler,
} from '../controllers/property.controller';

const router = Router();

const SearchRequestSchema = z.object({
  query: z.string().min(3, 'Query must be at least 3 characters').max(500, 'Query must be at most 500 characters'),
});

// POST /api/v1/properties/search — must come before /:id to avoid route conflict
router.post('/properties/search', validate(SearchRequestSchema), searchPropertiesHandler);

// GET /api/v1/properties
router.get('/properties', listPropertiesHandler);

// GET /api/v1/properties/:id
router.get('/properties/:id', getPropertyByIdHandler);

// GET /api/v1/health
router.get('/health', healthCheckHandler);

export default router;
