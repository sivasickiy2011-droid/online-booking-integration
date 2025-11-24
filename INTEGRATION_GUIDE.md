# Руководство по интеграции с amoCRM

## Что нужно для работы интеграции

### 1. Создать интеграцию в amoCRM

1. Зайдите в **Настройки → Интеграции → Создать интеграцию**
2. Укажите:
   - Название: "Калькулятор стеклянных изделий"
   - Описание: "Виджет для расчета стоимости прямо в сделке"
   - Права доступа: 
     - ✅ Чтение сделок
     - ✅ Запись сделок
     - ✅ Чтение контактов
     - ✅ Добавление примечаний
     - ✅ Работа с товарами

3. Получите:
   - **Client ID** (ID интеграции)
   - **Client Secret** (Секретный ключ)
   - **Redirect URI** (для OAuth авторизации)

### 2. Настроить OAuth авторизацию

#### Получение кода авторизации:
```
https://[ваш-домен].amocrm.ru/oauth?client_id=[CLIENT_ID]&state=random_string&mode=post_message
```

#### Обмен кода на токены:
```bash
POST https://[ваш-домен].amocrm.ru/oauth2/access_token
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "grant_type": "authorization_code",
  "code": "AUTHORIZATION_CODE",
  "redirect_uri": "https://your-app.com/callback"
}
```

**Ответ:**
```json
{
  "token_type": "Bearer",
  "expires_in": 86400,
  "access_token": "eyJ0...",
  "refresh_token": "def50..."
}
```

### 3. Хранение токенов

Токены нужно хранить в базе данных проекта:

```sql
CREATE TABLE amocrm_tokens (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) UNIQUE NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Обновление токенов

Access token действует 24 часа. Перед истечением его нужно обновить:

```bash
POST https://[ваш-домен].amocrm.ru/oauth2/access_token
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "grant_type": "refresh_token",
  "refresh_token": "REFRESH_TOKEN",
  "redirect_uri": "https://your-app.com/callback"
}
```

### 5. Создать виджет в amoCRM

1. В настройках интеграции перейдите в раздел **"Виджеты"**
2. Создайте виджет:
   - Тип: `advanced_widget`
   - Название: "Калькулятор"
   - Местоположение: `leads/card` (карточка сделки)
   - URL виджета: `https://your-domain.com/widget`

3. Настройте манифест виджета (`manifest.json`):

```json
{
  "widget": {
    "name": "Калькулятор стеклянных изделий",
    "description": "Расчет стоимости прямо в сделке",
    "short_description": "Расчет стоимости",
    "version": "1.0.0",
    "init_once": false,
    "locale": ["ru"],
    "is_crm": true,
    "is_display_in_widget_list": true,
    "support": {
      "email": "support@yourdomain.com"
    }
  },
  "locations": [
    "leads/card"
  ],
  "settings": {
    "domain": {
      "name": "Домен",
      "type": "text"
    }
  }
}
```

### 6. Код виджета для встраивания

Виджет должен инициализировать SDK amoCRM:

```javascript
// В файле виджета (widget.html)
<script src="https://www.amocrm.ru/vendors/iframe-sdk/iframe-sdk.js"></script>
<script>
  const widget = new window.AMOCRM.IframeSDK();
  
  widget.init({
    domain: widget.system().subdomain,
    server: widget.system().server
  });
  
  // Получить ID сделки
  const leadId = widget.system().area.card.id;
  
  // Получить данные о сделке
  widget.get_data('leads', [leadId]).then(leads => {
    console.log('Lead data:', leads);
  });
  
  // Добавить примечание
  widget.add_note({
    element_id: leadId,
    element_type: 2, // leads
    note_type: 4, // common note
    params: {
      text: 'Результат калькуляции: 50 000 ₽'
    }
  });
</script>
```

### 7. API функция для работы с виджетом

Бэкенд функция уже создана: `https://functions.poehali.dev/f2361ce7-1320-4407-a36c-6d917575c9a4`

**Возможности:**
- `GET ?action=get_lead` — получить данные о сделке
- `POST action=save_calculation` — сохранить расчет в сделку
- `POST action=save_connection` — сохранить настройки подключения

**Заголовки для запросов:**
- `X-Lead-Id` — ID сделки из amoCRM
- `X-Account-Domain` — домен аккаунта (example.amocrm.ru)

### 8. Что еще нужно доработать

#### База данных для токенов
Добавьте миграцию:

```sql
-- db_migrations/V4__amocrm_tokens.sql
CREATE TABLE IF NOT EXISTS amocrm_tokens (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) UNIQUE NOT NULL,
  client_id VARCHAR(255) NOT NULL,
  client_secret VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_amocrm_domain ON amocrm_tokens(domain);
```

#### Обновите backend функцию
В `backend/amocrm-integration/index.py` добавьте:
- Подключение к БД для хранения токенов
- Логику OAuth авторизации
- Автоматическое обновление токенов
- Получение access_token из БД вместо заглушки

#### Защита данных
- Храните Client Secret в секретах проекта
- Никогда не передавайте токены на фронтенд
- Все запросы к API amoCRM делайте через бэкенд

### 9. Тестирование

1. Зайдите в админку → вкладка CRM
2. Введите данные amoCRM (домен, Client ID, Client Secret)
3. Нажмите "Подключить к amoCRM"
4. Скопируйте URL виджета
5. Добавьте виджет в настройках интеграции amoCRM
6. Откройте любую сделку в amoCRM
7. Виджет должен отобразиться в карточке сделки

### 10. Полезные ссылки

- [Документация amoCRM API](https://www.amocrm.ru/developers/content/crm_platform/platform-api)
- [OAuth авторизация](https://www.amocrm.ru/developers/content/oauth/step-by-step)
- [Создание виджетов](https://www.amocrm.ru/developers/content/crm_platform/widgets)
- [IFrame SDK](https://www.amocrm.ru/developers/content/crm_platform/iframe-sdk)

## Краткий чеклист

- [ ] Создать интеграцию в amoCRM
- [ ] Получить Client ID и Client Secret
- [ ] Настроить OAuth авторизацию
- [ ] Создать таблицу для токенов в БД
- [ ] Обновить backend функцию с работой БД
- [ ] Добавить Client Secret в секреты проекта
- [ ] Создать виджет в настройках интеграции
- [ ] Протестировать в карточке сделки
- [ ] Проверить сохранение расчетов
- [ ] Проверить добавление товаров

Все готово к работе! 🚀
