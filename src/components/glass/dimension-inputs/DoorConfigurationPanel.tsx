import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MiniDoorPreview from '../MiniDoorPreview';

interface DoorConfigurationPanelProps {
  unit: 'mm' | 'cm';
  doorPosition: 'left' | 'center' | 'right';
  doorLeftOffset: string;
  doorPanels: 1 | 2;
  doorWidth: string;
  doorHeight: string;
  partitionHeight: string;
  setDoorPosition: (value: 'left' | 'center' | 'right') => void;
  setDoorLeftOffset: (value: string) => void;
  setDoorPanels: (value: 1 | 2) => void;
  onDoorPositionChange?: (value: 'left' | 'center' | 'right') => void;
  onDoorOffsetChange?: (value: string) => void;
  onDoorPanelsChange?: (value: 1 | 2) => void;
  onDimensionBlur: () => void;
  convertToMm: (value: string, fromUnit: 'mm' | 'cm') => string;
  validateDoorOffset: (value: string) => boolean;
}

export default function DoorConfigurationPanel({
  unit,
  doorPosition,
  doorLeftOffset,
  doorPanels,
  doorWidth,
  doorHeight,
  partitionHeight,
  setDoorPosition,
  setDoorLeftOffset,
  setDoorPanels,
  onDoorPositionChange,
  onDoorOffsetChange,
  onDoorPanelsChange,
  onDimensionBlur,
  convertToMm,
  validateDoorOffset
}: DoorConfigurationPanelProps) {
  return (
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
      
      <MiniDoorPreview
        doorPosition={doorPosition}
        doorPanels={doorPanels}
        doorHeightPercent={doorHeight && partitionHeight ? (parseFloat(convertToMm(doorHeight, unit)) / parseFloat(convertToMm(partitionHeight, unit)) * 100) : 85}
      />
    </div>
  );
}
