import { useState, useEffect, Fragment } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { PackageComponent, API_URL } from './types';

interface PackageComponentsTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageId: number;
  packageName: string;
  packageArticle: string;
  sketchImageUrl?: string;
}

export default function PackageComponentsTableDialog({
  open,
  onOpenChange,
  packageId,
  packageName,
  packageArticle,
  sketchImageUrl
}: PackageComponentsTableDialogProps) {
  const [components, setComponents] = useState<PackageComponent[]>([]);
  const [loading, setLoading] = useState(false);
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
      const price = item.price_per_unit || 0;
      return sum + (price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <Icon name="Loader2" size={32} className="animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="text-2xl font-bold text-orange-600">{packageArticle}</span>
            <span className="text-lg">{packageName}</span>
          </DialogTitle>
          <DialogDescription>
            Рекомендуемый набор фурнитуры (жирным) и возможные аналоги (курсивом)
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <ScrollArea className="h-[600px]">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left w-12 border-r">№</th>
                      <th className="p-2 text-left border-r">Артикул</th>
                      <th className="p-2 text-left border-r">Наименование</th>
                      <th className="p-2 text-left border-r">Характеристики</th>
                      <th className="p-2 text-center border-r w-20">Кол-во</th>
                      <th className="p-2 text-center border-r w-20">Ед.</th>
                      <th className="p-2 text-right w-28">Цена, ₽</th>
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((item, index) => (
                      <Fragment key={item.id}>
                        <tr className="border-t bg-green-50/50 hover:bg-green-100/50 transition-colors">
                          <td className="p-3 border-r">
                            <div className="w-8 h-8 bg-yellow-400 rounded flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                          </td>
                          <td className="p-3 border-r">
                            <span className="font-bold">{item.article || '—'}</span>
                          </td>
                          <td className="p-3 border-r">
                            <span className="font-bold">{item.component_name}</span>
                            {item.is_required && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Обязательный
                              </Badge>
                            )}
                          </td>
                          <td className="p-3 border-r">
                            <span className="font-bold">{item.characteristics || '—'}</span>
                          </td>
                          <td className="p-3 text-center border-r">
                            <span className="font-bold">{item.quantity}</span>
                          </td>
                          <td className="p-3 text-center border-r">
                            <span className="font-bold">{item.unit}</span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-bold">
                              {((item.price_per_unit || 0) * item.quantity).toLocaleString('ru-RU')}
                            </span>
                          </td>
                        </tr>
                        {item.alternatives && item.alternatives.map((alt, altIndex) => (
                          <tr
                            key={`${item.id}-alt-${altIndex}`}
                            className="border-t bg-green-50/30"
                          >
                            <td className="p-2 pl-6 border-r"></td>
                            <td className="p-2 border-r">
                              <span className="italic text-muted-foreground">{alt.article || '—'}</span>
                            </td>
                            <td className="p-2 border-r">
                              <span className="italic text-muted-foreground">{alt.component_name}</span>
                            </td>
                            <td className="p-2 border-r">
                              <span className="italic text-muted-foreground">{alt.characteristics || '—'}</span>
                            </td>
                            <td className="p-2 text-center border-r">
                              <span className="italic text-muted-foreground">{item.quantity}</span>
                            </td>
                            <td className="p-2 text-center border-r">
                              <span className="italic text-muted-foreground">{alt.unit}</span>
                            </td>
                            <td className="p-2 text-right">
                              <span className="italic text-muted-foreground">
                                {((alt.price_per_unit || 0) * item.quantity).toLocaleString('ru-RU')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                    <tr className="border-t-2 border-primary bg-orange-50">
                      <td colSpan={6} className="p-3 text-right font-bold border-r">
                        ИТОГО:
                      </td>
                      <td className="p-3 text-right font-bold text-lg">
                        {getTotalPrice().toLocaleString('ru-RU')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-4">
            {sketchImageUrl ? (
              <div className="border rounded-lg overflow-hidden bg-white">
                <img
                  src={sketchImageUrl}
                  alt="Эскиз изделия"
                  className="w-full h-auto object-contain"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <Icon name="ImageOff" size={48} className="mx-auto mb-2 opacity-50" />
                <div className="text-sm">Эскиз не загружен</div>
              </div>
            )}

            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mt-0.5"></div>
                  <div>
                    <div className="font-semibold">Рекомендуемая фурнитура</div>
                    <div className="text-xs text-muted-foreground">Основной вариант (жирный шрифт)</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mt-0.5"></div>
                  <div>
                    <div className="font-semibold">Аналоги для замены</div>
                    <div className="text-xs text-muted-foreground">Альтернативные варианты (курсив)</div>
                  </div>
                </div>
              </div>
            </div>
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