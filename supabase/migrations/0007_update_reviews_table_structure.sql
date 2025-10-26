-- Migration: Update reviews table structure
-- Description: Remove title, add author_name, rating, and password fields
-- Author: Claude
-- Date: 2025-10-26

BEGIN;

-- Remove title column if exists
ALTER TABLE reviews
DROP COLUMN IF EXISTS title;

-- Add author_name column (임시로 nullable, 기본값 '익명')
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS author_name TEXT;

-- 기존 데이터에 기본값 설정
UPDATE reviews
SET author_name = '익명'
WHERE author_name IS NULL;

-- NOT NULL 제약조건 추가
ALTER TABLE reviews
ALTER COLUMN author_name SET NOT NULL;

-- CHECK 제약조건 추가
ALTER TABLE reviews
ADD CONSTRAINT reviews_author_name_check
CHECK (char_length(author_name) BETWEEN 1 AND 20);

-- Add rating column (기본값 5)
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS rating INTEGER;

-- 기존 데이터에 기본값 설정
UPDATE reviews
SET rating = 5
WHERE rating IS NULL;

-- NOT NULL 제약조건 추가
ALTER TABLE reviews
ALTER COLUMN rating SET NOT NULL;

-- CHECK 제약조건 추가
ALTER TABLE reviews
ADD CONSTRAINT reviews_rating_check
CHECK (rating BETWEEN 1 AND 5);

-- Add password column (기본값 '0000')
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS password TEXT;

-- 기존 데이터에 기본값 설정
UPDATE reviews
SET password = '0000'
WHERE password IS NULL;

-- NOT NULL 제약조건 추가
ALTER TABLE reviews
ALTER COLUMN password SET NOT NULL;

-- CHECK 제약조건 추가
ALTER TABLE reviews
ADD CONSTRAINT reviews_password_check
CHECK (password ~ '^\d{4}$');

-- Update content constraint to minimum 10 characters
-- 기존 데이터 중 10자 미만인 것들을 먼저 업데이트
UPDATE reviews
SET content = RPAD(content, 10, ' ')
WHERE char_length(content) < 10;

ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_content_check;

ALTER TABLE reviews
ADD CONSTRAINT reviews_content_check
CHECK (char_length(content) BETWEEN 10 AND 500);

COMMIT;
