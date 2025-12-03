-- Обновляем один комплект для демонстрации функционала с дверью
UPDATE t_p56372141_online_booking_integ.glass_packages 
SET has_door = true, 
    default_partition_height = 1900, 
    default_partition_width = 2000, 
    default_door_height = 1900, 
    default_door_width = 800
WHERE package_id = 38;
