import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PartitionSketch from './PartitionSketch';
import StructureConfigurator, { StructureConfig } from './StructureConfigurator';
import StructureVisualization from './StructureVisualization';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

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
  onUnitChange: (unit: 'mm' | 'cm') => void;
  onPartitionWidthChange: (value: string) => void;
  onPartitionHeightChange: (value: string) => void;
  onDoorWidthChange: (value: string) => void;
  onDoorHeightChange: (value: string) => void;
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
  onUnitChange,
  onPartitionWidthChange,
  onPartitionHeightChange,
  onDoorWidthChange,
  onDoorHeightChange,
  onPartitionCountChange,
  onSectionWidthChange,
  onDimensionBlur,
  convertToMm
}: DimensionInputsProps) {
  const [useAdvancedMode, setUseAdvancedMode] = useState(false);
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
          <StructureVisualization
            config={structureConfig}
            unit={unit}
          />
        </>
      ) : (
        <>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="grid gap-2">
          <Label htmlFor="partitionCount">Количество секций *</Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPartitionCountChange(Math.max(1, partitionCount - 1))}
              className="h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              disabled={partitionCount <= 1}
            >
              −
            </button>
            <Input
              id="partitionCount"
              type="number"
              value={partitionCount}
              onChange={(e) => onPartitionCountChange(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              className="text-center"
              min="1"
              max="10"
            />
            <button
              type="button"
              onClick={() => onPartitionCountChange(Math.min(10, partitionCount + 1))}
              className="h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              disabled={partitionCount >= 10}
            >
              +
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Общая ширина: {partitionWidth} {unit}
          </p>
        </div>
      </div>

      {partitionCount > 1 && (
        <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
          <Label className="mb-3 block text-sm font-semibold text-blue-900">Ширина каждой секции</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {sectionWidths.map((width, index) => (
              <div key={index} className="grid gap-1.5">
                <Label htmlFor={`section-${index}`} className="text-xs text-muted-foreground">
                  Секция {index + 1}
                </Label>
                <Input
                  id={`section-${index}`}
                  type="number"
                  value={width}
                  onChange={(e) => onSectionWidthChange(index, e.target.value)}
                  onBlur={onDimensionBlur}
                  placeholder={unit === 'mm' ? '1000' : '100'}
                  min="1"
                  step={unit === 'mm' ? '1' : '0.1'}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {width && unit === 'mm' ? `${(parseFloat(width) / 10).toFixed(1)} см` : ''}
                  {width && unit === 'cm' ? `${(parseFloat(width) * 10).toFixed(0)} мм` : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasDoor && (
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="doorWidth">Ширина двери *</Label>
            <Input
              id="doorWidth"
              type="number"
              value={doorWidth}
              onChange={(e) => onDoorWidthChange(e.target.value)}
              onBlur={onDimensionBlur}
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
              onChange={(e) => onDoorHeightChange(e.target.value)}
              onBlur={onDimensionBlur}
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

{!useAdvancedMode && (
        <div className="space-y-4">
          <PartitionSketch
            partitionWidth={parseInt(convertToMm(partitionWidth, unit)) || 1000}
            partitionHeight={parseInt(convertToMm(partitionHeight, unit)) || 1900}
            doorWidth={parseInt(convertToMm(doorWidth, unit)) || 0}
            doorHeight={parseInt(convertToMm(doorHeight, unit)) || 0}
            hasDoor={hasDoor}
            partitionCount={partitionCount}
            sectionWidths={sectionWidths.map(w => parseInt(convertToMm(w, unit)) || 0)}
          />

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
      )}
    </div>
  );
}