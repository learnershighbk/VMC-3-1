-- Migration: Create updated_at trigger function
-- Description: Auto-update updated_at column for all tables
-- Author: Claude
-- Date: 2025-10-22

BEGIN;

-- Create trigger function (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_places_updated_at ON places;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;

-- Apply trigger to places table
CREATE TRIGGER update_places_updated_at
BEFORE UPDATE ON places
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to reviews table
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

COMMIT;
