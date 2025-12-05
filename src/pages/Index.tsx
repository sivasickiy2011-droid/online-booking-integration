import { useAppMode } from '@/contexts/AppModeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Link } from 'react-router-dom';

export default function Index() {
  const { mode } = useAppMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center mb-12">
          <img 
            src="https://cdn.poehali.dev/files/5e53ea79-1c81-4c3f-847b-e8a82a5743c2.png" 
            alt="ООО Молотов траст" 
            className="h-16 object-contain mb-6"
          />
          <h1 className="text-4xl font-bold text-center mb-4">Виджеты для вашего сайта</h1>
          <p className="text-xl text-muted-foreground text-center max-w-2xl">
            Готовые инструменты для онлайн-записи и расчёта стоимости услуг
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name="Calendar" size={24} className="text-primary" />
                </div>
                <CardTitle>Бронирование времени</CardTitle>
              </div>
              <CardDescription>
                Забронируйте удобное время для встречи или услуги
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/widget-doctor">
                <Button className="w-full" size="lg">
                  <Icon name="ArrowRight" size={20} className="mr-2" />
                  Забронировать
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Icon name="Calculator" size={24} className="text-accent" />
                </div>
                <CardTitle>Калькулятор стоимости</CardTitle>
              </div>
              <CardDescription>
                {mode === 'glass' && 'Рассчитайте стоимость стеклянных изделий'}
                {mode === 'countertop' && 'Рассчитайте стоимость столешниц'}
                {mode === 'clinic' && 'Калькулятор услуг'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/widget-calc">
                <Button className="w-full" size="lg" variant="outline">
                  <Icon name="Calculator" size={20} className="mr-2" />
                  Открыть калькулятор
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                  <Icon name="Code" size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Код встраивания</CardTitle>
              </div>
              <CardDescription>
                Получите код для размещения виджетов на вашем сайте
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/embed">
                <Button className="w-full" size="lg" variant="default">
                  <Icon name="Code" size={20} className="mr-2" />
                  Получить код
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4">
          <Link to="/profile">
            <Button variant="ghost" size="sm">
              <Icon name="User" size={16} className="mr-2" />
              Личный кабинет
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <Icon name="Shield" size={16} className="mr-2" />
              Панель администратора
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}