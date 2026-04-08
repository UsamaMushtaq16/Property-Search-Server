import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import propertyRoutes from './routes/property.routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base route — confirms the server is alive
app.get('/', (_req, res) => {
  const PORT = process.env.PORT ?? '3000';
  res.json({
    success: true,
    message: `Property Search API is running on port ${PORT}`,
    version: '1.0.0',
    environment: process.env.NODE_ENV ?? 'development',
    endpoints: {
      docs:   '/api-docs',
      health: '/api/v1/health',
      search: 'POST /api/v1/properties/search',
      list:   'GET  /api/v1/properties',
      byId:   'GET  /api/v1/properties/:id',
    },
  });
});

// API routes
app.use('/api/v1', propertyRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler — must be last
app.use(errorHandler);

// Only listen when run directly (not imported in tests)
if (require.main === module) {
  const PORT = parseInt(process.env.PORT ?? '3000', 10);
  app.listen(PORT, () => {
    logger.info(`Property Search API running on http://localhost:${PORT}`);
    logger.info(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  });
}

export default app;
