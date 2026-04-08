import swaggerJsdoc from 'swagger-jsdoc';

const port = process.env.PORT ?? '3000';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property Search API',
      version: '1.0.0',
      description:
        'A production-quality REST API for natural language property search using Anthropic Claude for NLP query parsing.',
    },
    components: {
      schemas: {
        Property: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },      
            site_type: { type: 'string' },
            acres: { type: 'number' },
            region: { type: 'string' },
            price: { type: 'integer', description: 'Price in pence' },
            description: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        SearchRequest: {
          type: 'object',
          required: ['query'],
          properties: {
            query: {
              type: 'string',
              minLength: 3,
              maxLength: 500,
            },
          },
        },
        SearchResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            query: { type: 'string' },
            parsed_criteria: {
              type: 'object',
              properties: {
                site_type: { type: 'string', nullable: true },
                min_acres: { type: 'number', nullable: true },
                max_acres: { type: 'number', nullable: true },
                region: { type: 'string', nullable: true },
                max_price: { type: 'integer', nullable: true },
                min_price: { type: 'integer', nullable: true },
              },
            },
            count: { type: 'integer' },
            results: { type: 'array', items: { $ref: '#/components/schemas/Property' } },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
