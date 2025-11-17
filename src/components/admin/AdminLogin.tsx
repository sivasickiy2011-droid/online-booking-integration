import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

interface AdminLoginProps {
  password: string;
  setPassword: (password: string) => void;
  authLoading: boolean;
  handleLogin: () => void;
}

export default function AdminLogin({ password, setPassword, authLoading, handleLogin }: AdminLoginProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold mb-2">Вход в админ-панель</h1>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Введите пароль"
            />
          </div>

          <Button 
            onClick={handleLogin} 
            disabled={authLoading || !password}
            className="w-full"
          >
            {authLoading ? (
              <>
                <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                Проверка...
              </>
            ) : (
              <>
                <Icon name="LogIn" size={18} className="mr-2" />
                Войти
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
