import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PartitionSketch from './PartitionSketch';
import FrontView from './sketch/FrontView';
import TopView from './sketch/TopView';
import StructureConfigurator, { StructureConfig } from './StructureConfigurator';
import Structure3DView from './Structure3DView';
import StructureTopView from './StructureTopView';
import SimpleModeDoorSketch from './SimpleModeDoorSketch';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

import { CalculationResult } from './GlassCalculatorTypes';

interface DimensionInputsProps {
  unit: 'mm' | 'cm';
  partitionWidth: string;
  partitionHeight: string;
  doorWidth: string;
  doorHeight: string;
  hasDoor: boolean;
  partitionCount: number;
  sectionWidths: string[];
  calculation: CalculationResult | null;
  doorPosition?: 'left' | 'center' | 'right';
  doorOffset?: string;
  doorPanels?: 1 | 2;
  onUnitChange: (unit: 'mm' | 'cm') => void;
  onPartitionWidthChange: (value: string) => void;
  onPartitionHeightChange: (value: string) => void;
  onDoorWidthChange: (value: string) => void;
  onDoorHeightChange: (value: string) => void;
  onDoorPositionChange?: (value: 'left' | 'center' | 'right') => void;
  onDoorOffsetChange?: (value: string) => void;
  onDoorPanelsChange?: (value: 1 | 2) => void;
  onPartitionCountChange: (value: number) => void;
  onSectionWidthChange: (index: number, value: string) => void;
  onDimensionBlur: () => void;
  convertToMm: (value: string, fromUnit: 'mm' | 'cm') => string;
}

export default function DimensionInputs({
  unit,
  partitionWidth,
  partitionHeight,
  doorWidth,
  doorHeight,
  hasDoor,
  partitionCount,
  sectionWidths,
  calculation,
  doorPosition: externalDoorPosition,
  doorOffset: externalDoorOffset,
  doorPanels: externalDoorPanels,
  onUnitChange,
  onPartitionWidthChange,
  onPartitionHeightChange,
  onDoorWidthChange,
  onDoorHeightChange,
  onDoorPositionChange,
  onDoorOffsetChange,
  onDoorPanelsChange,
  onPartitionCountChange,
  onSectionWidthChange,
  onDimensionBlur,
  convertToMm
}: DimensionInputsProps) {
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);
  const [doorPosition, setDoorPosition] = useState<'left' | 'center' | 'right'>(externalDoorPosition || 'center');
  const [doorLeftOffset, setDoorLeftOffset] = useState<string>(externalDoorOffset || '0');
  const [doorPanels, setDoorPanels] = useState<1 | 2>(externalDoorPanels || 1);

  useEffect(() => {
    if (doorPosition !== 'center' && doorPanels === 2) {
      setDoorPanels(1);
      onDoorPanelsChange?.(1);
    }
  }, [doorPosition, doorPanels, onDoorPanelsChange]);

  // Валидация размеров двери
  const getMaxDoorWidth = () => {
    const pwMm = parseFloat(convertToMm(partitionWidth, unit)) || 0;
    const offsetMm = parseFloat(convertToMm(doorLeftOffset, unit)) || 0;
    return doorPosition === 'left' ? pwMm - offsetMm : pwMm;
  };

  const getMaxDoorHeight = () => {
    return parseFloat(convertToMm(partitionHeight, unit)) || 0;
  };

  const validateDoorWidth = (value: string) => {
    const dwMm = parseFloat(convertToMm(value, unit)) || 0;
    const maxWidth = getMaxDoorWidth();
    if (dwMm > maxWidth && maxWidth > 0) {
      return false;
    }
    return true;
  };

  const validateDoorHeight = (value: string) => {
    const dhMm = parseFloat(convertToMm(value, unit)) || 0;
    const maxHeight = getMaxDoorHeight();
    if (dhMm > maxHeight && maxHeight > 0) {
      return false;
    }
    return true;
  };

  const validateDoorOffset = (value: string) => {
    const offsetMm = parseFloat(convertToMm(value, unit)) || 0;
    const dwMm = parseFloat(convertToMm(doorWidth, unit)) || 0;
    const pwMm = parseFloat(convertToMm(partitionWidth, unit)) || 0;
    if (offsetMm + dwMm > pwMm && pwMm > 0) {
      return false;
    }
    return true;
  };
  const [structureConfig, setStructureConfig] = useState<StructureConfig>({
    height: partitionHeight,
    sections: [{
      id: 'section-1',
      width: partitionWidth,
      type: hasDoor ? 'glass-with-door' : 'glass',
      doorWidth: doorWidth,
    }],
    solidWalls: []
  });

  const handleStructureChange = (config: StructureConfig) => {
    setStructureConfig(config);
    onPartitionHeightChange(config.height);
    
    // Обновляем ширину и количество секций для обратной совместимости
    const totalWidth = config.sections.reduce((sum, s) => {
      const w = parseFloat(s.width) || 0;
      return sum + w;
    }, 0);
    onPartitionWidthChange(totalWidth.toString());
    onPartitionCountChange(config.sections.length);
    
    // Обновляем ширины секций
    config.sections.forEach((section, index) => {
      onSectionWidthChange(index, section.width);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Label>Единицы измерения</Label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={useAdvancedMode ? "default" : "outline"}
            size="sm"
            onClick={() => setUseAdvancedMode(!useAdvancedMode)}
          >
            {useAdvancedMode ? 'Расширенный режим' : 'Простой режим'}
          </Button>
          <div className="inline-flex rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => onUnitChange('mm')}
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
              onClick={() => onUnitChange('cm')}
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
      </div>

      {useAdvancedMode ? (
        <>
          <StructureConfigurator
            unit={unit}
            config={structureConfig}
            onChange={handleStructureChange}
            onBlur={onDimensionBlur}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Structure3DView
              config={structureConfig}
              unit={unit}
            />
            <StructureTopView
              config={structureConfig}
              unit={unit}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="partitionWidth">Ширина изделия *</Label>
              <Input
                id="partitionWidth"
                type="number"
                value={partitionWidth}
                onChange={(e) => {
                  onPartitionWidthChange(e.target.value);
                  onSectionWidthChange(0, e.target.value);
                }}
                onBlur={onDimensionBlur}
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
                onChange={(e) => onPartitionHeightChange(e.target.value)}
                onBlur={onDimensionBlur}
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

      {hasDoor && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="doorWidth">Ширина двери *</Label>
              <Input
                id="doorWidth"
                type="number"
                value={doorWidth}
                onChange={(e) => {
                  onDoorWidthChange(e.target.value);
                }}
                onBlur={onDimensionBlur}
                placeholder={unit === 'mm' ? '800' : '80'}
                min="1"
                max={getMaxDoorWidth() / (unit === 'mm' ? 1 : 10)}
                step={unit === 'mm' ? '1' : '0.1'}
                className={!validateDoorWidth(doorWidth) && doorWidth ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {doorWidth && unit === 'mm' ? `(${(parseFloat(doorWidth) / 10).toFixed(1)} см)` : ''}
                {doorWidth && unit === 'cm' ? `(${(parseFloat(doorWidth) * 10).toFixed(0)} мм)` : ''}
              </p>
              {!validateDoorWidth(doorWidth) && doorWidth && (
                <p className="text-xs text-red-600">
                  ⚠️ Дверь не может быть шире изделия (макс: {Math.floor(getMaxDoorWidth() / (unit === 'mm' ? 1 : 10))} {unit})
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doorHeight">Высота двери *</Label>
              <Input
                id="doorHeight"
                type="number"
                value={doorHeight}
                onChange={(e) => {
                  onDoorHeightChange(e.target.value);
                }}
                onBlur={onDimensionBlur}
                placeholder={unit === 'mm' ? '1900' : '190'}
                min="1"
                max={getMaxDoorHeight() / (unit === 'mm' ? 1 : 10)}
                step={unit === 'mm' ? '1' : '0.1'}
                className={!validateDoorHeight(doorHeight) && doorHeight ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                {doorHeight && unit === 'mm' ? `(${(parseFloat(doorHeight) / 10).toFixed(1)} см)` : ''}
                {doorHeight && unit === 'cm' ? `(${(parseFloat(doorHeight) * 10).toFixed(0)} мм)` : ''}
              </p>
              {!validateDoorHeight(doorHeight) && doorHeight && (
                <p className="text-xs text-red-600">
                  ⚠️ Дверь не может быть выше изделия (макс: {Math.floor(getMaxDoorHeight() / (unit === 'mm' ? 1 : 10))} {unit})
                </p>
              )}
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-muted/50 space-y-4">
            <div className="space-y-3">
              <Label>Позиция двери</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={doorPosition === 'left' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setDoorPosition('left');
                    onDoorPositionChange?.('left');
                  }}
                >
                  Слева
                </Button>
                <Button
                  type="button"
                  variant={doorPosition === 'center' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setDoorPosition('center');
                    setDoorLeftOffset('0');
                    onDoorPositionChange?.('center');
                    onDoorOffsetChange?.('0');
                  }}
                >
                  По центру
                </Button>
                <Button
                  type="button"
                  variant={doorPosition === 'right' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setDoorPosition('right');
                    onDoorPositionChange?.('right');
                  }}
                >
                  Справа
                </Button>
              </div>
            </div>
            
            {(doorPosition === 'left' || doorPosition === 'right') && (
              <div className="grid gap-2">
                <Label htmlFor="doorOffset">Отступ от {doorPosition === 'left' ? 'левого' : 'правого'} края</Label>
                <Input
                  id="doorOffset"
                  type="number"
                  value={doorLeftOffset}
                  onChange={(e) => {
                    setDoorLeftOffset(e.target.value);
                    onDoorOffsetChange?.(e.target.value);
                  }}
                  onBlur={onDimensionBlur}
                  placeholder={unit === 'mm' ? '0' : '0'}
                  min="0"
                  step={unit === 'mm' ? '1' : '0.1'}
                  className={!validateDoorOffset(doorLeftOffset) && doorLeftOffset ? 'border-red-500' : ''}
                />
                <p className="text-xs text-muted-foreground">
                  {doorLeftOffset && unit === 'mm' ? `(${(parseFloat(doorLeftOffset) / 10).toFixed(1)} см)` : ''}
                  {doorLeftOffset && unit === 'cm' ? `(${(parseFloat(doorLeftOffset) * 10).toFixed(0)} мм)` : ''}
                </p>
                {!validateDoorOffset(doorLeftOffset) && doorLeftOffset && (
                  <p className="text-xs text-red-600">
                    ⚠️ Дверь выходит за границы изделия
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <Label>Количество створок</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={doorPanels === 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setDoorPanels(1);
                    onDoorPanelsChange?.(1);
                  }}
                  className="flex-1"
                >
                  Одна створка
                </Button>
                <Button
                  type="button"
                  variant={doorPanels === 2 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setDoorPanels(2);
                    onDoorPanelsChange?.(2);
                  }}
                  className="flex-1"
                  disabled={doorPosition !== 'center'}
                >
                  Две створки
                </Button>
              </div>
              {doorPosition !== 'center' && (
                <p className="text-xs text-amber-600">
                  ℹ️ Две створки доступны только при центральном расположении
                </p>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground">
              ℹ️ Дверь всегда располагается от нижнего края изделия
            </p>
          </div>
        </div>
      )}

          <div className="space-y-4">
            {hasDoor ? (
              <SimpleModeDoorSketch
                partitionWidth={parseFloat(convertToMm(partitionWidth, unit)) || 1000}
                partitionHeight={parseFloat(convertToMm(partitionHeight, unit)) || 1900}
                doorWidth={parseFloat(convertToMm(doorWidth, unit)) || 800}
                doorHeight={parseFloat(convertToMm(doorHeight, unit)) || 1900}
                doorPosition={doorPosition}
                doorOffset={parseFloat(convertToMm(doorLeftOffset, unit)) || 0}
                doorPanels={doorPanels}
                unit={unit}
              />
            ) : (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <FrontView
                      partitionWidth={parseInt(convertToMm(partitionWidth, unit)) || 1000}
                      partitionHeight={parseInt(convertToMm(partitionHeight, unit)) || 1900}
                      doorWidth={0}
                      doorHeight={0}
                      hasDoor={false}
                      doorPosition={doorPosition}
                      doorLeftOffset={0}
                    />
                  </div>
                  <div className="w-48">
                    <TopView
                      partitionWidth={parseInt(convertToMm(partitionWidth, unit)) || 1000}
                      partitionCount={1}
                      sectionWidths={[parseInt(convertToMm(partitionWidth, unit)) || 1000]}
                    />
                  </div>
                </div>
              </div>
            )}

            {calculation && partitionCount > 1 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Стоимость одной секции</div>
                    <div className="text-xl font-bold text-primary">
                      {(calculation.total_price / partitionCount).toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Общая стоимость ({partitionCount} {partitionCount === 1 ? 'секция' : partitionCount < 5 ? 'секции' : 'секций'})</div>
                    <div className="text-xl font-bold text-primary">
                      {calculation.total_price.toLocaleString('ru-RU', { maximumFractionDigits: 0 })} ₽
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}