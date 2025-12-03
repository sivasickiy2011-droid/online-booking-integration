-- Добавление полей для размеров перегородки и настройки двери
ALTER TABLE t_p56372141_online_booking_integ.glass_packages 
ADD COLUMN IF NOT EXISTS has_door BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS default_partition_height INTEGER DEFAULT 1900,
ADD COLUMN IF NOT EXISTS default_partition_width INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS default_door_height INTEGER DEFAULT 1900,
ADD COLUMN IF NOT EXISTS default_door_width INTEGER DEFAULT 800,
ADD COLUMN IF NOT EXISTS sketch_svg TEXT;

-- Добавление полей в заказы
ALTER TABLE t_p56372141_online_booking_integ.glass_orders
ADD COLUMN IF NOT EXISTS partition_height INTEGER,
ADD COLUMN IF NOT EXISTS partition_width INTEGER,
ADD COLUMN IF NOT EXISTS door_height INTEGER,
ADD COLUMN IF NOT EXISTS door_width INTEGER,
ADD COLUMN IF NOT EXISTS has_door BOOLEAN DEFAULT false;

COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.has_door IS 'Флаг: комплект включает дверь';
COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.default_partition_height IS 'Высота перегородки по умолчанию (мм)';
COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.default_partition_width IS 'Ширина перегородки по умолчанию (мм)';
COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.default_door_height IS 'Высота двери по умолчанию (мм)';
COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.default_door_width IS 'Ширина двери по умолчанию (мм)';
COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.sketch_svg IS 'SVG-схема перегородки';
