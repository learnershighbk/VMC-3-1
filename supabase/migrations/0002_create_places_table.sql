-- Migration: Create places table
-- Description: Create places table for storing restaurant information from Naver Search API
-- Author: Claude
-- Date: 2025-10-22

BEGIN;

-- Create places table
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naver_place_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude NUMERIC(9, 6) NOT NULL CHECK (latitude BETWEEN 33 AND 43),
  longitude NUMERIC(9, 6) NOT NULL CHECK (longitude BETWEEN 124 AND 132),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_places_naver_id ON places(naver_place_id);
CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);

-- Disable RLS (비로그인 시스템)
ALTER TABLE places DISABLE ROW LEVEL SECURITY;

COMMIT;
