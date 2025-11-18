import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import * as XLSX from 'xlsx';
import { GlassPackage, API_URL } from './types';
import PackageComponentsTableDialog from './PackageComponentsTableDialog';
import PackageComponentsEditDialog from './PackageComponentsEditDialog';

const PRODUCT_TYPES = [
  { value: 'shower_cabin', label: 'Душевая кабина' },
  { value: 'corner_shower', label: 'Угловая душевая' },
  { value: 'swing_door', label: 'Распашная дверь' },
  { value: 'sliding_door', label: 'Раздвижная дверь' },
  { value: 'bath_screen', label: 'Шторка для ванной' },
  { value: 'partition', label: 'Перегородка' },
  { value: 'radius_door', label: 'Радиусная дверь' },
  { value: 'p_shaped_shower', label: 'П-образная душевая' },
  { value: 'folding_door', label: 'Складная дверь' },
  { value: 'trapezoid_shower', label: 'Душевая трапеция' },
  { value: 'round_shower', label: 'Круглая душевая' }
];

const GLASS_TYPES = [
  'Прозрачное',
  'Осветленное',
  'Матовое',
  'Матовое декор',
  'Цветное'
];

export default function GlassPackageManager() {
  const [packages, setPackages] = useState<GlassPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<GlassPackage> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewPackageId, setViewPackageId] = useState<number | null>(null);
  const [viewPackageName, setViewPackageName] = useState('');
  const [viewPackageArticle, setViewPackageArticle] = useState('');
  const [viewPackageSketch, setViewPackageSketch] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editComponentsPackageId, setEditComponentsPackageId] = useState<number | null>(null);
  const [editComponentsPackageName, setEditComponentsPackageName] = useState('');
  const [isEditComponentsDialogOpen, setIsEditComponentsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=glass_packages`);
      const data = await response.json();
      setPackages(data.packages || []);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить комплекты',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePackage = async () => {
    if (!editingPackage?.package_name || !editingPackage?.product_type) {
      toast({
        title: 'Ошибка',
        description: 'Заполните обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    try {
      const method = editingPackage.package_id ? 'PUT' : 'POST';
      const response = await fetch(API_URL, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'glass_package',
          package: editingPackage
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: editingPackage.package_id ? 'Комплект обновлён' : 'Комплект создан'
        });
        setIsDialogOpen(false);
        setEditingPackage(null);
        fetchPackages();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить комплект',
        variant: 'destructive'
      });
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (!confirm('Удалить комплект?')) return;

    try {
      const response = await fetch(`${API_URL}?action=glass_package&id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast({ title: 'Комплект удалён' });
        fetchPackages();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить комплект',
        variant: 'destructive'
      });
    }
  };

  const openCreateDialog = () => {
    setEditingPackage({
      package_name: '',
      package_article: '',
      product_type: 'shower_cabin',
      glass_type: 'Прозрачное',
      glass_thickness: 8,
      glass_price_per_sqm: 4200,
      hardware_set: '',
      hardware_price: 5000,
      markup_percent: 20,
      installation_price: 3000,
      description: '',
      sketch_image_url: '',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (pkg: GlassPackage) => {
    setEditingPackage(pkg);
    setIsDialogOpen(true);
  };

  const openViewDialog = (pkg: GlassPackage) => {
    setViewPackageId(pkg.package_id);
    setViewPackageName(pkg.package_name);
    setViewPackageArticle(pkg.package_article || 'Не указан');
    setViewPackageSketch(pkg.sketch_image_url || '');
    setIsViewDialogOpen(true);
  };

  const openEditComponentsDialog = (pkg: GlassPackage) => {
    setEditComponentsPackageId(pkg.package_id);
    setEditComponentsPackageName(pkg.package_name);
    setIsEditComponentsDialogOpen(true);
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let packageArticle = '';
      let packageName = '';
      const components: Array<{
        article: string;
        name: string;
        characteristics: string;
        quantity: number;
        unit: string;
        price: number;
        isAlternative: boolean;
        mainComponentArticle?: string;
      }> = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        if (row[1] && typeof row[1] === 'string' && row[1].includes('ДАП')) {
          packageArticle = row[1].trim();
          packageName = row[3] || '';
          continue;
        }

        const positionNum = row[1];
        const article = row[2];
        const name = row[3];
        const characteristics = row[4];
        const quantity = parseFloat(row[5]) || 1;
        const unit = row[6] || 'шт';
        const priceStr = row[7];
        const price = typeof priceStr === 'number' ? priceStr : parseFloat(String(priceStr).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

        if (typeof positionNum === 'number' && article && name) {
          components.push({
            article: String(article).trim(),
            name: String(name).trim(),
            characteristics: characteristics ? String(characteristics).trim() : '',
            quantity,
            unit,
            price,
            isAlternative: false,
            mainComponentArticle: undefined
          });
        } else if (!positionNum && article && name && components.length > 0) {
          const lastMainComponent = [...components].reverse().find(c => !c.isAlternative);
          if (lastMainComponent) {
            components.push({
              article: String(article).trim(),
              name: String(name).trim(),
              characteristics: characteristics ? String(characteristics).trim() : '',
              quantity,
              unit,
              price,
              isAlternative: true,
              mainComponentArticle: lastMainComponent.article
            });
          }
        }
      }

      if (!packageArticle || components.length === 0) {
        toast({
          title: 'Ошибка импорта',
          description: 'Не удалось найти артикул комплекта или компоненты в файле',
          variant: 'destructive'
        });
        return;
      }

      const existingPackage = packages.find(p => p.package_article === packageArticle);
      let targetPackageId: number;

      if (existingPackage) {
        targetPackageId = existingPackage.package_id!;
        toast({
          title: 'Комплект найден',
          description: `Обновляю состав комплекта ${packageArticle}`
        });
      } else {
        const newPackageResponse = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'glass_package',
            package: {
              package_name: packageName || packageArticle,
              package_article: packageArticle,
              product_type: 'shower_cabin',
              glass_type: 'Прозрачное',
              glass_thickness: 8,
              glass_price_per_sqm: 4200,
              hardware_set: '',
              hardware_price: 0,
              markup_percent: 20,
              installation_price: 3000,
              description: `Импортировано из Excel`,
              is_active: true
            }
          })
        });

        if (!newPackageResponse.ok) {
          throw new Error('Не удалось создать комплект');
        }

        const newPackageData = await newPackageResponse.json();
        targetPackageId = newPackageData.package_id;

        toast({
          title: 'Комплект создан',
          description: `Создан новый комплект ${packageArticle}`
        });
      }

      const componentMap = new Map<string, number>();

      for (const comp of components.filter(c => !c.isAlternative)) {
        const componentId = await findOrCreateComponent(comp);
        componentMap.set(comp.article, componentId);

        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'package_component',
            action_type: 'add',
            package_id: targetPackageId,
            component_id: componentId,
            quantity: comp.quantity,
            is_required: true
          })
        });
      }

      for (const alt of components.filter(c => c.isAlternative)) {
        const mainComponentId = componentMap.get(alt.mainComponentArticle!);
        if (!mainComponentId) continue;

        const altComponentId = await findOrCreateComponent(alt);

        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'component_alternative',
            component_id: mainComponentId,
            alternative_component_id: altComponentId
          })
        });
      }

      toast({
        title: 'Импорт завершён',
        description: `Импортировано ${components.filter(c => !c.isAlternative).length} компонентов и ${components.filter(c => c.isAlternative).length} аналогов`
      });

      fetchPackages();
      
    } catch (error) {
      console.error('Excel import error:', error);
      toast({
        title: 'Ошибка импорта',
        description: 'Не удалось импортировать файл. Проверьте формат Excel.',
        variant: 'destructive'
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const findOrCreateComponent = async (comp: any): Promise<number> => {
    const componentsResponse = await fetch(`${API_URL}?action=glass_components`);
    const componentsData = await componentsResponse.json();
    const existingComponent = componentsData.components?.find((c: any) => c.article === comp.article);

    if (existingComponent) {
      return existingComponent.component_id;
    }

    const componentType = detectComponentType(comp.name);
    
    const createResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'glass_component',
        component: {
          component_name: comp.name,
          component_type: componentType,
          article: comp.article,
          characteristics: comp.characteristics,
          unit: comp.unit,
          price_per_unit: comp.price,
          is_active: true
        }
      })
    });

    const createData = await createResponse.json();
    return createData.component_id;
  };

  const detectComponentType = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('петл') || nameLower.includes('шарнир')) return 'hinge';
    if (nameLower.includes('профиль')) return 'profile';
    if (nameLower.includes('лента') || nameLower.includes('уплотнитель')) return 'tape';
    if (nameLower.includes('заглушка')) return 'plug';
    if (nameLower.includes('ось')) return 'axis';
    if (nameLower.includes('замок') || nameLower.includes('защелк')) return 'lock';
    if (nameLower.includes('ручка') || nameLower.includes('ручк')) return 'handle';
    if (nameLower.includes('стекло')) return 'glass';
    if (nameLower.includes('крепление') || nameLower.includes('порог') || nameLower.includes('соединитель')) return 'other';
    if (nameLower.includes('труб')) return 'other';
    return 'other';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Управление комплектами</h2>
          <p className="text-sm text-muted-foreground">Всего комплектов: {packages.length}</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelImport}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Icon name="Upload" size={16} className="mr-2" />
            Импорт из Excel
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Icon name="Plus" size={16} className="mr-2" />
                Добавить комплект
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPackage?.package_id ? 'Редактировать комплект' : 'Новый комплект'}
              </DialogTitle>
              <DialogDescription>
                Заполните параметры комплекта для калькуляции
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="package_name">Название комплекта *</Label>
                  <Input
                    id="package_name"
                    value={editingPackage?.package_name || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, package_name: e.target.value })}
                    placeholder="Душевая кабина Премиум"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="package_article">Артикул комплекта</Label>
                  <Input
                    id="package_article"
                    value={editingPackage?.package_article || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, package_article: e.target.value })}
                    placeholder="ДАПЛ2СДРС2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="product_type">Тип изделия *</Label>
                  <Select
                    value={editingPackage?.product_type || ''}
                    onValueChange={(value) => setEditingPackage({ ...editingPackage, product_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="glass_type">Тип стекла</Label>
                  <Select
                    value={editingPackage?.glass_type || ''}
                    onValueChange={(value) => setEditingPackage({ ...editingPackage, glass_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GLASS_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="glass_thickness">Толщина стекла (мм)</Label>
                  <Input
                    id="glass_thickness"
                    type="number"
                    value={editingPackage?.glass_thickness || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, glass_thickness: parseInt(e.target.value) })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="glass_price_per_sqm">Цена стекла за м² (₽)</Label>
                  <Input
                    id="glass_price_per_sqm"
                    type="number"
                    value={editingPackage?.glass_price_per_sqm || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, glass_price_per_sqm: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hardware_set">Комплект фурнитуры</Label>
                <Input
                  id="hardware_set"
                  value={editingPackage?.hardware_set || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, hardware_set: e.target.value })}
                  placeholder="Петли, ручки, профили..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hardware_price">Цена фурнитуры (₽)</Label>
                  <Input
                    id="hardware_price"
                    type="number"
                    value={editingPackage?.hardware_price || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, hardware_price: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="markup_percent">Наценка (%)</Label>
                  <Input
                    id="markup_percent"
                    type="number"
                    value={editingPackage?.markup_percent || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, markup_percent: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="installation_price">Монтаж (₽)</Label>
                  <Input
                    id="installation_price"
                    type="number"
                    value={editingPackage?.installation_price || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, installation_price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sketch_image_url">Эскиз изделия (URL изображения)</Label>
                <Input
                  id="sketch_image_url"
                  value={editingPackage?.sketch_image_url || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, sketch_image_url: e.target.value })}
                  placeholder="https://example.com/sketch.png"
                />
                {editingPackage?.sketch_image_url && (
                  <div className="border rounded-lg p-2 bg-muted/30">
                    <img
                      src={editingPackage.sketch_image_url}
                      alt="Предпросмотр эскиза"
                      className="max-h-32 mx-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={editingPackage?.description || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                  placeholder="Дополнительная информация о комплекте..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={editingPackage?.is_active !== false}
                  onCheckedChange={(checked) => setEditingPackage({ ...editingPackage, is_active: checked })}
                />
                <Label htmlFor="is_active">Активен</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleSavePackage}>
                Сохранить
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map(pkg => (
            <Card key={pkg.package_id} className={!pkg.is_active ? 'opacity-50' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {pkg.package_name}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openViewDialog(pkg)}
                      title="Посмотреть состав"
                    >
                      <Icon name="Package" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditComponentsDialog(pkg)}
                      title="Редактировать фурнитуру"
                    >
                      <Icon name="Settings" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(pkg)}
                    >
                      <Icon name="Edit" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePackage(pkg.package_id)}
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <span>{PRODUCT_TYPES.find(t => t.value === pkg.product_type)?.label}</span>
                  {pkg.package_article && (
                    <span className="font-mono font-semibold text-xs bg-muted px-2 py-1 rounded">
                      {pkg.package_article}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Стекло:</span>
                  <span className="font-medium">{pkg.glass_type} {pkg.glass_thickness}мм</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Цена за м²:</span>
                  <span className="font-medium">{pkg.glass_price_per_sqm.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Фурнитура:</span>
                  <span className="font-medium">{pkg.hardware_price.toLocaleString()} ₽</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Наценка:</span>
                  <span className="font-medium">{pkg.markup_percent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Монтаж:</span>
                  <span className="font-medium">{pkg.installation_price.toLocaleString()} ₽</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {viewPackageId && (
        <PackageComponentsTableDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          packageId={viewPackageId}
          packageName={viewPackageName}
          packageArticle={viewPackageArticle}
          sketchImageUrl={viewPackageSketch}
        />
      )}

      {editComponentsPackageId && (
        <PackageComponentsEditDialog
          open={isEditComponentsDialogOpen}
          onOpenChange={setIsEditComponentsDialogOpen}
          packageId={editComponentsPackageId}
          packageName={editComponentsPackageName}
          onSave={fetchPackages}
        />
      )}
    </div>
  );
}