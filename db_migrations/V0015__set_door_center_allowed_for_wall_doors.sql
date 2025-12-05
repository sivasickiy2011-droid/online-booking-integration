-- Для дверей на стене (left/right) запрещаем центрирование
UPDATE t_p56372141_online_booking_integ.glass_packages 
SET door_center_allowed = false 
WHERE default_door_position IN ('left', 'right');