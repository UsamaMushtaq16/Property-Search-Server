CREATE TABLE IF NOT EXISTS properties (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  site_type   VARCHAR(100) NOT NULL,
  acres       DECIMAL(10, 2) NOT NULL,
  region      VARCHAR(100) NOT NULL,
  price       INTEGER NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);
