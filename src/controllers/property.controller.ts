import { Request, Response, NextFunction } from 'express';
import { checkDatabaseConnection } from '../config/database';
import { parseSearchQuery } from '../services/llm.service';
import { searchProperties, getAllProperties, getPropertyById } from '../services/property.service';
import { PropertyFilters } from '../types';

/**
 * @swagger
 * /api/v1/properties/search:
 *   post:
 *     summary: Natural language property search
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchRequest'
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function searchPropertiesHandler(
  req: Request<object, object, { query: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { query } = req.body;
    const criteria = await parseSearchQuery(query);
    const results = await searchProperties(criteria);
    res.json({ success: true, query, parsed_criteria: criteria, count: results.length, results });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     summary: List all properties with optional filters
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: site_type
 *         schema: { type: string }
 *       - in: query
 *         name: region
 *         schema: { type: string }
 *       - in: query
 *         name: min_acres
 *         schema: { type: number }
 *       - in: query
 *         name: max_acres
 *         schema: { type: number }
 *       - in: query
 *         name: min_price
 *         schema: { type: integer }
 *       - in: query
 *         name: max_price
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: integer }
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 */
export async function listPropertiesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const filters: PropertyFilters = {};
    const q = req.query;

    if (typeof q.site_type === 'string') filters.site_type = q.site_type;
    if (typeof q.region === 'string') filters.region = q.region;
    if (typeof q.min_acres === 'string') filters.min_acres = parseFloat(q.min_acres);
    if (typeof q.max_acres === 'string') filters.max_acres = parseFloat(q.max_acres);
    if (typeof q.min_price === 'string') filters.min_price = parseInt(q.min_price, 10);
    if (typeof q.max_price === 'string') filters.max_price = parseInt(q.max_price, 10);

    const results = await getAllProperties(filters);
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   get:
 *     summary: Get a property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: A single property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export async function getPropertyByIdHandler(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid property ID' });
      return;
    }
    const property = await getPropertyById(id);
    if (!property) {
      res.status(404).json({ success: false, error: `Property with ID ${id} not found` });
      return;
    }
    res.json({ success: true, result: property });
  } catch (err) {
    next(err);
  }
}

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 timestamp: { type: string, format: date-time }
 *                 database: { type: string, enum: [connected, disconnected] }
 */
export async function healthCheckHandler(_req: Request, res: Response): Promise<void> {
  const dbConnected = await checkDatabaseConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
  });
}
