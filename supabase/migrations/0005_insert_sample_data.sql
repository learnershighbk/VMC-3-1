-- Migration: Insert sample data
-- Description: Add sample places and reviews for testing
-- Author: Claude
-- Date: 2025-10-23

BEGIN;

-- Insert sample places (서울 맛집)
INSERT INTO places (naver_place_id, name, address, latitude, longitude) VALUES
  ('place001', '강남 맛집', '서울특별시 강남구 역삼동', 37.5012, 127.0396),
  ('place002', '홍대 카페', '서울특별시 마포구 홍익로', 37.5563, 126.9234),
  ('place003', '이태원 레스토랑', '서울특별시 용산구 이태원동', 37.5345, 126.9949)
ON CONFLICT (naver_place_id) DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (place_id, title, content)
SELECT
  p.id,
  '정말 맛있어요!',
  '분위기도 좋고 음식도 정말 맛있습니다. 다음에 또 방문하고 싶어요.'
FROM places p
WHERE p.naver_place_id = 'place001'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (place_id, title, content)
SELECT
  p.id,
  '커피가 진짜 좋아요',
  '홍대 근처에서 최고의 카페입니다. 조용하고 분위기가 아늑해요.'
FROM places p
WHERE p.naver_place_id = 'place002'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (place_id, title, content)
SELECT
  p.id,
  '이국적인 분위기',
  '이태원답게 이국적인 분위기가 좋습니다. 가격은 조금 있지만 만족스러워요.'
FROM places p
WHERE p.naver_place_id = 'place003'
ON CONFLICT DO NOTHING;

INSERT INTO reviews (place_id, title, content)
SELECT
  p.id,
  '재방문 의사 100%',
  '정말 훌륭한 식사였습니다. 가족들과 함께 다시 방문하고 싶네요.'
FROM places p
WHERE p.naver_place_id = 'place001'
ON CONFLICT DO NOTHING;

COMMIT;
