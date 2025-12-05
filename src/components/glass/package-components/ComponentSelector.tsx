import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { GlassComponent } from '../types';

interface ComponentSelectorProps {
  availableComponents: GlassComponent[];
  selectedComponentId: number | null;
  quantity: number;
  isRequired: boolean;
  loading: boolean;
  label: string;
  onComponentSelect: (id: number) => void;
  onQuantityChange: (qty: number) => void;
  onRequiredChange: (required: boolean) => void;
  onAdd: () => void;
}

export default function ComponentSelector({
  availableComponents,
  selectedComponentId,
  quantity,
  isRequired,
  loading,
  label,
  onComponentSelect,
  onQuantityChange,
  onRequiredChange,
  onAdd
}: ComponentSelectorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Label>{label}</Label>
            <Select
              value={selectedComponentId?.toString()}
              onValueChange={(val) => onComponentSelect(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите компонент" />
              </SelectTrigger>
              <SelectContent>
                {availableComponents.map(comp => (
                  <SelectItem key={comp.component_id} value={comp.component_id!.toString()}>
                    {comp.component_name} ({comp.article || 'без артикула'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-32">
            <Label>Количество</Label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={quantity}
              onChange={(e) => onQuantityChange(parseFloat(e.target.value) || 1)}
            />
          </div>
          <div className="flex items-end">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isRequired}
                onCheckedChange={(checked) => onRequiredChange(checked as boolean)}
              />
              <Label className="text-sm">Обязательный</Label>
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={onAdd} disabled={loading}>
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
