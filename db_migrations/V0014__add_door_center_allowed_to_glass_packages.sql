-- Добавляем поле door_center_allowed для контроля возможности центрирования двери
ALTER TABLE t_p56372141_online_booking_integ.glass_packages 
ADD COLUMN door_center_allowed BOOLEAN DEFAULT true;

COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.door_center_allowed 
IS 'Можно ли располагать дверь по центру (false для дверей на стене)';