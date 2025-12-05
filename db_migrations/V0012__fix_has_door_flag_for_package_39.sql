-- Исправляем флаг has_door для комплекта с дверью

UPDATE t_p56372141_online_booking_integ.glass_packages
SET has_door = true
WHERE package_id = 39;
