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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      {!isAuthenticated && (
        <Card className="max-w-4xl mx-auto mb-6 border-2 border-amber-500/50 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name="Info" size={24} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-amber-900">Демонстрационный режим</h3>
                  <p className="text-amber-800 text-sm">
                    Вы можете ознакомиться с калькулятором. Для полного доступа войдите в личный кабинет
                  </p>
                </div>
              </div>
              <Link to="/profile" className="flex-shrink-0">
                <Button size="lg" className="bg-amber-600 hover:bg-amber-700">
                  <Icon name="User" size={20} className="mr-2" />
                  Войти
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      <GlassWidget />
    </div>
  );
}