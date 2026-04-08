import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { swaggerSpec } from './config/swagger';
import propertyRoutes from './routes/property.routes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { logger } from './utils/logger';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger spec (JSON)
app.get('/api-docs/swagger.json', (_req, res) => {
  res.json(swaggerSpec);
});

// Swagger UI — loads assets from CDN (required for Vercel serverless)
app.get('/api-docs', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html>
  <head>
    <title>Property Search API – Docs</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        SwaggerUIBundle({
          url: '/api-docs/swagger.json',
          dom_id: '#swagger-ui',
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout'
        });
      };
    </script>
  </body>
</html>`);
});

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
