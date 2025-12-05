import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type WidgetType = 'doctor' | 'calc';
type EmbedMethod = 'iframe' | 'js';

export default function EmbedCodeGenerator() {
  const [widgetType, setWidgetType] = useState<WidgetType>('doctor');
  const [embedMethod, setEmbedMethod] = useState<EmbedMethod>('iframe');
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600px');
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;
  const widgetUrl = widgetType === 'doctor' ? `${baseUrl}/widget-doctor` : `${baseUrl}/widget-calc`;
  const widgetTypeName = widgetType === 'doctor' ? 'бронирования времени' : 'калькулятора';
  const apiWidgetType = widgetType === 'doctor' ? 'booking' : 'calculator';

  const iframeCode = `<!-- Виджет ${widgetTypeName} -->
<iframe 
  src="${widgetUrl}"
  width="${width}"
  height="${height}"
  frameborder="0"
  style="border: none; border-radius: 8px;"
  loading="lazy"
></iframe>`;

  const jsCode = `<!-- Виджет ${widgetTypeName} через JavaScript API -->
<div id="widget-container"></div>

<script src="${baseUrl}/widget-api.js"></script>
<script>
  // Создание виджета
  const widgetId = window.WidgetAPI.create({
    type: '${apiWidgetType}',
    containerId: 'widget-container',
    width: '${width}',
    height: '${height}',
    
    // Колбэки (опционально)
    onLoad: function() {
      console.log('Виджет загружен');
    },
    ${apiWidgetType === 'booking' ? `onBook: function(data) {
      console.log('Бронирование:', data);
      // data содержит: date, time, name, phone, email
    }` : `onCalculate: function(data) {
      console.log('Расчёт:', data);
      // data содержит: total, services, discount
    }`}
  });
  
  // Управление виджетом
  // window.WidgetAPI.resize(widgetId, '800px', '700px');
  // window.WidgetAPI.destroy(widgetId);
</script>`;

  const embedCode = embedMethod === 'iframe' ? iframeCode : jsCode;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="Code" size={24} className="text-primary" />
            </div>
            <CardTitle>Генератор кода для встраивания</CardTitle>
          </div>
          <CardDescription>
            Настройте параметры и скопируйте код для размещения виджета на вашем сайте
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={embedMethod} onValueChange={(v) => setEmbedMethod(v as EmbedMethod)} className="mb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="iframe">
                <Icon name="Frame" size={16} className="mr-2" />
                iframe
              </TabsTrigger>
              <TabsTrigger value="js">
                <Icon name="Code2" size={16} className="mr-2" />
                JavaScript API
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="widget-type">Тип виджета:</Label>
            <Select value={widgetType} onValueChange={(v) => setWidgetType(v as WidgetType)}>
              <SelectTrigger id="widget-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor">
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={16} />
                    <span>Виджет бронирования</span>
                  </div>
                </SelectItem>
                <SelectItem value="calc">
                  <div className="flex items-center gap-2">
                    <Icon name="Calculator" size={16} />
                    <span>Виджет калькулятора</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Ширина:</Label>
              <Input
                id="width"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                placeholder="100%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Высота:</Label>
              <Input
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="600px"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Превью виджета:</Label>
            <div className="border rounded-lg p-4 bg-muted/30">
              <iframe
                src={widgetUrl}
                width="100%"
                height="400px"
                style={{ border: 'none', borderRadius: '8px' }}
                title="Preview"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Код для встраивания:</Label>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{embedCode}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Icon name="Check" size={16} className="mr-2" />
                    Скопировано!
                  </>
                ) : (
                  <>
                    <Icon name="Copy" size={16} className="mr-2" />
                    Копировать
                  </>
                )}
              </Button>
            </div>
          </div>

          {embedMethod === 'js' && (
            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex gap-3">
                <Icon name="Sparkles" size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-purple-900 dark:text-purple-100">
                    Преимущества JavaScript API:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-purple-800 dark:text-purple-200">
                    <li>Программное управление виджетами (создание, удаление, изменение размеров)</li>
                    <li>Получение данных о бронированиях и расчётах в реальном времени</li>
                    <li>Интеграция с вашей аналитикой и CRM-системой</li>
                    <li>Гибкая настройка поведения через колбэки</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Как встроить виджет:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Скопируйте код выше</li>
                  <li>Откройте HTML-файл вашего сайта</li>
                  <li>Вставьте код в нужное место на странице</li>
                  <li>Сохраните изменения и обновите страницу</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Примеры использования</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">На WordPress:</p>
            <p className="text-sm text-muted-foreground">
              Вставьте код в HTML-блок или используйте плагин "Custom HTML"
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">На Tilda:</p>
            <p className="text-sm text-muted-foreground">
              Добавьте блок "HTML-код" (T123) и вставьте код встраивания
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">На любом сайте:</p>
            <p className="text-sm text-muted-foreground">
              Вставьте код в любое место HTML-страницы между тегами &lt;body&gt; и &lt;/body&gt;
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}