-- Migration: Add category column to places table
-- Description: Add category field to store restaurant category information (e.g., "한식>순대,순댓국")
-- Author: Claude
-- Date: 2025-10-26

BEGIN;

-- Add category column to places table
ALTER TABLE places
ADD COLUMN IF NOT EXISTS category TEXT;

COMMIT;
