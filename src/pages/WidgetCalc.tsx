import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';
import GlassWidget from '@/components/widgets/GlassWidget';

export default function WidgetCalc() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem('user_authenticated');
    setIsAuthenticated(savedAuth === 'true');
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <Icon name="AlertCircle" size={32} className="text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Не выбран основной инструмент</CardTitle>
            <CardDescription className="text-base mt-2">
              Войдите в личный кабинет и выберите основной инструмент для работы
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/profile">
              <Button className="w-full" size="lg">
                <Icon name="User" size={20} className="mr-2" />
                Войти в личный кабинет
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <GlassWidget />
    </div>
  );
}