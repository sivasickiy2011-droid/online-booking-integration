import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { GlassComponent, componentTypes } from './types';

interface ComponentsListProps {
  components: GlassComponent[];
  loading: boolean;
  onEdit: (component: GlassComponent) => void;
  onDelete: (componentId: number) => void;
  selectedIds: number[];
  onToggleSelect: (componentId: number) => void;
}

export default function ComponentsList({
  components,
  loading,
  onEdit,
  onDelete,
  selectedIds,
  onToggleSelect
}: ComponentsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {componentTypes.map(type => {
        const typeComponents = components.filter(c => c.component_type === type.value);
        if (typeComponents.length === 0) return null;

        return (
          <Card key={type.value}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Badge variant="outline">{type.label}</Badge>
                <span className="text-sm text-muted-foreground">
                  {typeComponents.length} компонентов
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {typeComponents.map(comp => (
                  <div
                    key={comp.component_id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selectedIds.includes(comp.component_id!)}
                      onCheckedChange={() => onToggleSelect(comp.component_id!)}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{comp.component_name}</div>
                      {comp.article && (
                        <div className="text-sm text-muted-foreground">
                          Артикул: {comp.article}
                        </div>
                      )}
                      {comp.characteristics && (
                        <div className="text-xs text-muted-foreground">
                          {comp.characteristics}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-2">
                        <div className="font-semibold">
                          {comp.price_per_unit.toLocaleString('ru-RU')} ₽
                        </div>
                        <div className="text-xs text-muted-foreground">
                          за {comp.unit}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(comp)}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(comp.component_id!)}
                      >
                        <Icon name="Trash2" size={16} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}