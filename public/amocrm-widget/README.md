# amoCRM Widget Files

Эта папка содержит файлы виджета для интеграции с amoCRM.

## Структура файлов

```
amocrm-widget/
├── manifest.json    # Конфигурация виджета (название, версия, locations)
├── script.js        # Основной код виджета (AMD формат с define)
├── style.css        # Стили виджета (опционально)
└── i18n/
    └── ru.json      # Русская локализация
```

## Как работает виджет

1. **manifest.json** - описывает виджет для amoCRM:
   - `locations: ["lcard"]` - виджет в правой колонке карточки сделки
   - Другие locations: `ccard` (контакт), `comcard` (компания), `cucard` (покупатель)

2. **script.js** - JavaScript код в AMD формате:
   - Использует `define(['jquery'], function($) { ... })`
   - Получает ID сделки через `widget.system().area.id`
   - Создает iframe с калькулятором
   - Вставляет iframe в DOM виджета

3. **style.css** - CSS стили для виджета (если нужны)

4. **i18n/ru.json** - переводы для интерфейса виджета

## Требования

### ✅ HTTPS обязателен
amoCRM загружает виджеты ТОЛЬКО по HTTPS. HTTP не работает!

### ✅ Публичный доступ
Все файлы должны быть доступны без авторизации.

Проверьте:
```bash
curl https://ваш-домен.com/amocrm-widget/manifest.json
curl https://ваш-домен.com/amocrm-widget/script.js
```

### ✅ CORS настроен
Сервер должен отдавать заголовки:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
```

На poehali.dev это работает автоматически после публикации.

## Установка виджета

### Способ 1: Автоматическая установка (рекомендуется)

1. В админке калькулятора: **CRM интеграции → Показать кнопку подключения**
2. Нажмите **"Подключить amoCRM"**
3. Разрешите доступ
4. В amoCRM: **Настройки → Интеграции → Калькулятор → Виджеты → Добавить виджет**
5. Укажите путь: `https://ваш-домен.com/amocrm-widget/manifest.json`

### Способ 2: Ручная настройка

См. `/AMOCRM_CORRECT_SETUP.md`

## Отладка

### Виджет не появляется

1. Откройте консоль браузера (F12) в amoCRM
2. Проверьте ошибки загрузки файлов
3. Убедитесь что файлы доступны по HTTPS

### Частые ошибки

**"Failed to load manifest.json"**
- Проверьте путь к файлу
- Убедитесь что файл доступен (откройте в браузере)
- Проверьте HTTPS

**"Widget is not defined"**
- Проверьте формат script.js (должен быть AMD с `define`)
- Убедитесь что jQuery доступен

**CORS Error**
- Настройте CORS на сервере
- Разрешите домен `*.amocrm.ru`

## Дополнительные ресурсы

- [Документация amoCRM по виджетам](https://www.amocrm.ru/developers/content/crm_platform/widgets)
- [Примеры виджетов](https://github.com/amocrm)
- [Наше community](https://t.me/+QgiLIa1gFRY4Y2Iy)

## Изменение виджета

После изменения файлов виджета:

1. Сохраните изменения
2. Опубликуйте проект (Build → Deploy)
3. В amoCRM: обновите страницу карточки (Ctrl+F5)
4. Если не помогло: **Настройки → Интеграции → Калькулятор → Переустановить**

## Логирование

Для отладки добавьте в script.js:

```javascript
console.log('Widget loaded', widget);
console.log('Lead ID:', leadId);
console.log('Domain:', domain);
```

Логи будут в консоли браузера (F12) при открытии карточки сделки.
