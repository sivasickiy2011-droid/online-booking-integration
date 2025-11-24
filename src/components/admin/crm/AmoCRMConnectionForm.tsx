import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface AmoCRMConnectionFormProps {
  amoCRMDomain: string;
  amoCRMClientId: string;
  amoCRMClientSecret: string;
  loading: boolean;
  authUrl: string;
  showOAuthButton: boolean;
  setAmoCRMDomain: (value: string) => void;
  setAmoCRMClientId: (value: string) => void;
  setAmoCRMClientSecret: (value: string) => void;
  setShowOAuthButton: (value: boolean) => void;
  handleAmoCRMConnect: () => void;
  handleAuthorize: () => void;
}

export default function AmoCRMConnectionForm({
  amoCRMDomain,
  amoCRMClientId,
  amoCRMClientSecret,
  loading,
  authUrl,
  showOAuthButton,
  setAmoCRMDomain,
  setAmoCRMClientId,
  setAmoCRMClientSecret,
  setShowOAuthButton,
  handleAmoCRMConnect,
  handleAuthorize,
}: AmoCRMConnectionFormProps) {
  return (
    <>
      <div className="space-y-3">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Zap" size={20} className="text-blue-500 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="font-medium">Быстрая установка (рекомендуется)</div>
              <div className="text-xs text-muted-foreground">
                Подключите amoCRM одним кликом. Интеграция создастся автоматически.
              </div>
              <div id="amocrm-oauth-button" className="mt-3"></div>
              <Button
                onClick={() => setShowOAuthButton(true)}
                className="w-full mt-2"
                disabled={showOAuthButton}
              >
                <Icon name="Link" size={16} className="mr-2" />
                {showOAuthButton ? 'Нажмите кнопку выше для подключения' : 'Показать кнопку подключения'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="text-center text-sm text-muted-foreground">
        или настройте вручную
      </div>

      <Separator />

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
  );
}
