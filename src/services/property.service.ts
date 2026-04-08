import { pool } from '../config/database';
import { Property, SearchCriteria, PropertyFilters } from '../types';

export async function searchProperties(criteria: SearchCriteria): Promise<Property[]> {
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let idx = 1;

  if (criteria.site_type !== null) {
    conditions.push(`site_type = $${idx++}`);
    values.push(criteria.site_type);
  }
  if (criteria.region !== null) {
    conditions.push(`LOWER(region) = LOWER($${idx++})`);
    values.push(criteria.region);
  }
  if (criteria.min_acres !== null) {
    conditions.push(`acres >= $${idx++}`);
    values.push(criteria.min_acres);
  }
  if (criteria.max_acres !== null) {
    conditions.push(`acres <= $${idx++}`);
    values.push(criteria.max_acres);
  }
  if (criteria.min_price !== null) {
    conditions.push(`price >= $${idx++}`);
    values.push(criteria.min_price);
  }
  if (criteria.max_price !== null) {
    conditions.push(`price <= $${idx++}`);
    values.push(criteria.max_price);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM properties ${whereClause} ORDER BY created_at DESC`;

  const result = await pool.query<Property>(sql, values);
  return result.rows;
}

export async function getAllProperties(filters: PropertyFilters): Promise<Property[]> {
  const conditions: string[] = [];
  const values: (string | number)[] = [];
  let idx = 1;

  if (filters.site_type !== undefined) {
    conditions.push(`site_type = $${idx++}`);
    values.push(filters.site_type);
  }
  if (filters.region !== undefined) {
    conditions.push(`LOWER(region) = LOWER($${idx++})`);
    values.push(filters.region);
  }
  if (filters.min_acres !== undefined) {
    conditions.push(`acres >= $${idx++}`);
    values.push(filters.min_acres);
  }
  if (filters.max_acres !== undefined) {
    conditions.push(`acres <= $${idx++}`);
    values.push(filters.max_acres);
  }
  if (filters.min_price !== undefined) {
    conditions.push(`price >= $${idx++}`);
    values.push(filters.min_price);
  }
  if (filters.max_price !== undefined) {
    conditions.push(`price <= $${idx++}`);
    values.push(filters.max_price);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM properties ${whereClause} ORDER BY price ASC`;

  const result = await pool.query<Property>(sql, values);
  return result.rows;
}

export async function getPropertyById(id: number): Promise<Property | null> {
  const result = await pool.query<Property>('SELECT * FROM properties WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}
