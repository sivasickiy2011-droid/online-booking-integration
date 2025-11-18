import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { GlassComponent, PackageComponent, API_URL } from './types';

interface PackageComponentsEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: number;
  packageName: string;
  onSave: () => void;
}

export default function PackageComponentsEditDialog({
  open,
  onOpenChange,
  packageId,
  packageName,
  onSave
}: PackageComponentsEditDialogProps) {
  const [components, setComponents] = useState<PackageComponent[]>([]);
  const [allComponents, setAllComponents] = useState<GlassComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isRequired, setIsRequired] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, packageId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [componentsRes, allComponentsRes] = await Promise.all([
        fetch(`${API_URL}?action=package_components&package_id=${packageId}`),
        fetch(`${API_URL}?action=glass_components`)
      ]);

      const componentsData = await componentsRes.json();
      const allComponentsData = await allComponentsRes.json();

      setComponents(componentsData.components || []);
      setAllComponents(allComponentsData.components || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddComponent = async () => {
    if (!selectedComponentId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите компонент',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'package_component',
          action_type: 'add',
          package_id: packageId,
          component_id: selectedComponentId,
          quantity,
          is_required: isRequired
        })
      });

      if (response.ok) {
        toast({ title: 'Компонент добавлен' });
        fetchData();
        setSelectedComponentId(null);
        setQuantity(1);
        setIsRequired(true);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить компонент',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveComponent = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}?action=package_component&id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: 'Компонент удалён' });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить компонент',
        variant: 'destructive'
      });
    }
  };

  const handleAddAlternative = async (componentId: number, alternativeId: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'component_alternative',
          component_id: componentId,
          alternative_component_id: alternativeId
        })
      });

      if (response.ok) {
        toast({ title: 'Аналог добавлен' });
        fetchData();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить аналог',
        variant: 'destructive'
      });
    }
  };

  const availableComponents = allComponents.filter(
    c => !components.some(pc => pc.component_id === c.component_id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Редактировать состав: {packageName}</DialogTitle>
          <DialogDescription>
            Добавляйте фурнитуру и указывайте аналоги для замены
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label>Компонент фурнитуры</Label>
                  <Select
                    value={selectedComponentId?.toString()}
                    onValueChange={(val) => setSelectedComponentId(Number(val))}
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
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isRequired}
                      onCheckedChange={(checked) => setIsRequired(checked as boolean)}
                    />
                    <Label className="text-sm">Обязательный</Label>
                  </div>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddComponent}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="h-[400px]">
            <div className="space-y-3 pr-4">
              {components.map((item, index) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{item.component_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.article && <span className="font-mono">{item.article}</span>}
                            {' • '}
                            <span>{item.quantity} {item.unit}</span>
                            {item.is_required && (
                              <Badge variant="secondary" className="ml-2">Обязательный</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveComponent(item.id!)}
                      >
                        <Icon name="Trash2" size={16} className="text-destructive" />
                      </Button>
                    </div>

                    {item.alternatives && item.alternatives.length > 0 && (
                      <div className="mt-3 pl-11">
                        <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <Icon name="ArrowDownUp" size={14} />
                          Аналоги:
                        </div>
                        <div className="space-y-1">
                          {item.alternatives.map(alt => (
                            <div key={alt.component_id} className="text-sm p-2 rounded bg-muted/30">
                              {alt.component_name} ({alt.article || 'без артикула'}) — {alt.price_per_unit.toLocaleString()} ₽
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
          <Button onClick={() => { onSave(); onOpenChange(false); }}>
            Сохранить и закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
