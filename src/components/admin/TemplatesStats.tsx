import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useAppMode } from '@/contexts/AppModeContext';

interface TemplateUsage {
  template_id: number;
  template_name: string;
  usage_count: number;
  total_calculations: number;
  avg_price: number;
  last_used: string;
}

export default function TemplatesStats() {
  const { mode } = useAppMode();
  const [templates, setTemplates] = useState<TemplateUsage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplatesStats();
  }, [mode]);

  const fetchTemplatesStats = async () => {
    setLoading(true);
    try {
      const mockData: TemplateUsage[] = mode === 'glass' ? [
        {
          template_id: 39,
          template_name: 'Душевая кабина - Прямая 2 стекла дверь распашная на стекле',
          usage_count: 156,
          total_calculations: 234,
          avg_price: 28500,
          last_used: '2024-12-05T14:30:00Z'
        },
        {
          template_id: 38,
          template_name: 'Душевая кабина - Прямая 2 стекла дверь распашная на стене',
          usage_count: 98,
          total_calculations: 145,
          avg_price: 26800,
          last_used: '2024-12-04T11:20:00Z'
        }
      ] : [
        {
          template_id: 1,
          template_name: 'Столешница кухонная стандартная',
          usage_count: 203,
          total_calculations: 312,
          avg_price: 15400,
          last_used: '2024-12-05T16:15:00Z'
        },
        {
          template_id: 2,
          template_name: 'Столешница барная',
          usage_count: 87,
          total_calculations: 119,
          avg_price: 12900,
          last_used: '2024-12-03T09:45:00Z'
        }
      ];
      
      setTemplates(mockData);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить статистику шаблонов',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUsage = templates.reduce((sum, t) => sum + t.usage_count, 0);
  const totalCalcs = templates.reduce((sum, t) => sum + t.total_calculations, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего шаблонов</CardDescription>
            <CardTitle className="text-3xl">{templates.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Icon name="Layout" size={16} className="mr-2" />
              Активных шаблонов
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего использований</CardDescription>
            <CardTitle className="text-3xl">{totalUsage}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Icon name="MousePointerClick" size={16} className="mr-2" />
              Шаблоны выбраны пользователями
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Всего расчётов</CardDescription>
            <CardTitle className="text-3xl">{totalCalcs}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Icon name="Calculator" size={16} className="mr-2" />
              Калькуляций выполнено
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Статистика по шаблонам</CardTitle>
          <CardDescription>Детальная информация об использовании каждого шаблона</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Название шаблона</TableHead>
                <TableHead className="text-right">Использований</TableHead>
                <TableHead className="text-right">Расчётов</TableHead>
                <TableHead className="text-right">Средняя цена</TableHead>
                <TableHead>Последнее использование</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.template_id}>
                  <TableCell className="font-mono">{template.template_id}</TableCell>
                  <TableCell className="font-medium">{template.template_name}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{template.usage_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline">{template.total_calculations}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {template.avg_price.toLocaleString('ru-RU')} ₽
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(template.last_used).toLocaleString('ru-RU')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
