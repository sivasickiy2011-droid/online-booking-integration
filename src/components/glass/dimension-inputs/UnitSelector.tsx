import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface UnitSelectorProps {
  unit: 'mm' | 'cm';
  useAdvancedMode: boolean;
  onUnitChange: (unit: 'mm' | 'cm') => void;
  onModeToggle: () => void;
}

export default function UnitSelector({
  unit,
  useAdvancedMode,
  onUnitChange,
  onModeToggle
}: UnitSelectorProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <Label>Единицы измерения</Label>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant={useAdvancedMode ? "default" : "outline"}
          size="sm"
          onClick={onModeToggle}
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
  );
}
