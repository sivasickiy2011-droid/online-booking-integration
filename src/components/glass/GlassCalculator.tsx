import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { GlassPackage, CalculationResult } from './GlassCalculatorTypes';
import PackageDetails from './PackageDetails';
import CalculationResultCard from './CalculationResultCard';

export default function GlassCalculator() {
  const [packages, setPackages] = useState<GlassPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<GlassPackage | null>(null);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<number, number>>({});
  const [expandedComponents, setExpandedComponents] = useState<Record<number, boolean>>({});
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
    setExpandedComponents(prev => ({
      ...prev,
      [mainComponentId]: false
    }));
    if (selectedPackage && width && height) {
      calculatePrice(selectedPackage, parseFloat(width), parseFloat(height));
    }
  };

  const toggleComponentExpand = (componentId: number) => {
    setExpandedComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
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

  const handleSubmitOrder = async (customerName: string, customerPhone: string, customerEmail: string, notes: string) => {
    if (!selectedPackage || !calculation || !customerName || !customerPhone) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      throw new Error('Missing required fields');
    }

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
        setWidth('');
        setHeight('');
        setCalculation(null);
      } else {
        throw new Error('Failed to submit order');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить заказ',
        variant: 'destructive'
      });
      throw error;
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
                      {pkg.package_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPackage && (
              <PackageDetails
                selectedPackage={selectedPackage}
                selectedAlternatives={selectedAlternatives}
                expandedComponents={expandedComponents}
                onAlternativeSelect={handleAlternativeSelect}
                onToggleExpand={toggleComponentExpand}
              />
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
            <CalculationResultCard
              calculation={calculation}
              onSubmitOrder={handleSubmitOrder}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
