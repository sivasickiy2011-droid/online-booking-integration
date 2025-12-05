-- Добавляем поля для дефолтных параметров двери в комплектах

ALTER TABLE t_p56372141_online_booking_integ.glass_packages
ADD COLUMN IF NOT EXISTS default_door_position VARCHAR(10) DEFAULT 'center',
ADD COLUMN IF NOT EXISTS default_door_offset VARCHAR(10) DEFAULT '0',
ADD COLUMN IF NOT EXISTS default_door_panels INTEGER DEFAULT 1;

-- Обновляем существующие комплекты с дверью, устанавливая дефолтные значения
UPDATE t_p56372141_online_booking_integ.glass_packages
SET 
  default_door_position = 'center',
  default_door_offset = '0',
  default_door_panels = 1
WHERE has_door = true;

COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.default_door_position IS 'Позиция двери по умолчанию: left, center, right';
COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.default_door_offset IS 'Отступ двери от края по умолчанию (в мм)';
COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.default_door_panels IS 'Количество створок двери по умолчанию: 1 или 2';
