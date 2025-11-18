import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { GlassComponent, PackageComponent, API_URL } from './types';

interface PackageComponentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: number;
  packageName: string;
  packageArticle: string;
}

export default function PackageComponentsDialog({
  open,
  onOpenChange,
  packageId,
  packageName,
  packageArticle
}: PackageComponentsDialogProps) {
  const [components, setComponents] = useState<PackageComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<PackageComponent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && packageId) {
      fetchPackageComponents();
    }
  }, [open, packageId]);

  const fetchPackageComponents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=package_components&package_id=${packageId}`);
      const data = await response.json();
      setComponents(data.components || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить состав комплекта',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return components.reduce((sum, item) => {
      const price = item.component?.price_per_unit || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{packageName}</span>
            <Badge variant="outline" className="font-mono">{packageArticle}</Badge>
          </DialogTitle>
          <DialogDescription>
            Рекомендуемый набор фурнитуры и возможные аналоги
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {components.map((item, index) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all ${
                      selectedComponent?.id === item.id
                        ? 'ring-2 ring-primary shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedComponent(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center font-semibold text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-semibold">{item.component?.component_name}</div>
                              {item.component?.article && (
                                <div className="text-xs text-muted-foreground font-mono">
                                  {item.component.article}
                                </div>
                              )}
                            </div>
                            {item.is_required && (
                              <Badge variant="secondary">Обязательный</Badge>
                            )}
                          </div>
                          {item.component?.characteristics && (
                            <div className="text-sm text-muted-foreground">
                              {item.component.characteristics}
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-muted-foreground">
                              Количество: <span className="font-semibold text-foreground">{item.quantity} {item.component?.unit}</span>
                            </span>
                            <span className="font-semibold">
                              {((item.component?.price_per_unit || 0) * item.quantity).toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Итого фурнитура:</div>
                <div className="text-2xl font-bold">{getTotalPrice().toLocaleString('ru-RU')} ₽</div>
                <div className="text-xs text-muted-foreground mt-1">Позиций: {components.length}</div>
              </CardContent>
            </Card>

            {selectedComponent && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="text-sm font-semibold mb-2">Выбрана позиция:</div>
                    <div className="text-sm">{selectedComponent.component?.component_name}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Icon name="ArrowDownUp" size={14} />
                      Возможные аналоги:
                    </div>
                    {selectedComponent.alternatives && selectedComponent.alternatives.length > 0 ? (
                      <div className="space-y-2">
                        {selectedComponent.alternatives.map((alt) => (
                          <div
                            key={alt.component_id}
                            className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="text-sm font-medium">{alt.component_name}</div>
                            {alt.article && (
                              <div className="text-xs text-muted-foreground font-mono mt-1">
                                {alt.article}
                              </div>
                            )}
                            {alt.characteristics && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {alt.characteristics}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {alt.unit}
                              </span>
                              <span className="text-sm font-semibold">
                                {alt.price_per_unit.toLocaleString('ru-RU')} ₽
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-3 rounded-lg border border-dashed">
                        Аналоги не добавлены
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {!selectedComponent && (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center text-sm text-muted-foreground">
                  <Icon name="MousePointerClick" size={24} className="mx-auto mb-2 opacity-50" />
                  Нажмите на позицию слева, чтобы увидеть аналоги
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
