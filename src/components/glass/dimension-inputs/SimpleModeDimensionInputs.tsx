import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SimpleModeDimensionInputsProps {
  unit: 'mm' | 'cm';
  partitionWidth: string;
  partitionHeight: string;
  doorWidth: string;
  doorHeight: string;
  hasDoor: boolean;
  onPartitionWidthChange: (value: string) => void;
  onPartitionHeightChange: (value: string) => void;
  onDoorWidthChange: (value: string) => void;
  onDoorHeightChange: (value: string) => void;
  onSectionWidthChange: (index: number, value: string) => void;
  onDimensionBlur: () => void;
  convertToMm: (value: string, fromUnit: 'mm' | 'cm') => string;
  getMaxDoorWidth: () => number;
  getMaxDoorHeight: () => number;
  validateDoorWidth: (value: string) => boolean;
  validateDoorHeight: (value: string) => boolean;
}

export default function SimpleModeDimensionInputs({
  unit,
  partitionWidth,
  partitionHeight,
  doorWidth,
  doorHeight,
  hasDoor,
  onPartitionWidthChange,
  onPartitionHeightChange,
  onDoorWidthChange,
  onDoorHeightChange,
  onSectionWidthChange,
  onDimensionBlur,
  convertToMm,
  getMaxDoorWidth,
  getMaxDoorHeight,
  validateDoorWidth,
  validateDoorHeight
}: SimpleModeDimensionInputsProps) {
  return (
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
        </div>
      )}
    </>
  );
}
