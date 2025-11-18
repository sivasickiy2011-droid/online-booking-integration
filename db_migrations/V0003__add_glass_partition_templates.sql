-- Расширение структуры для поддержки детальных комплектов перегородок

-- Таблица компонентов фурнитуры
CREATE TABLE IF NOT EXISTS t_p56372141_online_booking_integ.glass_components (
    component_id SERIAL PRIMARY KEY,
    component_name VARCHAR(255) NOT NULL,
    component_type VARCHAR(100) NOT NULL, -- profile, tape, plug, hinge, closer, lock, handle, glass, service
    article VARCHAR(100),
    characteristics TEXT,
    unit VARCHAR(50) DEFAULT 'шт', -- погм, шт, м², услуга
    price_per_unit DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Связь комплектов с компонентами (многие ко многим)
CREATE TABLE IF NOT EXISTS t_p56372141_online_booking_integ.package_components (
    id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES t_p56372141_online_booking_integ.glass_packages(package_id) ON DELETE CASCADE,
    component_id INTEGER REFERENCES t_p56372141_online_booking_integ.glass_components(component_id) ON DELETE CASCADE,
    quantity DECIMAL(10, 2) DEFAULT 1,
    is_required BOOLEAN DEFAULT true
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_glass_components_type ON t_p56372141_online_booking_integ.glass_components(component_type);
CREATE INDEX IF NOT EXISTS idx_package_components_package ON t_p56372141_online_booking_integ.package_components(package_id);

-- Вставка компонентов из скриншота
INSERT INTO t_p56372141_online_booking_integ.glass_components (component_name, component_type, article, characteristics, unit, price_per_unit) VALUES
-- Профили
('Профиль к-т', 'profile', '6100-АД31 Т1', '40, 2-е крышки Серебро матовое', 'погм', 700.00),
-- Ленты
('Лента', 'tape', '4918F монт. двуст.', '[DT-4918-2006-4] основа вспен. акр. адгезив VHB, прозр., 6мм х 16,5м х 2мм', 'погм', 100.00),
-- Заглушки
('Заглушка', 'plug', 'FS G-z10', '40*30мм, СЕРАЯ', 'шт', 100.00),
-- Петли
('Петля', 'hinge', 'BO5214350', 'для маятниковой стеклянной двери 750-1000мм до 100 кг', 'шт', 13200.00),
('Петля', 'hinge', 'AX-12DD', 'Верхняя SSS', 'шт', 1100.00),
-- Оси
('Ось верхняя', 'axis', 'A-133', 'для верхней петли', 'шт', 600.00),
-- Замки
('Замок', 'lock', 'AX-150RD AX-515', 'угловой с ответной часть SSS', 'шт', 2300.00),
-- Ручки
('Ручка-рейлинг', 'handle', 'A-633', '25*450мм, SSS двухсторонняя', 'шт', 1700.00),
-- Стекло
('Стекло 10мм прозрачное', 'glass', '', 'закаленное (с естественным зеленоватым оттенком)', 'м²', 7300.00),
('две створки', 'glass_note', '', '', 'м²', 0.00),
-- Услуги
('Монтаж перегородка', 'service', '', 'несколько монтажников', 'м²', 3000.00),
('Доставка комплекта за МКАД', 'service', '', '', 'шт', 5600.00),
('Покраска фурнитуры', 'service', '', '', 'шт', 10000.00),
('Матирование', 'service', '', '', 'м²', 1500.00);

-- Создание шаблонного комплекта "Перегородка ЦЕЛЬНОСТЕКЛЯННАЯ"
INSERT INTO t_p56372141_online_booking_integ.glass_packages (
    package_name, 
    product_type, 
    glass_type, 
    glass_thickness, 
    glass_price_per_sqm, 
    hardware_set, 
    hardware_price, 
    markup_percent, 
    installation_price, 
    description,
    is_active
) VALUES (
    'Перегородка ЦЕЛЬНОСТЕКЛЯННАЯ (Дверь Маятниковая без Фрамуги)',
    'partition',
    'Прозрачное закаленное 10мм',
    10,
    7300.00,
    'Комплект с маятниковой дверью',
    0, -- будет рассчитано из компонентов
    0, -- без наценки, цены финальные
    3000.00,
    'Полный комплект: профили, петли, замок, ручка, доводчик встроенный. Дверь: Маятниковая без Фрамуги петля со встроенным доводчиком. Артикул: PCDM101',
    true
) RETURNING package_id;

-- Связываем комплект с компонентами (примерные количества для расчета)
-- Используем последний созданный package_id
WITH last_package AS (
    SELECT package_id FROM t_p56372141_online_booking_integ.glass_packages 
    WHERE package_name = 'Перегородка ЦЕЛЬНОСТЕКЛЯННАЯ (Дверь Маятниковая без Фрамуги)'
    ORDER BY created_at DESC LIMIT 1
)
INSERT INTO t_p56372141_online_booking_integ.package_components (package_id, component_id, quantity, is_required)
SELECT 
    (SELECT package_id FROM last_package),
    component_id,
    CASE 
        WHEN component_name = 'Профиль к-т' THEN 8.12
        WHEN component_name = 'Лента' AND article = '4918F монт. двуст.' THEN 12.24
        WHEN component_name = 'Заглушка' THEN 8.00
        WHEN component_name = 'Петля' AND article = 'BO5214350' THEN 2.00
        WHEN component_name = 'Петля' AND article = 'AX-12DD' THEN 2.00
        WHEN component_name = 'Ось верхняя' THEN 2.00
        WHEN component_name = 'Замок' THEN 2.00
        WHEN component_name = 'Ручка-рейлинг' THEN 2.00
        WHEN component_name = 'Стекло 10мм прозрачное' THEN 9.31
        WHEN component_name = 'Монтаж перегородка' THEN 9.31
        WHEN component_name = 'Доставка комплекта за МКАД' THEN 1.00
        WHEN component_name = 'Покраска фурнитуры' THEN 1.00
        WHEN component_name = 'Матирование' THEN 1.00
        ELSE 1.00
    END,
    CASE 
        WHEN component_type = 'service' AND component_name IN ('Доставка комплекта за МКАД', 'Покраска фурнитуры', 'Матирование') THEN false
        ELSE true
    END
FROM t_p56372141_online_booking_integ.glass_components
WHERE component_name IN (
    'Профиль к-т', 'Лента', 'Заглушка', 'Петля', 'Ось верхняя', 
    'Замок', 'Ручка-рейлинг', 'Стекло 10мм прозрачное', 
    'Монтаж перегородка', 'Доставка комплекта за МКАД', 
    'Покраска фурнитуры', 'Матирование'
);
