import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { SavedCalculation } from './GlassCalculatorTypes';

interface SavedCalculationsListProps {
  savedCalculations: SavedCalculation[];
  showSaved: boolean;
  onLoadCalculation: (saved: SavedCalculation) => void;
  onDeleteCalculation: (id: string) => void;
}

export default function SavedCalculationsList({
  savedCalculations,
  showSaved,
  onLoadCalculation,
  onDeleteCalculation
}: SavedCalculationsListProps) {
  if (!showSaved || savedCalculations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Сохранённые расчёты</CardTitle>
        <CardDescription>Сравните разные варианты комплектации</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {savedCalculations.map((saved) => (
          <div
            key={saved.id}
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold">{saved.package_name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(saved.timestamp!).toLocaleString('ru-RU')}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onLoadCalculation(saved)}
                >
                  <Icon name="Upload" size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteCalculation(saved.id)}
                >
                  <Icon name="Trash2" size={14} />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Размеры:</span> {saved.partition_width}×{saved.partition_height} мм
              </div>
              {saved.door_width && (
                <div>
                  <span className="text-muted-foreground">Дверь:</span> {saved.door_width}×{saved.door_height} мм
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Площадь:</span> {saved.square_meters.toFixed(2)} м²
              </div>
              <div className="font-bold text-primary">
                {saved.total_price.toLocaleString('ru-RU')} ₽
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
