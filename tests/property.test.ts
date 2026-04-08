import request from 'supertest';
import app from '../src/app';

// Mock the database pool so tests don't require a live PostgreSQL instance
jest.mock('../src/config/database', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    on: jest.fn(),
  },
  checkDatabaseConnection: jest.fn().mockResolvedValue(true),
}));

// Mock the LLM service so tests run without an Anthropic API key
jest.mock('../src/services/llm.service', () => ({
  parseSearchQuery: jest.fn().mockResolvedValue({
    site_type: 'brownfield',
    min_acres: 5,
    max_acres: null,
    region: 'Midlands',
    max_price: 200000000,
    min_price: null,
  }),
}));

import { pool } from '../src/config/database';

const mockPool = pool as jest.Mocked<typeof pool>;

const sampleProperty = {
  id: 1,
  title: 'Prime Brownfield Site',
  site_type: 'brownfield',
  acres: '12.50',
  region: 'Midlands',
  price: 150000000,
  description: 'Test description',
  created_at: new Date().toISOString(),
};

describe('GET /api/v1/health', () => {
  it('should return status ok with database info', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('database');
  });
});

describe('GET /api/v1/properties', () => {
  beforeEach(() => {
    (mockPool.query as jest.Mock).mockResolvedValue({ rows: [sampleProperty] });
  });

  it('should return a list of properties', async () => {
    const res = await request(app).get('/api/v1/properties');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.results)).toBe(true);
    expect(res.body).toHaveProperty('count');
  });

  it('should accept filter query params', async () => {
    const res = await request(app)
      .get('/api/v1/properties')
      .query({ site_type: 'brownfield', region: 'Midlands' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/v1/properties/:id', () => {
  it('should return a single property', async () => {
    (mockPool.query as jest.Mock).mockResolvedValue({ rows: [sampleProperty] });
    const res = await request(app).get('/api/v1/properties/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result.id).toBe(1);
  });

  it('should return 404 for non-existent property', async () => {
    (mockPool.query as jest.Mock).mockResolvedValue({ rows: [] });
    const res = await request(app).get('/api/v1/properties/9999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid ID', async () => {
    const res = await request(app).get('/api/v1/properties/not-a-number');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/properties/search', () => {
  beforeEach(() => {
    (mockPool.query as jest.Mock).mockResolvedValue({ rows: [sampleProperty] });
  });

  it('should search properties with a natural language query', async () => {
    const res = await request(app)
      .post('/api/v1/properties/search')
      .send({ query: 'brownfield sites over 5 acres in the Midlands under £2m' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('parsed_criteria');
    expect(res.body).toHaveProperty('count');
    expect(res.body).toHaveProperty('results');
  });

  it('should return 400 when query is too short', async () => {
    const res = await request(app)
      .post('/api/v1/properties/search')
      .send({ query: 'ab' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when query is missing', async () => {
    const res = await request(app)
      .post('/api/v1/properties/search')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('404 handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
