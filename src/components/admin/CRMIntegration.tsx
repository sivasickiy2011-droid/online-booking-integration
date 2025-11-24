import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAppMode } from '@/contexts/AppModeContext';
import Icon from '@/components/ui/icon';
import AmoCRMConnectionForm from './crm/AmoCRMConnectionForm';
import AmoCRMConnectedView from './crm/AmoCRMConnectedView';
import Bitrix24Card from './crm/Bitrix24Card';
import IntegrationFeaturesCard from './crm/IntegrationFeaturesCard';

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

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const referer = urlParams.get('referer');
    const state = urlParams.get('state');
    
    if (code && referer && state === mode) {
      const domain = referer.replace('.amocrm.ru', '').replace('https://', '');
      setAmoCRMDomain(domain);
      setAmoCRMConnected(true);
      localStorage.setItem(`amocrm_domain_${mode}`, domain);
      localStorage.setItem(`amocrm_connected_${mode}`, 'true');
      
      window.history.replaceState({}, document.title, window.location.pathname);
      
      toast({
        title: 'Успешно подключено!',
        description: `amoCRM домен ${domain} подключен`,
      });
    }
  }, [mode, toast]);



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
    if (!amoCRMClientId) {
      toast({
        title: 'Ошибка',
        description: 'Сначала сохраните данные интеграции',
        variant: 'destructive'
      });
      return;
    }

    const directAuthUrl = `https://www.amocrm.ru/oauth?client_id=${amoCRMClientId}&state=${mode}&mode=post_message`;
    
    const authWindow = window.open(directAuthUrl, 'amoCRM Auth', 'width=600,height=700');
    
    const checkAuthInterval = setInterval(() => {
      try {
        if (authWindow?.closed) {
          clearInterval(checkAuthInterval);
          const connected = localStorage.getItem(`amocrm_connected_${mode}`);
          const domain = localStorage.getItem(`amocrm_domain_${mode}`);
          
          if (connected === 'true' && domain) {
            setAmoCRMDomain(domain);
            setAmoCRMConnected(true);
            toast({
              title: 'Авторизация завершена',
              description: `Подключен аккаунт ${domain}`
            });
          }
        }
      } catch (e) {
        // Ignore cross-origin errors
      }
    }, 500);
    
    setTimeout(() => {
      clearInterval(checkAuthInterval);
    }, 120000);
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
              <AmoCRMConnectionForm
                amoCRMDomain={amoCRMDomain}
                amoCRMClientId={amoCRMClientId}
                amoCRMClientSecret={amoCRMClientSecret}
                loading={loading}
                authUrl={authUrl}
                redirectUrl={redirectUrl}
                disconnectUrl={disconnectUrl}
                setAmoCRMDomain={setAmoCRMDomain}
                setAmoCRMClientId={setAmoCRMClientId}
                setAmoCRMClientSecret={setAmoCRMClientSecret}
                handleAmoCRMConnect={handleAmoCRMConnect}
                handleAuthorize={handleAuthorize}
              />
            ) : (
              <AmoCRMConnectedView
                amoCRMDomain={amoCRMDomain}
                widgetUrl={widgetUrl}
                redirectUrl={redirectUrl}
                disconnectUrl={disconnectUrl}
                copyToClipboard={copyToClipboard}
                handleAmoCRMDisconnect={handleAmoCRMDisconnect}
              />
            )}
          </CardContent>
        </Card>

        <Bitrix24Card />
      </div>

      <IntegrationFeaturesCard />
    </div>
  );
}