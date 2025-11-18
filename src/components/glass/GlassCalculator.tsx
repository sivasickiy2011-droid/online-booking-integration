import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface GlassPackage {
  package_id: number;
  package_name: string;
  product_type: string;
  glass_type: string;
  glass_thickness: number;
  glass_price_per_sqm: number;
  hardware_set: string;
  hardware_price: number;
  markup_percent: number;
  installation_price: number;
  description: string;
}

interface CalculationResult {
  square_meters: number;
  glass_cost: number;
  hardware_cost: number;
  installation_cost: number;
  markup_amount: number;
  total_price: number;
}

export default function GlassCalculator() {
  const [packages, setPackages] = useState<GlassPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<GlassPackage | null>(null);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const API_URL = 'https://functions.poehali.dev/da819482-69ab-4b27-954a-cd7ac2026f30';

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_URL}?action=glass_packages&active_only=true`);
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить комплекты',
        variant: 'destructive'
      });
    }
  };

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find(p => p.package_id === parseInt(packageId));
    setSelectedPackage(pkg || null);
    if (pkg && width && height) {
      calculatePrice(pkg, parseFloat(width), parseFloat(height));
    }
  };

  const handleDimensionChange = () => {
    if (selectedPackage && width && height) {
      const w = parseFloat(width);
      const h = parseFloat(height);
      if (w > 0 && h > 0) {
        calculatePrice(selectedPackage, w, h);
      }
    }
  };

  const calculatePrice = (pkg: GlassPackage, w: number, h: number) => {
    const squareMeters = (w * h) / 10000;
    const glassCost = squareMeters * pkg.glass_price_per_sqm;
    const hardwareCost = pkg.hardware_price;
    const installationCost = pkg.installation_price;
    const subtotal = glassCost + hardwareCost + installationCost;
    const markupAmount = subtotal * (pkg.markup_percent / 100);
    const totalPrice = subtotal + markupAmount;

    setCalculation({
      square_meters: squareMeters,
      glass_cost: glassCost,
      hardware_cost: hardwareCost,
      installation_cost: installationCost,
      markup_amount: markupAmount,
      total_price: totalPrice
    });
  };

  const handleSubmitOrder = async () => {
    if (!selectedPackage || !calculation || !customerName || !customerPhone) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'glass_order',
          order: {
            package_id: selectedPackage.package_id,
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_email: customerEmail,
            width: parseFloat(width),
            height: parseFloat(height),
            square_meters: calculation.square_meters,
            glass_cost: calculation.glass_cost,
            hardware_cost: calculation.hardware_cost,
            installation_cost: calculation.installation_cost,
            markup_amount: calculation.markup_amount,
            total_price: calculation.total_price,
            notes
          }
        })
      });

      if (response.ok) {
        toast({
          title: 'Заказ отправлен',
          description: 'Мы свяжемся с вами в ближайшее время'
        });
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setNotes('');
        setWidth('');
        setHeight('');
        setCalculation(null);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заказ',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Blocks" size={32} className="text-primary" />
          </div>
          <CardTitle className="text-2xl">Калькулятор Стеклянных изделий</CardTitle>
          <CardDescription>
            Рассчитайте стоимость душевой кабины, двери или перегородки
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="package">Выберите комплект *</Label>
              <Select onValueChange={handlePackageChange}>
                <SelectTrigger id="package">
                  <SelectValue placeholder="Выберите тип изделия и комплектацию" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map(pkg => (
                    <SelectItem key={pkg.package_id} value={pkg.package_id.toString()}>
                      {pkg.package_name} - {pkg.glass_type} {pkg.glass_thickness}мм
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPackage && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Тип стекла:</span>
                    <span className="font-medium">{selectedPackage.glass_type} {selectedPackage.glass_thickness}мм</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Фурнитура:</span>
                    <span className="font-medium">{selectedPackage.hardware_set}</span>
                  </div>
                  {selectedPackage.description && (
                    <p className="text-muted-foreground text-xs pt-2">{selectedPackage.description}</p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="width">Ширина (мм) *</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  onBlur={handleDimensionChange}
                  placeholder="1000"
                  min="100"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="height">Высота (мм) *</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  onBlur={handleDimensionChange}
                  placeholder="2000"
                  min="100"
                />
              </div>
            </div>
          </div>

          {calculation && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Расчёт стоимости</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Площадь:</span>
                  <span className="font-medium">{calculation.square_meters.toFixed(2)} м²</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Стоимость стекла:</span>
                  <span className="font-medium">{calculation.glass_cost.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Фурнитура:</span>
                  <span className="font-medium">{calculation.hardware_cost.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Монтаж:</span>
                  <span className="font-medium">{calculation.installation_cost.toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Наценка ({selectedPackage?.markup_percent}%):</span>
                  <span className="font-medium">{calculation.markup_amount.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-semibold">Итого:</span>
                  <span className="text-2xl font-bold text-primary">
                    {calculation.total_price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {calculation && (
            <>
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Оформить заказ</h3>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Ваше имя *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Иван Иванов"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="mail@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Комментарий</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Дополнительные пожелания..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleSubmitOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  <>
                    <Icon name="Send" size={16} className="mr-2" />
                    Отправить заявку
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
