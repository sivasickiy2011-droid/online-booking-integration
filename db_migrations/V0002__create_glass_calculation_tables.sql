-- Таблица комплектов (наборов параметров для калькуляции)
CREATE TABLE IF NOT EXISTS t_p56372141_online_booking_integ.glass_packages (
    package_id SERIAL PRIMARY KEY,
    package_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    glass_type VARCHAR(100),
    glass_thickness INTEGER,
    glass_price_per_sqm DECIMAL(10, 2) NOT NULL,
    hardware_set VARCHAR(255),
    hardware_price DECIMAL(10, 2) DEFAULT 0,
    markup_percent DECIMAL(5, 2) DEFAULT 0,
    installation_price DECIMAL(10, 2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов калькуляций
CREATE TABLE IF NOT EXISTS t_p56372141_online_booking_integ.glass_orders (
    order_id SERIAL PRIMARY KEY,
    package_id INTEGER REFERENCES t_p56372141_online_booking_integ.glass_packages(package_id),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    customer_email VARCHAR(255),
    width DECIMAL(10, 2) NOT NULL,
    height DECIMAL(10, 2) NOT NULL,
    square_meters DECIMAL(10, 4) NOT NULL,
    glass_cost DECIMAL(10, 2) NOT NULL,
    hardware_cost DECIMAL(10, 2) NOT NULL,
    installation_cost DECIMAL(10, 2) NOT NULL,
    markup_amount DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_glass_packages_active ON t_p56372141_online_booking_integ.glass_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_glass_packages_type ON t_p56372141_online_booking_integ.glass_packages(product_type);
CREATE INDEX IF NOT EXISTS idx_glass_orders_status ON t_p56372141_online_booking_integ.glass_orders(status);
CREATE INDEX IF NOT EXISTS idx_glass_orders_created ON t_p56372141_online_booking_integ.glass_orders(created_at);

-- Вставка примеров комплектов (30 штук)
INSERT INTO t_p56372141_online_booking_integ.glass_packages (package_name, product_type, glass_type, glass_thickness, glass_price_per_sqm, hardware_set, hardware_price, markup_percent, installation_price, description) VALUES
('Душевая кабина Эконом', 'shower_cabin', 'Прозрачное', 6, 3500, 'Базовая фурнитура', 5000, 20, 3000, 'Простая душевая кабина с прозрачным стеклом'),
('Душевая кабина Стандарт', 'shower_cabin', 'Прозрачное', 8, 4200, 'Стандартная фурнитура', 7000, 25, 4000, 'Душевая кабина повышенной прочности'),
('Душевая кабина Премиум', 'shower_cabin', 'Осветленное', 10, 5800, 'Премиум фурнитура', 12000, 30, 5000, 'Премиальная душевая с осветленным стеклом'),
('Угловая душевая Эконом', 'corner_shower', 'Прозрачное', 6, 3500, 'Базовая фурнитура', 6000, 20, 3500, 'Компактная угловая душевая'),
('Угловая душевая Стандарт', 'corner_shower', 'Прозрачное', 8, 4200, 'Стандартная фурнитура', 8500, 25, 4500, 'Угловая душевая со стандартным стеклом'),
('Угловая душевая Премиум', 'corner_shower', 'Осветленное', 10, 5800, 'Премиум фурнитура', 14000, 30, 6000, 'Элитная угловая душевая'),
('Распашная дверь Эконом', 'swing_door', 'Прозрачное', 6, 3500, 'Петли базовые', 4000, 15, 2000, 'Простая распашная дверь'),
('Распашная дверь Стандарт', 'swing_door', 'Прозрачное', 8, 4200, 'Петли усиленные', 6000, 20, 2500, 'Распашная дверь повышенной надежности'),
('Распашная дверь Премиум', 'swing_door', 'Осветленное', 10, 5800, 'Петли премиум', 9000, 25, 3000, 'Премиальная распашная дверь'),
('Раздвижная дверь Эконом', 'sliding_door', 'Прозрачное', 6, 3500, 'Роликовый механизм базовый', 5500, 15, 2500, 'Простая раздвижная дверь'),
('Раздвижная дверь Стандарт', 'sliding_door', 'Прозрачное', 8, 4200, 'Роликовый механизм стандарт', 7500, 20, 3000, 'Раздвижная дверь со стандартным механизмом'),
('Раздвижная дверь Премиум', 'sliding_door', 'Осветленное', 10, 5800, 'Роликовый механизм премиум', 11000, 25, 4000, 'Элитная раздвижная дверь'),
('Шторка для ванной Эконом', 'bath_screen', 'Прозрачное', 6, 3500, 'Крепление базовое', 3000, 15, 1500, 'Простая шторка для ванной'),
('Шторка для ванной Стандарт', 'bath_screen', 'Прозрачное', 8, 4200, 'Крепление усиленное', 4500, 20, 2000, 'Надежная шторка для ванной'),
('Шторка для ванной Премиум', 'bath_screen', 'Осветленное', 10, 5800, 'Крепление премиум', 7000, 25, 2500, 'Премиальная шторка для ванной'),
('Перегородка Матовая Эконом', 'partition', 'Матовое', 8, 4500, 'Профиль алюминиевый', 4000, 20, 2500, 'Матовая перегородка для зонирования'),
('Перегородка Матовая Стандарт', 'partition', 'Матовое', 10, 5500, 'Профиль усиленный', 6000, 25, 3500, 'Прочная матовая перегородка'),
('Перегородка Матовая Премиум', 'partition', 'Матовое декор', 12, 7200, 'Профиль премиум', 9000, 30, 4500, 'Элитная матовая перегородка с декором'),
('Радиусная дверь Стандарт', 'radius_door', 'Прозрачное', 8, 4800, 'Механизм радиусный', 9000, 25, 4000, 'Радиусная дверь со стандартным стеклом'),
('Радиусная дверь Премиум', 'radius_door', 'Осветленное', 10, 6500, 'Механизм радиусный премиум', 13000, 30, 5500, 'Премиальная радиусная дверь'),
('П-образная душевая Стандарт', 'p_shaped_shower', 'Прозрачное', 8, 4200, 'Комплект фурнитуры', 10000, 25, 5000, 'П-образная душевая со стандартным стеклом'),
('П-образная душевая Премиум', 'p_shaped_shower', 'Осветленное', 10, 5800, 'Комплект премиум', 15000, 30, 7000, 'Элитная П-образная душевая'),
('Складная дверь Эконом', 'folding_door', 'Прозрачное', 6, 3500, 'Механизм складной базовый', 6500, 20, 3000, 'Простая складная дверь'),
('Складная дверь Стандарт', 'folding_door', 'Прозрачное', 8, 4200, 'Механизм складной стандарт', 8500, 25, 3500, 'Складная дверь со стандартным механизмом'),
('Складная дверь Премиум', 'folding_door', 'Осветленное', 10, 5800, 'Механизм складной премиум', 12000, 30, 4500, 'Премиальная складная дверь'),
('Душевая трапеция Стандарт', 'trapezoid_shower', 'Прозрачное', 8, 4200, 'Фурнитура трапеция', 11000, 25, 5500, 'Душевая кабина трапециевидной формы'),
('Душевая трапеция Премиум', 'trapezoid_shower', 'Осветленное', 10, 5800, 'Фурнитура трапеция премиум', 16000, 30, 7500, 'Элитная трапециевидная душевая'),
('Круглая душевая Стандарт', 'round_shower', 'Прозрачное', 8, 4800, 'Фурнитура радиусная', 12000, 25, 6000, 'Круглая душевая кабина'),
('Круглая душевая Премиум', 'round_shower', 'Осветленное', 10, 6500, 'Фурнитура радиусная премиум', 17000, 30, 8000, 'Премиальная круглая душевая'),
('Перегородка Цветная Премиум', 'partition', 'Цветное', 10, 6800, 'Профиль цветной', 8000, 30, 4000, 'Цветная стеклянная перегородка');
