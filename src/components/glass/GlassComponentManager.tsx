import { useState, useEffect, useRef } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import * as XLSX from 'xlsx';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<number | null>(null);
  const [editingComponent, setEditingComponent] = useState<GlassComponent>({
    component_name: '',
    component_type: 'profile',
    article: '',
    characteristics: '',
    unit: 'шт',
    price_per_unit: 0,
    is_active: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleSaveComponent = async () => {
    if (!editingComponent.component_name || editingComponent.price_per_unit < 0) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const method = editingComponent.component_id ? 'PUT' : 'POST';
      const body = editingComponent.component_id
        ? { component: editingComponent }
        : { action_type: 'create', component: editingComponent };

      const response = await fetch(API_URL, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'glass_components', ...body })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: editingComponent.component_id ? 'Компонент обновлён' : 'Компонент добавлен'
        });
        setDialogOpen(false);
        fetchComponents();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить компонент',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (componentId: number) => {
    setComponentToDelete(componentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!componentToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=glass_components&id=${componentToDelete}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({
          title: 'Удалено',
          description: 'Компонент успешно удалён'
        });
        setDeleteDialogOpen(false);
        fetchComponents();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить компонент',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setComponentToDelete(null);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const componentsToImport: GlassComponent[] = jsonData.map((row: any) => ({
        component_name: row['Наименование'] || row['название'] || '',
        component_type: mapTypeFromExcel(row['Тип'] || row['тип'] || 'other'),
        article: (row['Артикул'] || row['артикул'] || '').toString(),
        characteristics: row['Характеристики'] || row['характеристики'] || '',
        unit: row['Единица'] || row['единица'] || 'шт',
        price_per_unit: parseFloat(row['Цена'] || row['цена'] || 0),
        is_active: true
      })).filter(c => c.component_name && c.price_per_unit > 0);

      if (componentsToImport.length === 0) {
        toast({
          title: 'Ошибка',
          description: 'Не найдено корректных данных для импорта',
          variant: 'destructive'
        });
        return;
      }

      setLoading(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'glass_components',
          action_type: 'import',
          components: componentsToImport
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Импорт завершён',
          description: `Импортировано компонентов: ${result.imported}`
        });
        fetchComponents();
      }
    } catch (error) {
      toast({
        title: 'Ошибка импорта',
        description: 'Проверьте формат файла Excel',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const mapTypeFromExcel = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('профиль')) return 'profile';
    if (lowerType.includes('лента')) return 'tape';
    if (lowerType.includes('заглушка')) return 'plug';
    if (lowerType.includes('петл')) return 'hinge';
    if (lowerType.includes('ось')) return 'axis';
    if (lowerType.includes('замок')) return 'lock';
    if (lowerType.includes('ручка') || lowerType.includes('рейлинг')) return 'handle';
    if (lowerType.includes('стекло')) return 'glass';
    if (lowerType.includes('услуга') || lowerType.includes('монтаж') || lowerType.includes('доставка')) return 'service';
    return 'other';
  };

  const handleExportTemplate = () => {
    const template = [
      {
        'Наименование': 'Профиль к-т',
        'Тип': 'Профиль',
        'Артикул': '6100-АД31 Т1',
        'Характеристики': '40, 2-е крышки Серебро матовое',
        'Единица': 'погм',
        'Цена': 700.00
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Компоненты');
    XLSX.writeFile(workbook, 'шаблон_компонентов.xlsx');

    toast({
      title: 'Шаблон скачан',
      description: 'Заполните данные и загрузите обратно'
    });
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportTemplate}>
            <Icon name="FileDown" size={16} className="mr-2" />
            Скачать шаблон
          </Button>
          <Button variant="outline" onClick={handleImportClick}>
            <Icon name="Upload" size={16} className="mr-2" />
            Импорт из Excel
          </Button>
          <Button onClick={handleAddNew}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {loading && !dialogOpen ? (
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
                            onClick={() => handleEdit(comp)}
                          >
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(comp.component_id!)}
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
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              Отмена
            </Button>
            <Button onClick={handleSaveComponent} disabled={loading}>
              {loading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить компонент?</AlertDialogTitle>
            <AlertDialogDescription>
              Компонент будет помечен как неактивный. Это действие можно отменить через редактирование.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={loading}>
              {loading ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}