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
import PartitionSketch from './PartitionSketch';

export default function GlassCalculator() {
  const [packages, setPackages] = useState<GlassPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<GlassPackage | null>(null);
  const [partitionWidth, setPartitionWidth] = useState<string>('');
  const [partitionHeight, setPartitionHeight] = useState<string>('1900');
  const [doorWidth, setDoorWidth] = useState<string>('');
  const [doorHeight, setDoorHeight] = useState<string>('');
  const [unit, setUnit] = useState<'mm' | 'cm'>('mm');
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

  const convertToMm = (value: string, fromUnit: 'mm' | 'cm'): string => {
    if (!value) return '';
    const num = parseFloat(value);
    return fromUnit === 'cm' ? (num * 10).toString() : value;
  };

  const convertFromMm = (value: string, toUnit: 'mm' | 'cm'): string => {
    if (!value) return '';
    const num = parseFloat(value);
    return toUnit === 'cm' ? (num / 10).toString() : value;
  };

  const handleUnitChange = (newUnit: 'mm' | 'cm') => {
    setUnit(newUnit);
    setPartitionWidth(convertFromMm(convertToMm(partitionWidth, unit), newUnit));
    setPartitionHeight(convertFromMm(convertToMm(partitionHeight, unit), newUnit));
    setDoorWidth(convertFromMm(convertToMm(doorWidth, unit), newUnit));
    setDoorHeight(convertFromMm(convertToMm(doorHeight, unit), newUnit));
  };

  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find(p => p.package_id === parseInt(packageId));
    setSelectedPackage(pkg || null);
    setSelectedAlternatives({});
    
    if (pkg) {
      const defaultHeight = (pkg.default_partition_height || 1900).toString();
      const defaultWidth = (pkg.default_partition_width || 1000).toString();
      setPartitionHeight(convertFromMm(defaultHeight, unit));
      setPartitionWidth(convertFromMm(defaultWidth, unit));
      if (pkg.has_door) {
        const defaultDoorHeight = (pkg.default_door_height || 1900).toString();
        const defaultDoorWidth = (pkg.default_door_width || 800).toString();
        setDoorHeight(convertFromMm(defaultDoorHeight, unit));
        setDoorWidth(convertFromMm(defaultDoorWidth, unit));
      } else {
        setDoorHeight('');
        setDoorWidth('');
      }
    }
    
    if (pkg && partitionWidth && partitionHeight) {
      calculatePrice(pkg);
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
    if (selectedPackage && partitionWidth && partitionHeight) {
      calculatePrice(selectedPackage);
    }
  };

  const toggleComponentExpand = (componentId: number) => {
    setExpandedComponents(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };

  const handleDimensionChange = () => {
    if (selectedPackage && partitionWidth && partitionHeight) {
      const pw = parseFloat(convertToMm(partitionWidth, unit));
      const ph = parseFloat(convertToMm(partitionHeight, unit));
      if (pw > 0 && ph > 0) {
        calculatePrice(selectedPackage);
      }
    }
  };

  const calculatePrice = (pkg: GlassPackage) => {
    const pw = parseFloat(convertToMm(partitionWidth, unit));
    const ph = parseFloat(convertToMm(partitionHeight, unit));
    const dw = doorWidth ? parseFloat(convertToMm(doorWidth, unit)) : 0;
    const dh = doorHeight ? parseFloat(convertToMm(doorHeight, unit)) : 0;
    
    const partitionArea = (pw * ph) / 1000000;
    const doorArea = pkg.has_door && dw > 0 && dh > 0 ? (dw * dh) / 1000000 : 0;
    const totalArea = partitionArea - doorArea;
    const squareMeters = Math.max(totalArea, 0);
    
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
      total_price: totalPrice,
      partition_area: partitionArea,
      door_area: doorArea
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
            partition_width: parseFloat(convertToMm(partitionWidth, unit)),
            partition_height: parseFloat(convertToMm(partitionHeight, unit)),
            door_width: doorWidth ? parseFloat(convertToMm(doorWidth, unit)) : null,
            door_height: doorHeight ? parseFloat(convertToMm(doorHeight, unit)) : null,
            has_door: selectedPackage.has_door,
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
        setPartitionWidth('');
        setPartitionHeight('1900');
        setDoorWidth('');
        setDoorHeight('');
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
              <>
                <PackageDetails
                  selectedPackage={selectedPackage}
                  selectedAlternatives={selectedAlternatives}
                  expandedComponents={expandedComponents}
                  onAlternativeSelect={handleAlternativeSelect}
                  onToggleExpand={toggleComponentExpand}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Единицы измерения</Label>
                    <div className="inline-flex rounded-full bg-muted p-1">
                      <button
                        type="button"
                        onClick={() => handleUnitChange('mm')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          unit === 'mm' 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        мм
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUnitChange('cm')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          unit === 'cm' 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        см
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="partitionWidth">Ширина изделия *</Label>
                      <Input
                        id="partitionWidth"
                        type="number"
                        value={partitionWidth}
                        onChange={(e) => setPartitionWidth(e.target.value)}
                        onBlur={handleDimensionChange}
                        placeholder={unit === 'mm' ? '1000' : '100'}
                        min="1"
                        step={unit === 'mm' ? '1' : '0.1'}
                      />
                      <p className="text-xs text-muted-foreground">
                        {partitionWidth && unit === 'mm' ? `(${(parseFloat(partitionWidth) / 10).toFixed(1)} см)` : ''}
                        {partitionWidth && unit === 'cm' ? `(${(parseFloat(partitionWidth) * 10).toFixed(0)} мм)` : ''}
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="partitionHeight">Высота изделия *</Label>
                      <Input
                        id="partitionHeight"
                        type="number"
                        value={partitionHeight}
                        onChange={(e) => setPartitionHeight(e.target.value)}
                        onBlur={handleDimensionChange}
                        placeholder={unit === 'mm' ? '1900' : '190'}
                        min="1"
                        step={unit === 'mm' ? '1' : '0.1'}
                      />
                      <p className="text-xs text-muted-foreground">
                        {partitionHeight && unit === 'mm' ? `(${(parseFloat(partitionHeight) / 10).toFixed(1)} см)` : ''}
                        {partitionHeight && unit === 'cm' ? `(${(parseFloat(partitionHeight) * 10).toFixed(0)} мм)` : ''}
                      </p>
                    </div>
                  </div>

                  {selectedPackage.has_door && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="doorWidth">Ширина двери *</Label>
                        <Input
                          id="doorWidth"
                          type="number"
                          value={doorWidth}
                          onChange={(e) => setDoorWidth(e.target.value)}
                          onBlur={handleDimensionChange}
                          placeholder={unit === 'mm' ? '800' : '80'}
                          min="1"
                          step={unit === 'mm' ? '1' : '0.1'}
                        />
                        <p className="text-xs text-muted-foreground">
                          {doorWidth && unit === 'mm' ? `(${(parseFloat(doorWidth) / 10).toFixed(1)} см)` : ''}
                          {doorWidth && unit === 'cm' ? `(${(parseFloat(doorWidth) * 10).toFixed(0)} мм)` : ''}
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="doorHeight">Высота двери *</Label>
                        <Input
                          id="doorHeight"
                          type="number"
                          value={doorHeight}
                          onChange={(e) => setDoorHeight(e.target.value)}
                          onBlur={handleDimensionChange}
                          placeholder={unit === 'mm' ? '1900' : '190'}
                          min="1"
                          step={unit === 'mm' ? '1' : '0.1'}
                        />
                        <p className="text-xs text-muted-foreground">
                          {doorHeight && unit === 'mm' ? `(${(parseFloat(doorHeight) / 10).toFixed(1)} см)` : ''}
                          {doorHeight && unit === 'cm' ? `(${(parseFloat(doorHeight) * 10).toFixed(0)} мм)` : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  <PartitionSketch
                    partitionWidth={parseInt(convertToMm(partitionWidth, unit)) || 1000}
                    partitionHeight={parseInt(convertToMm(partitionHeight, unit)) || 1900}
                    doorWidth={parseInt(convertToMm(doorWidth, unit)) || 0}
                    doorHeight={parseInt(convertToMm(doorHeight, unit)) || 0}
                    hasDoor={selectedPackage.has_door || false}
                  />
                </div>
              </>
            )}
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