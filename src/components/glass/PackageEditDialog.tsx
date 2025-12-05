import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { GlassPackage } from './types';
import PackageComponentsEditDialog from './PackageComponentsEditDialog';

const PRODUCT_TYPES = [
  { value: 'shower_cabin', label: 'Душевая кабина прямая' },
  { value: 'corner_shower', label: 'Душевая кабина угловая' },
  { value: 'swing_door', label: 'Дверь распашная' },
  { value: 'sliding_door', label: 'Дверь раздвижная' },
  { value: 'bath_screen', label: 'Шторка для ванной' },
  { value: 'partition', label: 'Перегородка стеклянная' },
  { value: 'radius_door', label: 'Дверь радиусная' },
  { value: 'p_shaped_shower', label: 'Душевая кабина П-образная' },
  { value: 'folding_door', label: 'Дверь складная' },
  { value: 'trapezoid_shower', label: 'Душевая кабина трапеция' },
  { value: 'round_shower', label: 'Душевая кабина круглая' }
];

interface PackageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingPackage: Partial<GlassPackage> | null;
  setEditingPackage: (pkg: Partial<GlassPackage> | null) => void;
  onSave: () => void;
}

export default function PackageEditDialog({
  open,
  onOpenChange,
  editingPackage,
  setEditingPackage,
  onSave
}: PackageEditDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingPackage?.package_id ? 'Редактировать комплект' : 'Новый комплект'}
          </DialogTitle>
          <DialogDescription>
            Заполните параметры комплекта для калькуляции
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Icon name="Package" size={16} />
              Основное
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Icon name="Boxes" size={16} />
              Состав
            </TabsTrigger>
            <TabsTrigger value="door" className="flex items-center gap-2">
              <Icon name="DoorOpen" size={16} />
              Дверь
            </TabsTrigger>
            <TabsTrigger value="sketch" className="flex items-center gap-2">
              <Icon name="Image" size={16} />
              Эскиз
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            <TabsContent value="basic" className="space-y-4 mt-0">
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
                <Label htmlFor="glass_sections_count">Количество стеклянных секций (лицевая сторона)</Label>
                <Select
                  value={String(editingPackage?.glass_sections_count || 1)}
                  onValueChange={(value) => setEditingPackage({ ...editingPackage, glass_sections_count: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 секция</SelectItem>
                    <SelectItem value="2">2 секции</SelectItem>
                    <SelectItem value="3">3 секции</SelectItem>
                    <SelectItem value="4">4 секции</SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Активен</Label>
                <Switch
                  id="is_active"
                  checked={editingPackage?.is_active ?? true}
                  onCheckedChange={(checked) => setEditingPackage({ ...editingPackage, is_active: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="components" className="mt-0">
              {editingPackage?.package_id ? (
                <PackageComponentsEditDialog
                  packageId={editingPackage.package_id}
                  packageName={editingPackage.package_name || ''}
                  embedded={true}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="Info" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Сначала сохраните комплект, чтобы добавить компоненты</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="door" className="space-y-4 mt-0">
              <h3 className="text-sm font-semibold mb-3">Параметры двери по умолчанию</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="door_position">Позиция двери</Label>
                  <Select
                    value={editingPackage?.default_door_position || 'center'}
                    onValueChange={(value: 'left' | 'center' | 'right') => 
                      setEditingPackage({ ...editingPackage, default_door_position: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Слева</SelectItem>
                      <SelectItem value="center">По центру</SelectItem>
                      <SelectItem value="right">Справа</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="door_offset">Отступ (мм)</Label>
                  <Input
                    id="door_offset"
                    type="number"
                    value={editingPackage?.default_door_offset || '0'}
                    onChange={(e) => setEditingPackage({ ...editingPackage, default_door_offset: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="door_panels">Количество створок</Label>
                  <Select
                    value={String(editingPackage?.default_door_panels || 1)}
                    onValueChange={(value: '1' | '2') => 
                      setEditingPackage({ ...editingPackage, default_door_panels: parseInt(value) as 1 | 2 })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 створка</SelectItem>
                      <SelectItem value="2">2 створки</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sketch" className="space-y-4 mt-0">
              <div className="grid gap-2">
                <Label htmlFor="sketch_image_url">Эскиз изделия (URL изображения)</Label>
                <Input
                  id="sketch_image_url"
                  value={editingPackage?.sketch_image_url || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, sketch_image_url: e.target.value })}
                  placeholder="https://example.com/sketch.png"
                />
                {editingPackage?.sketch_image_url && (
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <img
                      src={editingPackage.sketch_image_url}
                      alt="Предпросмотр эскиза"
                      className="max-h-64 mx-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSave}>
            {editingPackage?.package_id ? 'Сохранить' : 'Создать'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
