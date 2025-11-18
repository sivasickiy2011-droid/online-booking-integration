import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function GlassWidget() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Blocks" size={32} className="text-primary" />
          </div>
          <CardTitle className="text-2xl">Калькулятор Стеклянных изделий</CardTitle>
          <CardDescription>
            Рассчитайте стоимость вашего заказа онлайн
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center space-y-3">
              <Icon name="Blocks" size={64} className="mx-auto opacity-20" />
              <p className="text-lg font-medium">Калькулятор в разработке</p>
              <p className="text-sm">Скоро здесь появится форма расчёта стоимости стеклянных изделий</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
