ALTER TABLE t_p56372141_online_booking_integ.glass_packages 
ADD COLUMN IF NOT EXISTS sketch_image_url TEXT;

COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.sketch_image_url IS 'URL изображения эскиза изделия';