import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAppMode } from '@/contexts/AppModeContext';
import Icon from '@/components/ui/icon';

export default function CRMIntegration() {
  const { mode } = useAppMode();
  const [amoCRMConnected, setAmoCRMConnected] = useState(false);
  const [amoCRMDomain, setAmoCRMDomain] = useState('');
  const [amoCRMClientId, setAmoCRMClientId] = useState('');
  const [amoCRMClientSecret, setAmoCRMClientSecret] = useState('');
  const [authUrl, setAuthUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const widgetUrl = `${window.location.origin}/widget`;
  const redirectUrl = 'https://functions.poehali.dev/1ef24008-864d-4313-add9-5085c0faed3b';
  const disconnectUrl = 'https://functions.poehali.dev/1ef24008-864d-4313-add9-5085c0faed3b';

  useEffect(() => {
    const savedDomain = localStorage.getItem(`amocrm_domain_${mode}`);
    const savedConnected = localStorage.getItem(`amocrm_connected_${mode}`);
    if (savedDomain && savedConnected === 'true') {
      setAmoCRMDomain(savedDomain);
      setAmoCRMConnected(true);
    }
  }, [mode]);

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
      const response = await fetch('https://functions.poehali.dev/1ef24008-864d-4313-add9-5085c0faed3b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_integration',
          integration: {
            widget_type: mode,
            domain: amoCRMDomain,
            client_id: amoCRMClientId,
            client_secret: amoCRMClientSecret
          }
        })
      });

      const data = await response.json();
      
      if (data.success && data.auth_url) {
        setAuthUrl(data.auth_url);
        localStorage.setItem(`amocrm_domain_${mode}`, amoCRMDomain);
        toast({
          title: 'Данные сохранены',
          description: 'Теперь нажмите "Авторизоваться" для получения токенов'
        });
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = () => {
    if (authUrl) {
      window.open(authUrl, '_blank', 'width=600,height=700');
      setTimeout(() => {
        setAmoCRMConnected(true);
        localStorage.setItem(`amocrm_connected_${mode}`, 'true');
        toast({
          title: 'Авторизация завершена',
          description: 'Интеграция активна'
        });
      }, 3000);
    }
  };

  const handleAmoCRMDisconnect = async () => {
    try {
      await fetch('https://functions.poehali.dev/1ef24008-864d-4313-add9-5085c0faed3b', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'disconnect',
          widget_type: mode,
          domain: amoCRMDomain
        })
      });

      setAmoCRMConnected(false);
      setAmoCRMDomain('');
      setAmoCRMClientId('');
      setAmoCRMClientSecret('');
      setAuthUrl('');
      localStorage.removeItem(`amocrm_domain_${mode}`);
      localStorage.removeItem(`amocrm_connected_${mode}`);
      
      toast({
        title: 'Отключено',
        description: 'amoCRM отключена'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отключить интеграцию',
        variant: 'destructive'
      });
    }
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
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Icon name="Save" size={16} className="mr-2" />
                      Сохранить данные
                    </>
                  )}
                </Button>
                
                {authUrl && (
                  <Button 
                    onClick={handleAuthorize} 
                    variant="default"
                    className="w-full"
                  >
                    <Icon name="Key" size={16} className="mr-2" />
                    Авторизоваться в amoCRM
                  </Button>
                )}
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

                <Alert>
                  <Icon name="Info" size={16} />
                  <AlertDescription className="ml-2">
                    <div className="space-y-3">
                      <div className="font-medium">Как встроить калькулятор в amoCRM:</div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Шаг 1: Подготовка файлов виджета</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>• Файлы виджета находятся в <code className="bg-muted px-1 rounded">public/amocrm-widget/</code></div>
                          <div>• Разместите их на вашем домене по HTTPS</div>
                          <div>• Проверьте доступность: <code className="bg-muted px-1 rounded">{window.location.origin}/amocrm-widget/manifest.json</code></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Шаг 2: Добавление виджета в интеграцию</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>1. В настройках вашей интеграции → раздел "Виджеты"</div>
                          <div>2. Нажмите "Добавить виджет"</div>
                          <div>3. Укажите путь к manifest.json: <code className="bg-muted px-1 rounded">{window.location.origin}/amocrm-widget/manifest.json</code></div>
                          <div>4. Сохраните и установите виджет</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-medium">Шаг 3: Проверка работы</div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>1. Откройте любую сделку в amoCRM</div>
                          <div>2. В правой колонке автоматически появится виджет "Калькулятор"</div>
                          <div>3. Виджет будет отображаться во всех сделках автоматически</div>
                        </div>
                      </div>

                      <div className="mt-3 p-2 bg-yellow-500/10 rounded text-xs">
                        <strong>Важно:</strong> Виджет должен быть размещен на HTTPS и доступен публично без авторизации
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