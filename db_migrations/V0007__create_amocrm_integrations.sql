-- Таблица для хранения подключений к amoCRM (разные виджеты)
CREATE TABLE IF NOT EXISTS amocrm_integrations (
  id SERIAL PRIMARY KEY,
  widget_type VARCHAR(50) NOT NULL, -- 'clinic', 'glass', 'countertop'
  domain VARCHAR(255) NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  client_secret TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(widget_type, domain)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_amocrm_widget_type ON amocrm_integrations(widget_type);
CREATE INDEX idx_amocrm_domain ON amocrm_integrations(domain);
CREATE INDEX idx_amocrm_active ON amocrm_integrations(is_active);

-- Комментарии
COMMENT ON TABLE amocrm_integrations IS 'Подключения к amoCRM для разных виджетов';
COMMENT ON COLUMN amocrm_integrations.widget_type IS 'Тип виджета: clinic, glass, countertop';
COMMENT ON COLUMN amocrm_integrations.domain IS 'Домен amoCRM (example.amocrm.ru)';
COMMENT ON COLUMN amocrm_integrations.client_id IS 'ID интеграции из amoCRM';
COMMENT ON COLUMN amocrm_integrations.client_secret IS 'Секретный ключ интеграции';
COMMENT ON COLUMN amocrm_integrations.access_token IS 'Токен доступа (действует 24 часа)';
COMMENT ON COLUMN amocrm_integrations.refresh_token IS 'Токен для обновления access_token';
COMMENT ON COLUMN amocrm_integrations.token_expires_at IS 'Время истечения access_token';
