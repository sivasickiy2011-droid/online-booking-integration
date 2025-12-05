import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { GlassPackage, CalculationResult, SavedCalculation } from './GlassCalculatorTypes';

const API_URL = 'https://functions.poehali.dev/ea1cedae-dffe-4589-a9c8-05fcc5e540be';

export function useCalculatorLogic() {
  const [packages, setPackages] = useState<GlassPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<GlassPackage | null>(null);
  const [partitionWidth, setPartitionWidth] = useState<string>('');
  const [partitionHeight, setPartitionHeight] = useState<string>('1900');
  const [doorWidth, setDoorWidth] = useState<string>('');
  const [doorHeight, setDoorHeight] = useState<string>('');
  const [doorPosition, setDoorPosition] = useState<'left' | 'center' | 'right'>('center');
  const [doorOffset, setDoorOffset] = useState<string>('0');
  const [doorPanels, setDoorPanels] = useState<1 | 2>(1);
  const [partitionCount, setPartitionCount] = useState<number>(1);
  const [sectionWidths, setSectionWidths] = useState<string[]>(['']);
  const [unit, setUnit] = useState<'mm' | 'cm'>('mm');
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<number, number>>({});
  const [expandedComponents, setExpandedComponents] = useState<Record<number, boolean>>({});
  const [selectedOptionalServices, setSelectedOptionalServices] = useState<Set<number>>(new Set());
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
  const [showSaved, setShowSaved] = useState<boolean>(false);
  const [hasLeftWall, setHasLeftWall] = useState<boolean>(false);
  const [hasRightWall, setHasRightWall] = useState<boolean>(false);
  const [hasBackWall, setHasBackWall] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${API_URL}?action=glass_packages&active_only=true&with_components=true`);
      const data = await response.json();
      console.log('Fetched packages:', data);
      setPackages(data.packages || []);
      if (!data.packages || data.packages.length === 0) {
        toast({
          title: 'Нет данных',
          description: 'Шаблоны изделий не найдены. Добавьте шаблоны в личном кабинете.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
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
    setDoorOffset(convertFromMm(convertToMm(doorOffset, unit), newUnit));
    setSectionWidths(sectionWidths.map(w => convertFromMm(convertToMm(w, unit), newUnit)));
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
      const count = pkg.partition_count || 1;
      setPartitionCount(count);
      setSectionWidths(Array(count).fill(convertFromMm(defaultWidth, unit)));
      if (pkg.has_door) {
        const defaultDoorHeight = (pkg.default_door_height || 1900).toString();
        const defaultDoorWidth = (pkg.default_door_width || 800).toString();
        setDoorHeight(convertFromMm(defaultDoorHeight, unit));
        setDoorWidth(convertFromMm(defaultDoorWidth, unit));
        setDoorPosition(pkg.default_door_position || 'center');
        setDoorOffset(convertFromMm((pkg.default_door_offset || 0).toString(), unit));
        setDoorPanels(pkg.default_door_panels || 1);
      } else {
        setDoorHeight('');
        setDoorWidth('');
        setDoorPosition('center');
        setDoorOffset('0');
        setDoorPanels(1);
      }
      
      setHasLeftWall(pkg.has_left_wall ?? false);
      setHasRightWall(pkg.has_right_wall ?? false);
      setHasBackWall(pkg.has_back_wall ?? false);
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

  const handlePartitionCountChange = (newCount: number) => {
    setPartitionCount(newCount);
    const currentWidth = parseFloat(convertToMm(partitionWidth, unit)) || 1000;
    const sectionWidth = currentWidth / newCount;
    setSectionWidths(Array(newCount).fill(convertFromMm(sectionWidth.toString(), unit)));
    if (selectedPackage && partitionHeight) {
      calculatePrice(selectedPackage);
    }
  };

  const handleSectionWidthChange = (index: number, value: string) => {
    const newWidths = [...sectionWidths];
    newWidths[index] = value;
    setSectionWidths(newWidths);
    
    const totalWidth = newWidths
      .filter(w => w && parseFloat(w) > 0)
      .reduce((sum, w) => sum + parseFloat(convertToMm(w, unit)), 0);
    setPartitionWidth(convertFromMm(totalWidth.toString(), unit));
  };

  const calculatePrice = (pkg: GlassPackage) => {
    const totalWidth = sectionWidths
      .filter(w => w && parseFloat(w) > 0)
      .reduce((sum, w) => sum + parseFloat(convertToMm(w, unit)), 0);
    const pw = totalWidth || parseFloat(convertToMm(partitionWidth, unit));
    const ph = parseFloat(convertToMm(partitionHeight, unit));
    const dw = doorWidth ? parseFloat(convertToMm(doorWidth, unit)) : 0;
    const dh = doorHeight ? parseFloat(convertToMm(doorHeight, unit)) : 0;
    
    const partitionArea = (pw * ph) / 1000000;
    const doorArea = pkg.has_door && dw > 0 && dh > 0 ? (dw * dh) / 1000000 : 0;
    // Дверь тоже из стекла, не вычитаем её из площади
    const squareMeters = partitionArea;
    
    let componentsTotal = 0;
    let servicesTotal = 0;
    
    if (pkg.components && pkg.components.length > 0) {
      pkg.components.forEach(comp => {
        // Учитываем компонент если: обязательный ИЛИ выбран необязательный
        const shouldInclude = comp.is_required || selectedOptionalServices.has(comp.component_id);
        
        if (shouldInclude) {
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

  const handleSaveCalculation = () => {
    if (!selectedPackage || !calculation) return;
    
    const saved: SavedCalculation = {
      id: Date.now().toString(),
      name: `Расчёт от ${new Date().toLocaleString('ru-RU')}`,
      timestamp: Date.now(),
      package_name: selectedPackage.package_name,
      partition_width: parseFloat(convertToMm(partitionWidth, unit)),
      partition_height: parseFloat(convertToMm(partitionHeight, unit)),
      door_width: doorWidth ? parseFloat(convertToMm(doorWidth, unit)) : undefined,
      door_height: doorHeight ? parseFloat(convertToMm(doorHeight, unit)) : undefined,
      door_position: doorPosition,
      door_offset: parseFloat(convertToMm(doorOffset, unit)),
      door_panels: doorPanels,
      selected_alternatives: selectedAlternatives,
      ...calculation
    };
    
    setSavedCalculations(prev => [saved, ...prev]);
    toast({
      title: 'Сохранено!',
      description: 'Расчёт добавлен в список для сравнения'
    });
  };

  const handleLoadCalculation = (saved: SavedCalculation) => {
    const pkg = packages.find(p => p.package_name === saved.package_name);
    if (!pkg) return;
    
    setSelectedPackage(pkg);
    setPartitionWidth(convertFromMm(saved.partition_width.toString(), unit));
    setPartitionHeight(convertFromMm(saved.partition_height.toString(), unit));
    if (saved.door_width) setDoorWidth(convertFromMm(saved.door_width.toString(), unit));
    if (saved.door_height) setDoorHeight(convertFromMm(saved.door_height.toString(), unit));
    if (saved.door_position) setDoorPosition(saved.door_position);
    if (saved.door_offset !== undefined) setDoorOffset(convertFromMm(saved.door_offset.toString(), unit));
    if (saved.door_panels) setDoorPanels(saved.door_panels);
    setSelectedAlternatives(saved.selected_alternatives);
    setCalculation(saved);
    
    toast({
      title: 'Загружено',
      description: 'Расчёт восстановлен'
    });
  };

  const handleDeleteCalculation = (id: string) => {
    setSavedCalculations(prev => prev.filter(c => c.id !== id));
    toast({
      title: 'Удалено',
      description: 'Расчёт удалён из списка'
    });
  };

  const toggleOptionalService = (componentId: number) => {
    setSelectedOptionalServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(componentId)) {
        newSet.delete(componentId);
      } else {
        newSet.add(componentId);
      }
      return newSet;
    });
    // Пересчитываем после изменения
    if (selectedPackage && partitionWidth && partitionHeight) {
      setTimeout(() => calculatePrice(selectedPackage), 0);
    }
  };

  return {
    packages,
    selectedPackage,
    partitionWidth,
    setPartitionWidth,
    partitionHeight,
    setPartitionHeight,
    doorWidth,
    setDoorWidth,
    doorHeight,
    setDoorHeight,
    doorPosition,
    setDoorPosition,
    doorOffset,
    setDoorOffset,
    doorPanels,
    setDoorPanels,
    partitionCount,
    setPartitionCount,
    sectionWidths,
    unit,
    calculation,
    selectedAlternatives,
    expandedComponents,
    selectedOptionalServices,
    savedCalculations,
    showSaved,
    setShowSaved,
    hasLeftWall,
    setHasLeftWall,
    hasRightWall,
    setHasRightWall,
    hasBackWall,
    setHasBackWall,
    convertToMm,
    handleUnitChange,
    handlePackageChange,
    handleAlternativeSelect,
    toggleComponentExpand,
    toggleOptionalService,
    handleDimensionChange,
    handleSubmitOrder,
    handleSaveCalculation,
    handleLoadCalculation,
    handleDeleteCalculation,
    handlePartitionCountChange,
    handleSectionWidthChange
  };
}