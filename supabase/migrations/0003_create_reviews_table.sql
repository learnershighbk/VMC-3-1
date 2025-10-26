-- Migration: Create reviews table
-- Description: Create reviews table for storing user reviews
-- Author: Claude
-- Date: 2025-10-22

BEGIN;

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 50),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_place_id ON reviews(place_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Disable RLS (비로그인 시스템)
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

COMMIT;
