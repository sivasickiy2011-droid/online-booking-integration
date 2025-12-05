-- Добавление поля количества стеклянных секций в комплект
ALTER TABLE glass_packages 
ADD COLUMN IF NOT EXISTS glass_sections_count INTEGER DEFAULT 1;

-- Обновляем существующие записи
UPDATE glass_packages 
SET glass_sections_count = 1 
WHERE glass_sections_count IS NULL;

-- Добавляем комментарий
COMMENT ON COLUMN glass_packages.glass_sections_count IS 'Количество стеклянных секций (лицевая сторона): 1, 2, 3 или 4';
