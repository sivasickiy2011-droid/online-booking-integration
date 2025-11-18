import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import * as XLSX from 'xlsx';
import { GlassComponent, API_URL } from './types';
import ComponentEditDialog from './ComponentEditDialog';
import ComponentDeleteDialog from './ComponentDeleteDialog';
import ComponentsList from './ComponentsList';

export default function GlassComponentManager() {
  const [components, setComponents] = useState<GlassComponent[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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
    const idsToDelete = componentToDelete ? [componentToDelete] : selectedIds;
    if (idsToDelete.length === 0) return;

    setLoading(true);
    try {
      await Promise.all(
        idsToDelete.map(id =>
          fetch(`${API_URL}?action=glass_components&id=${id}`, {
            method: 'DELETE'
          })
        )
      );

      toast({
        title: 'Удалено',
        description: `Удалено компонентов: ${idsToDelete.length}`
      });
      setDeleteDialogOpen(false);
      setSelectedIds([]);
      fetchComponents();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить компоненты',
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
        component_type: mapTypeFromExcel(row['тип'] || row['Тип'] || 'other'),
        article: (row['Артикул или партийный номер Поставщика'] || row['Артикул'] || row['артикул'] || '').toString(),
        characteristics: row['Характеристики'] || row['характеристики'] || '',
        unit: row['Еденица измерения'] || row['Единица'] || row['единица'] || 'шт',
        price_per_unit: parseFloat(row['Цена за еденицу ЗАКУП'] || row['Цена'] || row['цена'] || 0),
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

  const handleToggleSelect = (componentId: number) => {
    setSelectedIds(prev =>
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === components.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(components.map(c => c.component_id!));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      toast({
        title: 'Внимание',
        description: 'Выберите компоненты для удаления',
        variant: 'destructive'
      });
      return;
    }
    setComponentToDelete(null);
    setDeleteDialogOpen(true);
  };

  const handleExportTemplate = () => {
    const template = [
      {
        '№': 1,
        'Товар 1': '',
        'Товар 2': '',
        'Группа 1': '',
        'Фото': '',
        'Группа 2': '',
        'Наименование': 'Профиль к-т',
        'Характеристики': '40, 2-е крышки Серебро матовое',
        'Артикул или партийный номер Поставщика': '6100-АД31 Т1',
        'Еденица измерения': 'погм',
        'Количество': 1,
        'Цена за еденицу ЗАКУП': 700.00,
        'Сумма': 700.00,
        'Поставщик': '',
        'Сайт Поставщика1': '',
        'Сайт Поставщика 2': '',
        'Сайт Поставщика 3': '',
        'Ссылка на фото в Google диск': '',
        'тип': 'Профиль'
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

      {components.length > 0 && (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              <Icon name={selectedIds.length === components.length ? "CheckSquare" : "Square"} size={16} className="mr-2" />
              {selectedIds.length === components.length ? 'Снять выделение' : 'Выделить всё'}
            </Button>
            {selectedIds.length > 0 && (
              <span className="text-sm text-muted-foreground">
                Выбрано: {selectedIds.length}
              </span>
            )}
          </div>
          {selectedIds.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
              <Icon name="Trash2" size={16} className="mr-2" />
              Удалить выбранные
            </Button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <ComponentsList
        components={components}
        loading={loading && !dialogOpen}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
      />

      <ComponentEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingComponent={editingComponent}
        setEditingComponent={setEditingComponent}
        onSave={handleSaveComponent}
        loading={loading}
      />

      <ComponentDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        loading={loading}
        count={componentToDelete ? 1 : selectedIds.length}
      />
    </div>
  );
}