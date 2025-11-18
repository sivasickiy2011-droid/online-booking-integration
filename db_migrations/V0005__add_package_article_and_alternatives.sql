ALTER TABLE t_p56372141_online_booking_integ.glass_packages 
ADD COLUMN IF NOT EXISTS package_article VARCHAR(100);

CREATE TABLE IF NOT EXISTS t_p56372141_online_booking_integ.component_alternatives (
    id SERIAL PRIMARY KEY,
    component_id INTEGER NOT NULL REFERENCES t_p56372141_online_booking_integ.glass_components(component_id),
    alternative_component_id INTEGER NOT NULL REFERENCES t_p56372141_online_booking_integ.glass_components(component_id),
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_component_alternatives_component ON t_p56372141_online_booking_integ.component_alternatives(component_id);

COMMENT ON TABLE t_p56372141_online_booking_integ.component_alternatives IS 'Аналоги компонентов для замены';
COMMENT ON COLUMN t_p56372141_online_booking_integ.glass_packages.package_article IS 'Артикул комплекта изделия';