import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

export default function IntegrationFeaturesCard() {
  return (
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
  );
}
