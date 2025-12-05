import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  const [filterType, setFilterType] = useState<string>('all');
  const [filterArticle, setFilterArticle] = useState<string>('');
  const [filterName, setFilterName] = useState<string>('');

  const filteredComponents = useMemo(() => {
    return components.filter(comp => {
      if (filterType !== 'all' && comp.component_type !== filterType) return false;
      if (filterArticle && !comp.article?.toLowerCase().includes(filterArticle.toLowerCase())) return false;
      if (filterName && !comp.component_name.toLowerCase().includes(filterName.toLowerCase())) return false;
      return true;
    });
  }, [components, filterType, filterArticle, filterName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Тип компонента</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  {componentTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Артикул</label>
              <Input
                placeholder="Поиск по артикулу..."
                value={filterArticle}
                onChange={(e) => setFilterArticle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Наименование</label>
              <Input
                placeholder="Поиск по названию..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />
            </div>
          </div>

          {(filterType !== 'all' || filterArticle || filterName) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setFilterType('all');
                setFilterArticle('');
                setFilterName('');
              }}
            >
              <Icon name="X" size={16} className="mr-2" />
              Сбросить фильтры
            </Button>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {componentTypes.map(type => {
          const typeComponents = filteredComponents.filter(c => c.component_type === type.value);
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
                    {comp.image_url && (
                      <img
                        src={comp.image_url}
                        alt={comp.component_name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    )}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{comp.component_name}</div>
                        {comp.packages_count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {comp.packages_count} компл.
                          </Badge>
                        )}
                      </div>
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
    </div>
  );
}