-- Добавление полей для конфигурации глухих стен
ALTER TABLE glass_packages 
ADD COLUMN IF NOT EXISTS has_left_wall BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_right_wall BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_back_wall BOOLEAN DEFAULT false;

-- Обновляем существующие записи
UPDATE glass_packages 
SET 
  has_left_wall = false,
  has_right_wall = false,
  has_back_wall = false
WHERE has_left_wall IS NULL;

-- Добавляем комментарии
COMMENT ON COLUMN glass_packages.has_left_wall IS 'Левая боковая стена закрыта обычной стеной (без стекла)';
COMMENT ON COLUMN glass_packages.has_right_wall IS 'Правая боковая стена закрыта обычной стеной (без стекла)';
COMMENT ON COLUMN glass_packages.has_back_wall IS 'Задняя стена закрыта обычной стеной (без стекла)';
