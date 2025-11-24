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
  redirectUrl: string;
  disconnectUrl: string;
  setAmoCRMDomain: (value: string) => void;
  setAmoCRMClientId: (value: string) => void;
  setAmoCRMClientSecret: (value: string) => void;
  handleAmoCRMConnect: () => void;
  handleAuthorize: () => void;
}

export default function AmoCRMConnectionForm({
  amoCRMDomain,
  amoCRMClientId,
  amoCRMClientSecret,
  loading,
  authUrl,
  redirectUrl,
  disconnectUrl,
  setAmoCRMDomain,
  setAmoCRMClientId,
  setAmoCRMClientSecret,
  handleAmoCRMConnect,
  handleAuthorize,
}: AmoCRMConnectionFormProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  return (
    <>
      <div className="space-y-3">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-blue-500 mt-0.5" />
            <div className="space-y-3 flex-1">
              <div className="font-medium">Как подключить amoCRM</div>
              <ol className="space-y-2 text-sm text-muted-foreground ml-4">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  <span>В amoCRM: Настройки → Интеграции → Создать интеграцию</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  <span>Укажите название "Калькулятор", доступ: "Всё"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  <div className="flex-1 space-y-1">
                    <div><strong>НЕ загружайте</strong> архив с кодом</div>
                    <div className="text-xs">Укажите эти ссылки:</div>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center gap-2 bg-background/50 p-2 rounded border">
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-medium mb-0.5">Ссылка для перенаправления:</div>
                          <div className="text-xs font-mono truncate">{redirectUrl}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(redirectUrl)}
                          className="shrink-0 h-7 w-7 p-0"
                        >
                          <Icon name="Copy" size={14} />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 bg-background/50 p-2 rounded border">
                        <div className="flex-1 overflow-hidden">
                          <div className="text-xs font-medium mb-0.5">Ссылка хука об отключении:</div>
                          <div className="text-xs font-mono truncate">{disconnectUrl}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(disconnectUrl)}
                          className="shrink-0 h-7 w-7 p-0"
                        >
                          <Icon name="Copy" size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">4.</span>
                  <span>Скопируйте Client ID и Client Secret в форму ниже</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">5.</span>
                  <span>Нажмите "Сохранить данные", затем "Авторизоваться"</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
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