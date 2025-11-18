import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { GlassPackage } from './types';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button onClick={onSave}>
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
