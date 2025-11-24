import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';

interface AmoCRMConnectedViewProps {
  amoCRMDomain: string;
  widgetUrl: string;
  redirectUrl: string;
  disconnectUrl: string;
  copyToClipboard: (text: string) => void;
  handleAmoCRMDisconnect: () => void;
}

export default function AmoCRMConnectedView({
  amoCRMDomain,
  widgetUrl,
  redirectUrl,
  disconnectUrl,
  copyToClipboard,
  handleAmoCRMDisconnect,
}: AmoCRMConnectedViewProps) {
  return (
    <div className="space-y-4">
      <Alert className="bg-green-500/10 border-green-500/20">
        <Icon name="CheckCircle2" size={16} className="text-green-500" />
        <AlertDescription className="ml-2">
          amoCRM подключена к домену: <strong>{amoCRMDomain}</strong>
        </AlertDescription>
      </Alert>
      
      <Separator />
      
      <div className="space-y-2">
        <Label>URL виджета для встраивания</Label>
        <div className="flex gap-2">
          <Input value={widgetUrl} readOnly className="font-mono text-xs" />
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => copyToClipboard(widgetUrl)}
          >
            <Icon name="Copy" size={16} />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Используйте этот URL для встраивания виджета во фрейм сделки
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Данные для создания интеграции в amoCRM</Label>
        <div className="space-y-3 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground">Ссылка для перенаправления (Redirect URI):</div>
            <div className="flex gap-2">
              <Input 
                value={redirectUrl} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(redirectUrl)}
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-muted-foreground">Ссылка для хука об отключении:</div>
            <div className="flex gap-2">
              <Input 
                value={disconnectUrl} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(disconnectUrl)}
              >
                <Icon name="Copy" size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-muted-foreground font-medium">Права доступа (в разделе "Безопасность"):</div>
            <div className="space-y-1 ml-4">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={14} className="text-green-500" />
                <span>Чтение сделок</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={14} className="text-green-500" />
                <span>Запись сделок</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={14} className="text-green-500" />
                <span>Чтение контактов</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={14} className="text-green-500" />
                <span>Добавление примечаний</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle2" size={14} className="text-green-500" />
                <span>Работа с товарами</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <Alert className="bg-green-500/10 border-green-500/20">
        <Icon name="CheckCircle2" size={16} className="text-green-500" />
        <AlertDescription className="ml-2">
          <div className="space-y-2">
            <div className="font-medium">✅ Интеграция подключена автоматически!</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>• Интеграция создана в вашем аккаунте amoCRM</div>
              <div>• Client ID и Client Secret получены автоматически</div>
              <div>• Теперь добавьте виджет в интеграцию (см. ниже)</div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Separator />

      <Alert>
        <Icon name="Info" size={16} />
        <AlertDescription className="ml-2">
          <div className="space-y-3">
            <div className="font-medium">Следующий шаг: Добавить виджет в интеграцию</div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">1. Проверьте доступность файлов виджета</div>
              <div className="text-xs text-muted-foreground">
                <div>Файлы должны быть доступны по HTTPS:</div>
                <div className="mt-1">
                  <code className="bg-muted px-1 py-0.5 rounded text-xs block">
                    {window.location.origin}/amocrm-widget/manifest.json
                  </code>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">2. Зайдите в настройки интеграции в amoCRM</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Настройки → Интеграции</div>
                <div>• Найдите интеграцию "Калькулятор"</div>
                <div>• Перейдите в раздел "Виджеты"</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">3. Добавьте виджет</div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Нажмите "Добавить виджет"</div>
                <div>• Путь к manifest: <code className="bg-muted px-1 rounded">{window.location.origin}/amocrm-widget/manifest.json</code></div>
                <div>• Сохраните изменения</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">4. Проверьте работу</div>
              <div className="text-xs text-muted-foreground">
                Откройте любую сделку — виджет появится справа автоматически!
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Separator />

      <div className="space-y-2">
        <Label>Что умеет интеграция</Label>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5" />
            <span>Подгружает данные клиента из сделки автоматически</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5" />
            <span>Сохраняет результаты расчета в примечания сделки</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5" />
            <span>Добавляет товары по калькуляции в сделку</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5" />
            <span>Генерирует PDF коммерческого предложения</span>
          </div>
        </div>
      </div>

      <Button 
        variant="destructive" 
        onClick={handleAmoCRMDisconnect}
        className="w-full"
      >
        <Icon name="Unlink" size={16} className="mr-2" />
        Отключить amoCRM
      </Button>
    </div>
  );
}
