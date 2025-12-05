/**
 * Widget API для управления виджетами через JavaScript
 * Версия: 1.0.0
 */

(function(window) {
  'use strict';

  class WidgetAPI {
    constructor() {
      this.widgets = new Map();
      this.baseUrl = window.location.origin;
      this.setupMessageListener();
    }

    setupMessageListener() {
      window.addEventListener('message', (event) => {
        const { type, widgetId, data } = event.data;

        if (type === 'widget-loaded') {
          const config = this.getWidgetConfig(widgetId);
          if (config && config.onLoad) config.onLoad();
        } else if (type === 'booking-submitted') {
          const config = this.getWidgetConfig(widgetId);
          if (config && config.onBook) config.onBook(data);
        } else if (type === 'calculation-completed') {
          const config = this.getWidgetConfig(widgetId);
          if (config && config.onCalculate) config.onCalculate(data);
        }
      });
    }

    getWidgetConfig(widgetId) {
      const widget = this.widgets.get(widgetId);
      return widget ? widget._config : undefined;
    }

    /**
     * Создаёт и встраивает виджет на страницу
     * @param {Object} config - Конфигурация виджета
     * @param {string} config.type - Тип виджета: 'booking' или 'calculator'
     * @param {string} config.containerId - ID контейнера для виджета
     * @param {string} [config.width='100%'] - Ширина виджета
     * @param {string} [config.height='600px'] - Высота виджета
     * @param {Function} [config.onLoad] - Колбэк при загрузке виджета
     * @param {Function} [config.onBook] - Колбэк при бронировании (для type='booking')
     * @param {Function} [config.onCalculate] - Колбэк при расчёте (для type='calculator')
     * @returns {string} ID созданного виджета
     */
    create(config) {
      const container = document.getElementById(config.containerId);
      if (!container) {
        throw new Error('Container with id "' + config.containerId + '" not found');
      }

      const widgetId = 'widget-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      const widgetUrl = config.type === 'booking' 
        ? this.baseUrl + '/widget-doctor'
        : this.baseUrl + '/widget-calc';

      const iframe = document.createElement('iframe');
      iframe.id = widgetId;
      iframe.src = widgetUrl;
      iframe.style.width = config.width || '100%';
      iframe.style.height = config.height || '600px';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.setAttribute('loading', 'lazy');

      iframe._config = config;

      container.appendChild(iframe);
      this.widgets.set(widgetId, iframe);

      return widgetId;
    }

    /**
     * Удаляет виджет со страницы
     * @param {string} widgetId - ID виджета
     */
    destroy(widgetId) {
      const widget = this.widgets.get(widgetId);
      if (widget) {
        widget.remove();
        this.widgets.delete(widgetId);
      }
    }

    /**
     * Отправляет сообщение виджету
     * @param {string} widgetId - ID виджета
     * @param {*} message - Сообщение для отправки
     */
    sendMessage(widgetId, message) {
      const widget = this.widgets.get(widgetId);
      if (widget && widget.contentWindow) {
        widget.contentWindow.postMessage(message, this.baseUrl);
      }
    }

    /**
     * Обновляет размеры виджета
     * @param {string} widgetId - ID виджета
     * @param {string} width - Новая ширина
     * @param {string} height - Новая высота
     */
    resize(widgetId, width, height) {
      const widget = this.widgets.get(widgetId);
      if (widget) {
        widget.style.width = width;
        widget.style.height = height;
      }
    }

    /**
     * Получает список всех виджетов на странице
     * @returns {string[]} Массив ID виджетов
     */
    getAll() {
      return Array.from(this.widgets.keys());
    }
  }

  // Создаём глобальный экземпляр API
  window.WidgetAPI = new WidgetAPI();

})(window);
