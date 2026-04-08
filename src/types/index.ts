export interface Property {
  id: number;
  title: string;
  site_type: string;
  acres: number;
  region: string;
  price: number;
  description: string | null;
  created_at: Date;
}

export interface SearchCriteria {
  site_type: string | null;
  min_acres: number | null;
  max_acres: number | null;
  region: string | null;
  max_price: number | null;
  min_price: number | null;
}

export interface SearchResponse {
  success: true;
  query: string;
  parsed_criteria: SearchCriteria;
  count: number;
  results: Property[];
}

export interface ErrorResponse {
  success: false;
  error: string;
  stack?: string;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  database: 'connected' | 'disconnected';
}

export interface PropertyFilters {
  site_type?: string;
  region?: string;
  min_acres?: number;
  max_acres?: number;
  min_price?: number;
  max_price?: number;
}
