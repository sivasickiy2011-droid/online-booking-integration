import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

export default function CRMIntegration() {
  const [amoCRMConnected, setAmoCRMConnected] = useState(false);
  const [amoCRMDomain, setAmoCRMDomain] = useState('');
  const [amoCRMClientId, setAmoCRMClientId] = useState('');
  const [amoCRMClientSecret, setAmoCRMClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const widgetUrl = `${window.location.origin}/widget`;

  const handleAmoCRMConnect = async () => {
    if (!amoCRMDomain || !amoCRMClientId || !amoCRMClientSecret) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/f2361ce7-1320-4407-a36c-6d917575c9a4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_connection',
          connection: {
            domain: amoCRMDomain,
            client_id: amoCRMClientId,
            client_secret: amoCRMClientSecret
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAmoCRMConnected(true);
        localStorage.setItem('amocrm_domain', amoCRMDomain);
        toast({
          title: 'Подключение установлено',
          description: 'amoCRM успешно подключена'
        });
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось подключить amoCRM',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAmoCRMDisconnect = () => {
    setAmoCRMConnected(false);
    setAmoCRMDomain('');
    setAmoCRMClientId('');
    setAmoCRMClientSecret('');
    toast({
      title: 'Отключено',
      description: 'amoCRM отключена'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Скопировано',
      description: 'URL скопирован в буфер обмена'
    });
  };

  const handleBitrix24Click = () => {
    toast({
      title: 'Скоро',
      description: 'Интеграция с Битрикс24 будет доступна в следующей версии',
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Icon name="Activity" size={24} className="text-blue-500" />
              </div>
              <div>
                <CardTitle>amoCRM</CardTitle>
                <CardDescription>Подключите виджет к amoCRM</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!amoCRMConnected ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="amocrm-domain">Домен amoCRM</Label>
                  <Input
                    id="amocrm-domain"
                    placeholder="yourcompany.amocrm.ru"
                    value={amoCRMDomain}
                    onChange={(e) => setAmoCRMDomain(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amocrm-client-id">Client ID</Label>
                  <Input
                    id="amocrm-client-id"
                    placeholder="Введите Client ID"
                    value={amoCRMClientId}
                    onChange={(e) => setAmoCRMClientId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amocrm-client-secret">Client Secret</Label>
                  <Input
                    id="amocrm-client-secret"
                    type="password"
                    placeholder="Введите Client Secret"
                    value={amoCRMClientSecret}
                    onChange={(e) => setAmoCRMClientSecret(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleAmoCRMConnect} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Подключение...
                    </>
                  ) : (
                    <>
                      <Icon name="Link" size={16} className="mr-2" />
                      Подключить к amoCRM
                    </>
                  )}
                </Button>
              </>
            ) : (
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
                  <Label>Инструкция по подключению</Label>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Откройте настройки amoCRM → Настройки → API</li>
                    <li>Создайте новую интеграцию</li>
                    <li>В разделе "Виджеты" добавьте URL виджета</li>
                    <li>Укажите права доступа: чтение и запись сделок</li>
                    <li>Сохраните изменения</li>
                  </ol>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Настройки передачи данных</Label>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5" />
                      <span>Результаты калькуляции сохраняются в комментарий сделки</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5" />
                      <span>Товары по калькуляции добавляются в сделку</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5" />
                      <span>PDF коммерческого предложения прикрепляется к сделке</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="CheckCircle2" size={16} className="text-green-500 mt-0.5" />
                      <span>Контактные данные клиента берутся из сделки</span>
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
            )}
          </CardContent>
        </Card>

        <Card className="relative">
          <div className="absolute inset-0 bg-muted/50 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="text-center space-y-2">
              <Icon name="Clock" size={48} className="mx-auto text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Скоро в следующей версии</p>
            </div>
          </div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Icon name="Box" size={24} className="text-orange-500" />
              </div>
              <div>
                <CardTitle>Битрикс24</CardTitle>
                <CardDescription>Подключите виджет к Битрикс24</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 opacity-50">
            <div className="space-y-2">
              <Label>Портал Битрикс24</Label>
              <Input placeholder="yourcompany.bitrix24.ru" disabled />
            </div>
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input placeholder="Введите Webhook URL" disabled />
            </div>
            <Button disabled className="w-full">
              <Icon name="Link" size={16} className="mr-2" />
              Подключить к Битрикс24
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="FileText" size={20} />
            Возможности интеграции
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Icon name="Calculator" size={16} className="text-primary" />
                Калькулятор стекла
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Расчет стоимости изделия прямо в сделке</li>
                <li>• Автоматическое добавление товаров в сделку</li>
                <li>• Генерация PDF коммерческого предложения</li>
                <li>• Сохранение истории расчетов</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Icon name="Calendar" size={16} className="text-primary" />
                Запись на прием
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Запись клиента на прием врача</li>
                <li>• Синхронизация с календарем врача</li>
                <li>• Сохранение записи в комментарий сделки</li>
                <li>• Уведомления о записи</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}