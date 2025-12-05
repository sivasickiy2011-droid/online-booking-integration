import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { CalculationResult } from './GlassCalculatorTypes';

interface CalculationResultCardProps {
  calculation: CalculationResult;
  onSubmitOrder: (customerName: string, customerPhone: string, customerEmail: string, notes: string) => Promise<void>;
}

export default function CalculationResultCard({ 
  calculation, 
  onSubmitOrder 
}: CalculationResultCardProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmitOrder(customerName, customerPhone, customerEmail, notes);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setNotes('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Icon name="Calculator" size={20} />
          Расчет стоимости
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          {calculation.partition_area && calculation.partition_area > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Площадь изделия:</span>
                <span className="font-medium">{calculation.partition_area.toFixed(2)} м²</span>
              </div>
              {calculation.door_area && calculation.door_area > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="pl-4">↳ в т.ч. дверь:</span>
                  <span>{calculation.door_area.toFixed(2)} м²</span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Площадь стекла:</span>
            <span className="font-bold">{calculation.square_meters.toFixed(2)} м²</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Материалы и фурнитура:</span>
            <span className="font-medium">{(calculation.components_total * (1 + calculation.markup_amount / calculation.subtotal)).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Работы и доставка:</span>
            <span className="font-medium">{(calculation.services_total * (1 + calculation.markup_amount / calculation.subtotal)).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</span>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between text-lg font-bold">
            <span>ИТОГО:</span>
            <span className="text-primary">{calculation.total_price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</span>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="customerName">Ваше имя *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Иван Иванов"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerPhone">Телефон *</Label>
              <Input
                id="customerPhone"
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+7 (999) 123-45-67"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="ivan@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Комментарий</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Дополнительные пожелания или вопросы"
                rows={3}
              />
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                <Icon name="Send" size={20} className="mr-2" />
                Отправить заявку
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}