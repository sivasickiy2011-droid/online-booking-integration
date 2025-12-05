import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const services = [
  { id: 'consultation', name: 'Консультация специалиста', price: 2000 },
  { id: 'therapy', name: 'Терапия (1 сеанс)', price: 3500 },
  { id: 'diagnostics', name: 'Комплексная диагностика', price: 5000 },
  { id: 'treatment', name: 'Лечение (курс)', price: 15000 },
  { id: 'prevention', name: 'Профилактика', price: 2500 },
];

export default function ClinicCalcWidget() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number>(0);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const calculateTotal = () => {
    const subtotal = selectedServices.reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return sum + (service?.price || 0);
    }, 0);
    
    return subtotal - (subtotal * discount / 100);
  };

  const total = calculateTotal();

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="Calculator" size={24} className="text-primary" />
            </div>
            <CardTitle>Калькулятор стоимости услуг</CardTitle>
          </div>
          <CardDescription>
            Выберите необходимые услуги для расчёта стоимости
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Выберите услуги:</Label>
            <div className="space-y-2">
              {services.map(service => (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedServices.includes(service.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedServices.includes(service.id)
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedServices.includes(service.id) && (
                          <Icon name="Check" size={14} className="text-primary-foreground" />
                        )}
                      </div>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <span className="font-bold">{service.price.toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Скидка:</Label>
            <Select value={discount.toString()} onValueChange={(v) => setDiscount(Number(v))}>
              <SelectTrigger id="discount">
                <SelectValue placeholder="Без скидки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Без скидки</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-6 border-t space-y-3">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium">Итого:</span>
              <span className="text-3xl font-bold text-primary">
                {total.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            {discount > 0 && (
              <p className="text-sm text-muted-foreground text-right">
                Экономия: {((calculateTotal() / (1 - discount/100)) * discount / 100).toLocaleString('ru-RU')} ₽
              </p>
            )}
          </div>

          <Button 
            className="w-full" 
            size="lg"
            disabled={selectedServices.length === 0}
          >
            <Icon name="Calendar" size={20} className="mr-2" />
            Записаться на приём
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
