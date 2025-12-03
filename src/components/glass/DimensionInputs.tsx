import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PartitionSketch from './PartitionSketch';

interface DimensionInputsProps {
  unit: 'mm' | 'cm';
  partitionWidth: string;
  partitionHeight: string;
  doorWidth: string;
  doorHeight: string;
  hasDoor: boolean;
  partitionCount?: number;
  onUnitChange: (unit: 'mm' | 'cm') => void;
  onPartitionWidthChange: (value: string) => void;
  onPartitionHeightChange: (value: string) => void;
  onDoorWidthChange: (value: string) => void;
  onDoorHeightChange: (value: string) => void;
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
  partitionCount = 1,
  onUnitChange,
  onPartitionWidthChange,
  onPartitionHeightChange,
  onDoorWidthChange,
  onDoorHeightChange,
  onDimensionBlur,
  convertToMm
}: DimensionInputsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <Label>Единицы измерения</Label>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="partitionWidth">Ширина изделия *</Label>
          <Input
            id="partitionWidth"
            type="number"
            value={partitionWidth}
            onChange={(e) => onPartitionWidthChange(e.target.value)}
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

      <PartitionSketch
        partitionWidth={parseInt(convertToMm(partitionWidth, unit)) || 1000}
        partitionHeight={parseInt(convertToMm(partitionHeight, unit)) || 1900}
        doorWidth={parseInt(convertToMm(doorWidth, unit)) || 0}
        doorHeight={parseInt(convertToMm(doorHeight, unit)) || 0}
        hasDoor={hasDoor}
        partitionCount={partitionCount}
      />
    </div>
  );
}