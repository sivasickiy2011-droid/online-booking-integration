import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

interface GlassComponent {
  component_id?: number;
  component_name: string;
  component_type: string;
  article: string;
  characteristics: string;
  unit: string;
  price_per_unit: number;
  is_active: boolean;
}

const API_URL = 'https://functions.poehali.dev/da819482-69ab-4b27-954a-cd7ac2026f30';

const componentTypes = [
  { value: 'profile', label: 'Профиль' },
  { value: 'tape', label: 'Лента' },
  { value: 'plug', label: 'Заглушка' },
  { value: 'hinge', label: 'Петля' },
  { value: 'axis', label: 'Ось' },
  { value: 'lock', label: 'Замок' },
  { value: 'handle', label: 'Ручка' },
  { value: 'glass', label: 'Стекло' },
  { value: 'service', label: 'Услуга' },
  { value: 'other', label: 'Другое' }
];

const units = ['шт', 'погм', 'м²', 'услуга', 'м', 'кг', 'л'];

export default function GlassComponentManager() {
  const [components, setComponents] = useState<GlassComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<GlassComponent>({
    component_name: '',
    component_type: 'profile',
    article: '',
    characteristics: '',
    unit: 'шт',
    price_per_unit: 0,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=glass_components`);
      const data = await response.json();
      setComponents(data.components || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить компоненты',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingComponent({
      component_name: '',
      component_type: 'profile',
      article: '',
      characteristics: '',
      unit: 'шт',
      price_per_unit: 0,
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (component: GlassComponent) => {
    setEditingComponent({ ...component });
    setDialogOpen(true);
  };

  const getTypeLabel = (type: string) => {
    return componentTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">База компонентов</h2>
          <p className="text-sm text-muted-foreground">
            Управление материалами, фурнитурой и услугами
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Icon name="Plus" size={16} className="mr-2" />
          Добавить компонент
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
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
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
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
                        <div className="flex items-center gap-4">
                          <div className="text-right">
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
                            onClick={() => handleEdit(comp)}
                          >
                            <Icon name="Edit" size={16} />
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
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingComponent.component_id ? 'Редактировать' : 'Добавить'} компонент
            </DialogTitle>
            <DialogDescription>
              Заполните информацию о компоненте фурнитуры или услуге
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="component_name">Название *</Label>
              <Input
                id="component_name"
                value={editingComponent.component_name}
                onChange={(e) => setEditingComponent({ ...editingComponent, component_name: e.target.value })}
                placeholder="Профиль к-т"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="component_type">Тип *</Label>
                <Select
                  value={editingComponent.component_type}
                  onValueChange={(value) => setEditingComponent({ ...editingComponent, component_type: value })}
                >
                  <SelectTrigger id="component_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {componentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="article">Артикул</Label>
                <Input
                  id="article"
                  value={editingComponent.article}
                  onChange={(e) => setEditingComponent({ ...editingComponent, article: e.target.value })}
                  placeholder="6100-АД31 Т1"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="characteristics">Характеристики</Label>
              <Textarea
                id="characteristics"
                value={editingComponent.characteristics}
                onChange={(e) => setEditingComponent({ ...editingComponent, characteristics: e.target.value })}
                placeholder="40, 2-е крышки Серебро матовое"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price_per_unit">Цена за единицу *</Label>
                <Input
                  id="price_per_unit"
                  type="number"
                  step="0.01"
                  value={editingComponent.price_per_unit}
                  onChange={(e) => setEditingComponent({ ...editingComponent, price_per_unit: parseFloat(e.target.value) || 0 })}
                  placeholder="700.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="unit">Единица измерения *</Label>
                <Select
                  value={editingComponent.unit}
                  onValueChange={(value) => setEditingComponent({ ...editingComponent, unit: value })}
                >
                  <SelectTrigger id="unit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => {
              toast({
                title: 'Функция в разработке',
                description: 'Сохранение компонентов будет доступно после обновления API'
              });
            }}>
              <Icon name="Save" size={16} className="mr-2" />
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
