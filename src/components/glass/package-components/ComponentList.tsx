import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { PackageComponent, GlassComponent } from '../types';

interface ComponentListProps {
  components: PackageComponent[];
  availableComponents: GlassComponent[];
  onRemove: (id: number) => void;
  onAddAlternative: (componentId: number, alternativeId: number) => void;
}

export default function ComponentList({
  components,
  availableComponents,
  onRemove,
  onAddAlternative
}: ComponentListProps) {
  if (components.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icon name="Package" size={48} className="mx-auto mb-2 opacity-50" />
        <p>Компоненты не добавлены</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {components.map((comp) => (
          <Card key={comp.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{comp.component_name}</h4>
                    {comp.is_required ? (
                      <Badge variant="default" className="text-xs">Обязательный</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Опциональный</Badge>
                    )}
                  </div>
                  {comp.article && (
                    <p className="text-sm text-muted-foreground">Артикул: {comp.article}</p>
                  )}
                  {comp.characteristics && (
                    <p className="text-sm text-muted-foreground">{comp.characteristics}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">
                      Количество: <strong>{comp.quantity} {comp.unit}</strong>
                    </span>
                    <span className="text-muted-foreground">
                      Цена: <strong>{comp.price_per_unit.toLocaleString('ru-RU')} ₽/{comp.unit}</strong>
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(comp.id)}
                >
                  <Icon name="Trash2" size={16} className="text-destructive" />
                </Button>
              </div>

              {comp.alternatives && comp.alternatives.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">
                    Аналоги ({comp.alternatives.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {comp.alternatives.map((alt) => (
                      <Badge key={alt.component_id} variant="outline" className="text-xs">
                        {alt.component_name}
                        {alt.price_per_unit !== comp.price_per_unit && (
                          <span className={`ml-1 ${alt.price_per_unit > comp.price_per_unit ? 'text-red-600' : 'text-green-600'}`}>
                            ({alt.price_per_unit > comp.price_per_unit ? '+' : ''}{(alt.price_per_unit - comp.price_per_unit).toLocaleString('ru-RU')} ₽)
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-3 pt-3 border-t">
                <details className="cursor-pointer">
                  <summary className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                    + Добавить аналог
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableComponents
                      .filter(c => 
                        c.component_id !== comp.component_id && 
                        c.unit === comp.unit &&
                        !comp.alternatives?.some(alt => alt.component_id === c.component_id)
                      )
                      .map(alt => (
                        <Button
                          key={alt.component_id}
                          variant="outline"
                          size="sm"
                          onClick={() => onAddAlternative(comp.component_id, alt.component_id!)}
                          className="text-xs"
                        >
                          <Icon name="Plus" size={12} className="mr-1" />
                          {alt.component_name}
                        </Button>
                      ))}
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
