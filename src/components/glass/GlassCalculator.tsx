import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface GlassComponent {
  component_id: number;
  component_name: string;
  component_type: string;
  article: string;
  characteristics: string;
  unit: string;
  price_per_unit: number;
  quantity: number;
  is_required: boolean;
  alternatives?: GlassComponent[];
}

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
  components?: GlassComponent[];
}

interface CalculationResult {
  square_meters: number;
  components_total: number;
  services_total: number;
  subtotal: number;
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
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<number, number>>({});
  const { toast } = useToast();

  const API_URL = 'https://functions.poehali.dev/ea1cedae-dffe-4589-a9c8-05fcc5e540be';

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_URL}?action=glass_packages&active_only=true&with_components=true`);
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
    setSelectedAlternatives({});
    if (pkg && width && height) {
      calculatePrice(pkg, parseFloat(width), parseFloat(height));
    }
  };

  const handleAlternativeSelect = (mainComponentId: number, alternativeId: number) => {
    setSelectedAlternatives(prev => ({
      ...prev,
      [mainComponentId]: alternativeId
    }));
    if (selectedPackage && width && height) {
      calculatePrice(selectedPackage, parseFloat(width), parseFloat(height));
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
    
    let componentsTotal = 0;
    let servicesTotal = 0;
    
    if (pkg.components && pkg.components.length > 0) {
      pkg.components.forEach(comp => {
        if (comp.is_required) {
          const selectedAltId = selectedAlternatives[comp.component_id];
          const activeComponent = selectedAltId 
            ? comp.alternatives?.find(alt => alt.component_id === selectedAltId) || comp
            : comp;
          
          const quantity = activeComponent.unit === 'м²' ? squareMeters : comp.quantity;
          const cost = quantity * activeComponent.price_per_unit;
          
          if (activeComponent.component_type === 'service') {
            servicesTotal += cost;
          } else {
            componentsTotal += cost;
          }
        }
      });
    } else {
      const glassCost = squareMeters * pkg.glass_price_per_sqm;
      componentsTotal = glassCost + pkg.hardware_price;
      servicesTotal = pkg.installation_price;
    }
    
    const subtotal = componentsTotal + servicesTotal;
    const markupAmount = subtotal * (pkg.markup_percent / 100);
    const totalPrice = subtotal + markupAmount;

    setCalculation({
      square_meters: squareMeters,
      components_total: componentsTotal,
      services_total: servicesTotal,
      subtotal: subtotal,
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
            glass_cost: calculation.components_total,
            hardware_cost: 0,
            installation_cost: calculation.services_total,
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

  const getComponentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      profile: 'Профиль',
      tape: 'Лента',
      plug: 'Заглушка',
      hinge: 'Петля',
      axis: 'Ось',
      lock: 'Замок',
      handle: 'Ручка',
      glass: 'Стекло',
      service: 'Услуга',
      glass_note: 'Примечание'
    };
    return labels[type] || type;
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
                      {pkg.package_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPackage && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Тип стекла:</span>
                    <span className="font-medium">{selectedPackage.glass_type} {selectedPackage.glass_thickness}мм</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Фурнитура:</span>
                    <span className="font-medium">{selectedPackage.hardware_set}</span>
                  </div>
                  {selectedPackage.description && (
                    <p className="text-muted-foreground text-xs pt-2 border-t">{selectedPackage.description}</p>
                  )}
                  
                  {selectedPackage.components && selectedPackage.components.length > 0 && (
                    <div className="pt-3 border-t space-y-2">
                      <div className="font-medium text-foreground mb-2">Состав комплекта:</div>
                      {selectedPackage.components.map((comp, idx) => {
                        const selectedAltId = selectedAlternatives[comp.component_id];
                        const activeComponent = selectedAltId 
                          ? comp.alternatives?.find(alt => alt.component_id === selectedAltId) || comp
                          : comp;
                        const hasAlternatives = comp.alternatives && comp.alternatives.length > 0;
                        
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="grid grid-cols-12 gap-2 text-xs py-1">
                              <div className="col-span-1 text-muted-foreground text-right">{idx + 1}.</div>
                              <div className="col-span-7">
                                <div className="font-medium">{activeComponent.component_name}</div>
                                {activeComponent.article && <div className="text-muted-foreground">[{activeComponent.article}]</div>}
                                {activeComponent.characteristics && (
                                  <div className="text-muted-foreground text-[10px]">{activeComponent.characteristics}</div>
                                )}
                              </div>
                              <div className="col-span-2 text-right text-muted-foreground">
                                {comp.quantity} {activeComponent.unit}
                              </div>
                              <div className="col-span-2 text-right font-medium">
                                {activeComponent.price_per_unit.toLocaleString('ru-RU')} ₽
                              </div>
                            </div>
                            {hasAlternatives && (
                              <div className="ml-8 space-y-1 mt-2">
                                <div className="text-[10px] text-muted-foreground mb-1">Доступные варианты:</div>
                                <div 
                                  className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors ${
                                    !selectedAltId ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-accent'
                                  }`}
                                  onClick={() => handleAlternativeSelect(comp.component_id, comp.component_id)}
                                >
                                  <div className="mt-0.5">
                                    {!selectedAltId ? (
                                      <Icon name="CheckCircle2" size={14} className="text-primary" />
                                    ) : (
                                      <Icon name="Circle" size={14} className="text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 text-xs">
                                    <div className="font-medium">{comp.component_name}</div>
                                    <div className="text-muted-foreground text-[10px]">{comp.article}</div>
                                  </div>
                                  <div className="text-xs font-medium whitespace-nowrap">
                                    {comp.price_per_unit.toLocaleString('ru-RU')} ₽
                                  </div>
                                </div>
                                {comp.alternatives?.map(alt => (
                                  <div 
                                    key={alt.component_id}
                                    className={`flex items-start gap-2 p-2 rounded border cursor-pointer transition-colors ${
                                      selectedAltId === alt.component_id ? 'bg-primary/10 border-primary' : 'bg-background hover:bg-accent'
                                    }`}
                                    onClick={() => handleAlternativeSelect(comp.component_id, alt.component_id)}
                                  >
                                    <div className="mt-0.5">
                                      {selectedAltId === alt.component_id ? (
                                        <Icon name="CheckCircle2" size={14} className="text-primary" />
                                      ) : (
                                        <Icon name="Circle" size={14} className="text-muted-foreground" />
                                      )}
                                    </div>
                                    <div className="flex-1 text-xs">
                                      <div className="font-medium">{alt.component_name}</div>
                                      <div className="text-muted-foreground text-[10px]">{alt.article}</div>
                                    </div>
                                    <div className="text-xs font-medium whitespace-nowrap">
                                      {alt.price_per_unit.toLocaleString('ru-RU')} ₽
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
                  placeholder="3300"
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
                  placeholder="2820"
                  min="100"
                />
              </div>
            </div>
          </div>

          {calculation && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Calculator" size={20} />
                  Расчет стоимости
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Площадь:</span>
                    <span className="font-medium">{calculation.square_meters.toFixed(2)} м²</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Материалы и фурнитура:</span>
                    <span className="font-medium">{calculation.components_total.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Услуги:</span>
                    <span className="font-medium">{calculation.services_total.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} ₽</span>
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
                    onClick={handleSubmitOrder} 
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}