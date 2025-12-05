/**
 * Widget API для управления виджетами через JavaScript
 * Позволяет встраивать и управлять виджетами программно
 */

export interface WidgetConfig {
  type: 'booking' | 'calculator';
  containerId: string;
  width?: string;
  height?: string;
  theme?: 'light' | 'dark' | 'auto';
  onLoad?: () => void;
  onBook?: (data: BookingData) => void;
  onCalculate?: (data: CalculationData) => void;
}

export interface BookingData {
  date: string;
  time: string;
  name: string;
  phone: string;
  email?: string;
}

export interface CalculationData {
  total: number;
  services: string[];
  discount: number;
}

class WidgetAPI {
  private widgets: Map<string, HTMLIFrameElement> = new Map();
  private baseUrl: string;

  constructor() {
    this.baseUrl = window.location.origin;
    this.setupMessageListener();
  }

  private setupMessageListener() {
    window.addEventListener('message', (event) => {
      if (event.origin !== this.baseUrl) return;

      const { type, widgetId, data } = event.data;

      if (type === 'widget-loaded') {
        const config = this.getWidgetConfig(widgetId);
        config?.onLoad?.();
      } else if (type === 'booking-submitted') {
        const config = this.getWidgetConfig(widgetId);
        config?.onBook?.(data);
      } else if (type === 'calculation-completed') {
        const config = this.getWidgetConfig(widgetId);
        config?.onCalculate?.(data);
      }
    });
  }

  private getWidgetConfig(widgetId: string): WidgetConfig | undefined {
    return (this.widgets.get(widgetId) as any)?._config;
  }

  /**
   * Создаёт и встраивает виджет на страницу
   */
  public create(config: WidgetConfig): string {
    const container = document.getElementById(config.containerId);
    if (!container) {
      throw new Error(`Container with id "${config.containerId}" not found`);
    }

    const widgetId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const widgetUrl = config.type === 'booking' 
      ? `${this.baseUrl}/widget-doctor`
      : `${this.baseUrl}/widget-calc`;

    const iframe = document.createElement('iframe');
    iframe.id = widgetId;
    iframe.src = widgetUrl;
    iframe.style.width = config.width || '100%';
    iframe.style.height = config.height || '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.setAttribute('loading', 'lazy');

    (iframe as any)._config = config;

    container.appendChild(iframe);
    this.widgets.set(widgetId, iframe);

    return widgetId;
  }

  /**
   * Удаляет виджет со страницы
   */
  public destroy(widgetId: string): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      widget.remove();
      this.widgets.delete(widgetId);
    }
  }

  /**
   * Отправляет сообщение виджету
   */
  public sendMessage(widgetId: string, message: any): void {
    const widget = this.widgets.get(widgetId);
    if (widget && widget.contentWindow) {
      widget.contentWindow.postMessage(message, this.baseUrl);
    }
  }

  /**
   * Обновляет размеры виджета
   */
  public resize(widgetId: string, width: string, height: string): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      widget.style.width = width;
      widget.style.height = height;
    }
  }

  /**
   * Получает список всех виджетов на странице
   */
  public getAll(): string[] {
    return Array.from(this.widgets.keys());
  }
}

// Создаём глобальный экземпляр API
const widgetAPI = new WidgetAPI();

// Экспортируем в window для использования извне
if (typeof window !== 'undefined') {
  (window as any).WidgetAPI = widgetAPI;
}

export default widgetAPI;
