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
